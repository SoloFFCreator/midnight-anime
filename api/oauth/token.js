import { exchangeAuthorizationCode, refreshAccessToken, validateClientCredentials } from '../../lib/oauth.js'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'invalid_request', error_description: 'Use POST.' })
  const body = req.body || {}
  try {
    let clientId = body.client_id
    let clientSecret = body.client_secret || ''
    const basic = String(req.headers?.authorization || '').match(/^Basic\s+(.+)$/i)?.[1]
    if (basic) {
      const decoded = Buffer.from(basic, 'base64').toString('utf8')
      const separator = decoded.indexOf(':')
      if (separator > 0) { clientId = clientId || decoded.slice(0, separator); clientSecret = clientSecret || decoded.slice(separator + 1) }
    }
    if (body.grant_type === 'authorization_code') {
      const data = await exchangeAuthorizationCode({ code: body.code, clientId, clientSecret, redirectUri: body.redirect_uri, codeVerifier: body.code_verifier })
      return res.status(200).json({ token_type: 'Bearer', access_token: data.accessToken, refresh_token: data.refreshToken, expires_in: data.expiresIn, scope: data.scopes.join(' ') })
    }
    if (body.grant_type === 'refresh_token') {
      const data = await refreshAccessToken({ refreshToken: body.refresh_token, clientId, clientSecret })
      return res.status(200).json({ token_type: 'Bearer', access_token: data.accessToken, refresh_token: data.refreshToken, expires_in: data.expiresIn, scope: data.scopes.join(' ') })
    }
    return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Use authorization_code or refresh_token.' })
  } catch (error) {
    const status = error?.code === 'OAUTH_NOT_CONFIGURED' ? 503 : error?.code === 'INVALID_CLIENT' ? 401 : 400
    return res.status(status).json({ error: error?.code === 'INVALID_CLIENT' ? 'invalid_client' : error?.code === 'INVALID_GRANT' ? 'invalid_grant' : 'invalid_request', error_description: error?.message || 'Token request failed.' })
  }
}
