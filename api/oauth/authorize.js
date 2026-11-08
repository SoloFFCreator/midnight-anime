import { getBearerToken, issueAuthorizationCode, requireFirebaseUser, validateAuthorizationRequest } from '../../lib/oauth.js'
function redirect(res, uri, params) { const url = new URL(uri); Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value)); return res.redirect(302, url.toString()) }
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST.' } })
  try {
    const input = req.method === 'GET' ? req.query : req.body || {}
    const validated = await validateAuthorizationRequest(input)
    const user = await requireFirebaseUser(req, res)
    if (!user) return
    if (req.method === 'GET' && input.approved !== 'true') return res.status(200).json({ data: { client: { clientId: validated.client.clientId, name: validated.client.name }, redirectUri: validated.redirectUri, scopes: validated.scopes, codeChallengeRequired: true } })
    if (req.method === 'POST' && input.approved !== true && input.approved !== 'true' && String(req.headers?.accept || '').includes('application/json')) return res.status(200).json({ data: { client: { clientId: validated.client.clientId, name: validated.client.name }, redirectUri: validated.redirectUri, scopes: validated.scopes, codeChallengeRequired: true } })
    if (req.method === 'POST' && input.approved !== true && input.approved !== 'true') return redirect(res, validated.redirectUri, { error: 'access_denied', error_description: 'The user denied access.', ...(input.state ? { state: input.state } : {}) })
    if (req.method === 'POST' && String(req.headers?.accept || '').includes('application/json')) {
      const code = await issueAuthorizationCode({ clientId: validated.client.clientId, uid: user.uid, profile: { email: user.email, displayName: user.displayName, photoURL: user.photoURL, emailVerified: user.emailVerified }, redirectUri: validated.redirectUri, scopes: validated.scopes, codeChallenge: input.code_challenge, codeChallengeMethod: input.code_challenge_method })
      const callback = new URL(validated.redirectUri); callback.searchParams.set('code', code); if (input.state) callback.searchParams.set('state', input.state)
      return res.status(200).json({ redirect_uri: callback.toString() })
    }
    const code = await issueAuthorizationCode({ clientId: validated.client.clientId, uid: user.uid, profile: { email: user.email, displayName: user.displayName, photoURL: user.photoURL, emailVerified: user.emailVerified }, redirectUri: validated.redirectUri, scopes: validated.scopes, codeChallenge: input.code_challenge, codeChallengeMethod: input.code_challenge_method })
    return redirect(res, validated.redirectUri, { code, ...(input.state ? { state: input.state } : {}) })
  } catch (error) { return res.status(error?.code === 'OAUTH_NOT_CONFIGURED' ? 503 : 400).json({ error: { code: error?.code || 'INVALID_REQUEST', message: error?.message || 'The authorization request is invalid.' } }) }
}
