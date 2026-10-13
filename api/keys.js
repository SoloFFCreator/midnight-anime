import { getApiKey, getBearerToken, issueApiKey, verifyFirebaseIdToken } from '../lib/apiKeyAuth.js'

function json(res, status, body) {
  const requestOrigin = String(req.headers?.origin || '')
  const allowedOrigin = ['https://midnightanime.bond', 'https://www.midnightanime.bond'].includes(requestOrigin) ? requestOrigin : 'https://www.midnightanime.bond'
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'private, no-store')
  return res.status(status).json(body)
}

async function account(req, res) {
  const token = getBearerToken(req)
  if (!token) { json(res, 401, { error: { code: 'AUTH_REQUIRED', message: 'Sign in to manage your API key.' } }); return null }
  try { return await verifyFirebaseIdToken(token) } catch { json(res, 401, { error: { code: 'AUTH_INVALID', message: 'Your sign-in session expired. Sign in again.' } }); return null }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST for API key management.' } })
  const user = await account(req, res)
  if (!user) return
  try {
    if (req.method === 'GET') {
      const record = await getApiKey(user.uid)
      return json(res, 200, { data: record ? { key: record.key, origin: record.origin, purpose: record.purpose, createdAt: record.createdAt, status: record.status } : null })
    }
    const origin = req.body?.origin || req.body?.website || ''
    const purpose = req.body?.purpose || ''
    const record = await issueApiKey({ uid: user.uid, email: user.email, origin, purpose })
    return json(res, record.created ? 201 : 200, { data: { key: record.key, origin: record.origin, purpose: record.purpose, createdAt: record.createdAt, status: record.status }, meta: { oneKeyPerAccount: true, created: record.created } })
  } catch (error) {
    const status = ['INVALID_ORIGIN', 'KEY_ALREADY_EXISTS', 'PURPOSE_REQUIRED'].includes(error?.code) ? 400 : 503
    return json(res, status, { error: { code: error?.code || 'API_KEY_SERVICE_UNAVAILABLE', message: error?.message || 'API key service is temporarily unavailable.' } })
  }
}
