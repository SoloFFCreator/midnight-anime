#!/usr/bin/env node
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { chmod, mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { createMidnightAnimeClient, MidnightAnimeError } from '@midnight-anime/sdk'

const CONFIG_DIR = join(homedir(), '.config', 'midnight-anime')
const TOKEN_FILE = join(CONFIG_DIR, 'credentials.json')
const LOGIN_PAGE = 'https://midnightanime.bond/cli/login'

function printHelp() {
  console.log(`Midnight Anime CLI\n\nUsage:\n  midnight-anime login                 Sign in through the official browser page\n  midnight-anime logout                Remove the local CLI session\n  midnight-anime whoami                Check the current session\n  midnight-anime search <query>        Search anime titles\n  midnight-anime catalogue [view]      Browse trending, popular, seasonal, or movies\n  midnight-anime anime <id>            Fetch one title record\n  midnight-anime playback <id> <s> <e> Request an episode playback response\n\nOptions:\n  --json                                Print machine-readable JSON\n  --timeout <ms>                       Override request timeout\n\nThe CLI requires an authenticated Midnight Anime account before API commands can run.`)
}

function hasFlag(args, flag) { return args.includes(flag) }
function valueFlag(args, flag, fallback) { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] || fallback : fallback }
function cleanArgs(args) { return args.filter((arg, index) => arg !== '--json' && arg !== '--timeout' && args[index - 1] !== '--timeout') }

async function saveCredentials(credentials) {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 })
  await writeFile(TOKEN_FILE, JSON.stringify({ ...credentials, savedAt: new Date().toISOString() }, null, 2), { mode: 0o600 })
  await chmod(TOKEN_FILE, 0o600)
}

async function loadCredentials() {
  try { return JSON.parse(await readFile(TOKEN_FILE, 'utf8')) } catch { return null }
}

async function openBrowser(url) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  try { spawn(command, args, { detached: true, stdio: 'ignore' }).unref(); return true } catch { return false }
}

function callbackResponse(res, status, body, requestOrigin = '') {
  const origin = String(requestOrigin || '')
  const allowedOrigin = ['https://midnightanime.bond', 'https://www.midnightanime.bond'].includes(origin) ? origin : 'https://midnightanime.bond'
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
  res.end(JSON.stringify(body))
}

async function login() {
  const state = randomBytes(24).toString('hex')
  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') return callbackResponse(res, 204, {}, req.headers.origin)
    if (req.method !== 'POST' || req.url !== '/callback') return callbackResponse(res, 404, { error: 'Not found' }, req.headers.origin)
    let raw = ''
    for await (const chunk of req) raw += chunk
    try {
      const body = JSON.parse(raw)
      if (body.state !== state || !body.idToken) return callbackResponse(res, 400, { error: 'Invalid verification state' }, req.headers.origin)
      await saveCredentials({ idToken: body.idToken, email: body.email || null, uid: body.uid || null })
      callbackResponse(res, 200, { ok: true }, req.headers.origin)
      console.log('\n✓ Midnight Anime CLI is authorized. You can close the browser window.')
      setTimeout(() => server.close(() => process.exit(0)), 120)
    } catch (error) { callbackResponse(res, 400, { error: error.message }, req.headers.origin) }
  })
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  const port = server.address().port
  const callback = `http://127.0.0.1:${port}/callback`
  const url = `${LOGIN_PAGE}?callback=${encodeURIComponent(callback)}&state=${state}`
  console.log('Opening the official Midnight Anime CLI login page…')
  console.log(`If it does not open automatically, visit:\n${url}`)
  await openBrowser(url)
  await new Promise((resolve) => server.once('close', resolve))
}

async function requireCredentials() {
  const credentials = await loadCredentials()
  if (!credentials?.idToken) {
    console.error('This command requires login. Run: midnight-anime login')
    process.exitCode = 1
    return null
  }
  return credentials
}

function clientFor(credentials, timeout) {
  return createMidnightAnimeClient({ token: credentials.idToken, timeout: Number(timeout) || 15000, clientHeader: 'cli/1.0.0' })
}

function output(value, json) {
  if (json) return console.log(JSON.stringify(value, null, 2))
  const data = value?.data ?? value
  if (Array.isArray(data)) data.forEach((item, index) => console.log(`${index + 1}. ${item.title?.english || item.title?.romaji || item.title || item.id || 'Untitled'}`))
  else if (data?.title) console.log(`${data.title.english || data.title.romaji || 'Untitled'}${data.id ? ` (#${data.id})` : ''}`)
  else console.log(JSON.stringify(value, null, 2))
}

async function main() {
  const [, , command = 'help', ...rawArgs] = process.argv
  const json = hasFlag(rawArgs, '--json')
  const args = cleanArgs(rawArgs)
  if (command === 'help' || command === '--help' || command === '-h') return printHelp()
  if (command === 'login') return login()
  if (command === 'logout') { await unlink(TOKEN_FILE).catch(() => {}); return console.log('✓ Local CLI session removed.') }
  const credentials = await requireCredentials()
  if (!credentials) return
  const client = clientFor(credentials, valueFlag(rawArgs, '--timeout', 15000))
  let result
  if (command === 'whoami') return output({ authenticated: true, email: credentials.email, uid: credentials.uid }, json)
  if (command === 'search') result = await client.search(args.join(' '))
  else if (command === 'catalogue') result = await client.catalogue({ view: args[0] || 'trending' })
  else if (command === 'anime') result = await client.anime(args[0])
  else if (command === 'playback') result = await client.playback({ malId: args[0], type: 'tv', audio: args[3] || 'sub', season: Number(args[1]), episode: Number(args[2]) })
  else { printHelp(); process.exitCode = 1; return }
  output(result, json)
}

main().catch((error) => {
  if (error instanceof MidnightAnimeError) console.error(`Error [${error.code}${error.status ? ` / HTTP ${error.status}` : ''}]: ${error.message}`)
  else console.error(`Error: ${error.message}`)
  process.exitCode = 1
})
