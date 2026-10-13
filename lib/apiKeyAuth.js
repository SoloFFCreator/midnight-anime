import crypto from 'node:crypto'

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyClcy2YXqryJAkg_wy1W4RLqkYMIsEg2Rk'
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://mid-night-anime-default-rtdb.asia-southeast1.firebasedatabase.app'
const DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || process.env.FIREBASE_DB_SECRET || ''
const KEY_SECRET = process.env.MIDNIGHT_API_KEY_SECRET || ''

function configError() {
  return new Error('API key storage is not configured. Set FIREBASE_DATABASE_SECRET and MIDNIGHT_API_KEY_SECRET in the production environment.')
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function sign(value) {
  return crypto.createHmac('sha256', KEY_SECRET).update(value).digest('base64url')
}

function normalizeOrigin(value) {
  try {
    const url = new URL(String(value || '').trim())
    if (!['https:', 'http:'].includes(url.protocol)) return null
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return null
    return `${url.protocol}//${url.host}`.toLowerCase()
  } catch {
    return null
  }
}

function databasePath(path) {
  if (!DATABASE_SECRET) throw configError()
  return `${DATABASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}.json?auth=${encodeURIComponent(DATABASE_SECRET)}`
}

async function databaseRequest(method, path, body) {
  const response = await fetch(databasePath(path), {
    method,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const value = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`Firebase database returned HTTP ${response.status}`)
  return value
}

export async function verifyFirebaseIdToken(idToken) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  const body = await response.json().catch(() => null)
  const user = body?.users?.[0]
  if (!response.ok || !user?.localId) throw new Error('Invalid Firebase token')
  return { uid: user.localId, email: user.email || null }
}

export function getBearerToken(req) {
  return String(req.headers?.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1] || ''
}

export async function requireApiKey(req, res) {
  const apiKey = String(req.headers?.['x-api-key'] || req.query?.api_key || '').trim()
  if (!apiKey) {
    res.status(401).json({ error: { code: 'API_KEY_REQUIRED', message: 'Include your Midnight Anime API key in the X-API-Key header.' } })
    return false
  }
  if (!DATABASE_SECRET || !KEY_SECRET) {
    res.status(503).json({ error: { code: 'API_KEY_SERVICE_UNAVAILABLE', message: 'API key validation is temporarily unavailable.' } })
    return false
  }
  const record = await databaseRequest('GET', `apiKeys/index/${hash(apiKey)}`)
  if (!record?.uid || !record?.origin || !apiKey.startsWith('ma_live_')) {
    res.status(401).json({ error: { code: 'API_KEY_INVALID', message: 'The API key is invalid or has been revoked.' } })
    return false
  }
  const requestOrigin = normalizeOrigin(req.headers?.origin || req.headers?.referer)
  if (!requestOrigin || requestOrigin !== record.origin) {
    res.status(403).json({ error: { code: 'API_KEY_ORIGIN_MISMATCH', message: `This API key is restricted to ${record.origin}.` } })
    return false
  }
  req.midnightApiKey = record
  return true
}

export async function issueApiKey({ uid, email, origin, purpose }) {
  if (!DATABASE_SECRET || !KEY_SECRET) throw configError()
  const normalizedOrigin = normalizeOrigin(origin)
  const cleanPurpose = String(purpose || '').trim().slice(0, 500)
  if (cleanPurpose.length < 10) throw Object.assign(new Error('Tell us how you plan to use the API in at least 10 characters.'), { code: 'PURPOSE_REQUIRED' })
  if (!normalizedOrigin) throw Object.assign(new Error('Enter a valid website origin such as https://example.com.'), { code: 'INVALID_ORIGIN' })
  const userPath = `apiKeys/users/${uid}`
  const existing = await databaseRequest('GET', userPath)
  if (existing?.key && existing?.origin) {
    if (existing.origin !== normalizedOrigin) throw Object.assign(new Error(`Your one API key is already restricted to ${existing.origin}.`), { code: 'KEY_ALREADY_EXISTS' })
    return { ...existing, created: false }
  }
  const payload = Buffer.from(JSON.stringify({ uid, origin: normalizedOrigin, iat: Date.now() }), 'utf8').toString('base64url')
  const key = `ma_live_${payload}_${sign(payload)}`
  const record = { uid, email: email || null, origin: normalizedOrigin, purpose: cleanPurpose, key, createdAt: new Date().toISOString(), status: 'active' }
  await databaseRequest('PUT', userPath, record)
  await databaseRequest('PUT', `apiKeys/index/${hash(key)}`, { uid, origin: normalizedOrigin, createdAt: record.createdAt, status: 'active' })
  return { ...record, created: true }
}

export async function getApiKey(uid) {
  if (!DATABASE_SECRET) throw configError()
  return databaseRequest('GET', `apiKeys/users/${uid}`)
}

export async function updateApiKeyOrigin({ uid, origin }) {
  if (!DATABASE_SECRET || !KEY_SECRET) throw configError()
  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) throw Object.assign(new Error('Enter a valid website origin such as https://example.com.'), { code: 'INVALID_ORIGIN' })
  const userPath = `apiKeys/users/${uid}`
  const existing = await databaseRequest('GET', userPath)
  if (!existing?.key || !existing?.origin) throw Object.assign(new Error('Create an API key before editing its website.'), { code: 'KEY_NOT_FOUND' })
  if (existing.origin === normalizedOrigin) return { ...existing, rotated: false }
  const payload = Buffer.from(JSON.stringify({ uid, origin: normalizedOrigin, iat: Date.now() }), 'utf8').toString('base64url')
  const key = `ma_live_${payload}_${sign(payload)}`
  const record = { ...existing, origin: normalizedOrigin, key, updatedAt: new Date().toISOString(), status: 'active' }
  await databaseRequest('PUT', `apiKeys/index/${hash(key)}`, { uid, origin: normalizedOrigin, createdAt: existing.createdAt, updatedAt: record.updatedAt, status: 'active' })
  await databaseRequest('PUT', userPath, record)
  await databaseRequest('DELETE', `apiKeys/index/${hash(existing.key)}`)
  return { ...record, rotated: true }
}

export { normalizeOrigin }
