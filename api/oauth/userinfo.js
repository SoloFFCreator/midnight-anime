import { getBearerToken, getTokenRecord } from '../../lib/oauth.js'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'invalid_request' })
  try {
    const token = getBearerToken(req)
    const record = await getTokenRecord(token)
    if (!token || !record?.uid || record.revoked || record.expiresAt < Date.now()) return res.status(401).json({ error: 'invalid_token', error_description: 'The access token is invalid or expired.' })
    const profile = record.profile || {}
    const body = { sub: record.uid }
    if (record.scopes?.includes('email')) { body.email = profile.email || null; body.email_verified = Boolean(profile.emailVerified) }
    if (record.scopes?.includes('profile')) { body.name = profile.displayName || null; body.picture = profile.photoURL || null }
    return res.status(200).json(body)
  } catch { return res.status(401).json({ error: 'invalid_token', error_description: 'The access token is invalid or expired.' }) }
}
