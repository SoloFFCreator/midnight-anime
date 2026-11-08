import { listClients, registerClient, requireFirebaseUser, rotateClientSecret, publicClient } from '../../lib/oauth.js'

function json(res, status, body) {
  const origin = res.req?.headers?.origin
  res.setHeader('Access-Control-Allow-Origin', ['https://midnightanime.bond', 'https://www.midnightanime.bond'].includes(origin) ? origin : 'https://www.midnightanime.bond')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'private, no-store')
  return res.status(status).json(body)
}
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) return json(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, or PATCH.' } })
  const user = await requireFirebaseUser(req, res)
  if (!user) return
  try {
    if (req.method === 'GET') return json(res, 200, { data: await listClients(user.uid) })
    if (req.method === 'PATCH') {
      const client = await rotateClientSecret({ uid: user.uid, clientId: req.body?.clientId })
      return json(res, 200, { data: { ...publicClient(client), clientSecret: client.clientSecret }, meta: { secretRotated: true } })
    }
    const client = await registerClient({ uid: user.uid, name: req.body?.name, websiteUrl: req.body?.websiteUrl, redirectUris: req.body?.redirectUris, scopes: req.body?.scopes })
    return json(res, 201, { data: { ...publicClient(client), clientSecret: client.clientSecret }, meta: { secretShownOnce: true } })
  } catch (error) {
    const status = ['INVALID_CLIENT_NAME', 'INVALID_WEBSITE_URL', 'INVALID_REDIRECT_URI', 'INVALID_SCOPE', 'CLIENT_NOT_FOUND'].includes(error?.code) ? 400 : 503
    return json(res, status, { error: { code: error?.code || 'OAUTH_SERVICE_UNAVAILABLE', message: error?.message || 'OAuth service is temporarily unavailable.' } })
  }
}
