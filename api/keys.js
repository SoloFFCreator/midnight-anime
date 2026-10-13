import { getApiKey, getBearerToken, issueApiKey, updateApiKeyOrigin, verifyFirebaseIdToken } from '../lib/apiKeyAuth.js'

function json(res, status, body, requestOrigin = '') {
  requestOrigin = String(requestOrigin || '')
  const allowedOrigin = ['https://midnightanime.bond', 'https://www.midnightanime.bond'].includes(requestOrigin) ? requestOrigin : 'https://www.midnightanime.bond'
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'private, no-store')
  return res.status(status).json(body)
}

async function account(req, res) {
  const token = getBearerToken(req)
  if (!token) { json(res, 401, { error: { code: 'AUTH_REQUIRED', message: 'Sign in to manage your API key.' } }, req.headers?.origin); return null }
  try { return await verifyFirebaseIdToken(token) } catch { json(res, 401, { error: { code: 'AUTH_INVALID', message: 'Your sign-in session expired. Sign in again.' } }, req.headers?.origin); return null }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) return json(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET, POST, or PATCH for API key management.' } })
  const user = await account(req, res)
  if (!user) return
  try {
    if (req.method === 'GET') {
      const record = await getApiKey(user.uid)
      return json(res, 200, { data: record ? { key: record.key, origin: record.origin, purpose: record.purpose, createdAt: record.createdAt, status: record.status } : null })
    }
    if (req.method === 'PATCH') {
      const record = await updateApiKeyOrigin({ uid: user.uid, origin: req.body?.origin || req.body?.website || '' })
      return json(res, 200, { data: { key: record.key, origin: record.origin, purpose: record.purpose, createdAt: record.createdAt, updatedAt: record.updatedAt, status: record.status }, meta: { keyRotated: record.rotated } })
    }
    const origin = req.body?.origin || req.body?.website || ''
    const purpose = req.body?.purpose || ''
    const record = await issueApiKey({ uid: user.uid, email: user.email, origin, purpose })
    return json(res, record.created ? 201 : 200, { data: { key: record.key, origin: record.origin, purpose: record.purpose, createdAt: record.createdAt, status: record.status }, meta: { oneKeyPerAccount: true, created: record.created } })
  } catch (error) {
    const status = ['INVALID_ORIGIN', 'KEY_ALREADY_EXISTS', 'PURPOSE_REQUIRED', 'KEY_NOT_FOUND'].includes(error?.code) ? 400 : 503
    return json(res, status, { error: { code: error?.code || 'API_KEY_SERVICE_UNAVAILABLE', message: error?.message || 'API key service is temporarily unavailable.' } })
  }
}
