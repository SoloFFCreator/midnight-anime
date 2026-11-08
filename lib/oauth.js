import crypto from 'node:crypto'

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyClcy2YXqryJAkg_wy1W4RLqkYMIsEg2Rk'
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://mid-night-anime-default-rtdb.asia-southeast1.firebasedatabase.app'
const DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET || process.env.FIREBASE_DB_SECRET || ''
const OAUTH_SECRET = process.env.MIDNIGHT_OAUTH_SECRET || process.env.MIDNIGHT_API_KEY_SECRET || ''
const CLIENT_ID_PATTERN = /^ma_client_[A-Za-z0-9_-]{24,}$/
const SCOPES = new Set(['openid', 'profile', 'email'])

function unavailable() { return Object.assign(new Error('OAuth service is not configured. Set FIREBASE_DATABASE_SECRET and MIDNIGHT_OAUTH_SECRET.'), { code: 'OAUTH_NOT_CONFIGURED' }) }
function requireConfig() { if (!DATABASE_SECRET || !OAUTH_SECRET) throw unavailable() }
function digest(value) { return crypto.createHash('sha256').update(value).digest('hex') }
function random(prefix) { return `${prefix}${crypto.randomBytes(32).toString('base64url')}` }
function databasePath(path) { requireConfig(); return `${DATABASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}.json?auth=${encodeURIComponent(DATABASE_SECRET)}` }
async function databaseRequest(method, path, body) {
  const response = await fetch(databasePath(path), { method, headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const value = await response.json().catch(() => null)
  if (!response.ok) throw Object.assign(new Error(`Firebase database returned HTTP ${response.status}`), { code: 'DATABASE_ERROR' })
  return value
}
function equal(a, b) { return crypto.timingSafeEqual(Buffer.from(String(a)), Buffer.from(String(b))) }
function validRedirect(value) {
  try {
    const url = new URL(String(value || '').trim())
    if (url.hash || !['https:', 'http:'].includes(url.protocol)) return false
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return false
    return url.toString().replace(/\/$/, '')
  } catch { return false }
}
function normalizeRedirects(values) { return [...new Set((Array.isArray(values) ? values : []).map(validRedirect).filter(Boolean))] }
function normalizeScopes(value) {
  const scopes = String(value || 'openid profile email').split(/[\s,]+/).filter(Boolean)
  return [...new Set(scopes.filter((scope) => SCOPES.has(scope)))]
}
export function parseScopes(value) { return normalizeScopes(value) }
export function getBearerToken(req) { return String(req.headers?.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1] || '' }
export async function verifyFirebaseIdToken(idToken) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ idToken }) })
  const body = await response.json().catch(() => null)
  const user = body?.users?.[0]
  if (!response.ok || !user?.localId) throw Object.assign(new Error('Invalid Firebase token'), { code: 'AUTH_INVALID' })
  return { uid: user.localId, email: user.email || null, displayName: user.displayName || null, photoURL: user.photoUrl || null, emailVerified: Boolean(user.emailVerified) }
}
export async function requireFirebaseUser(req, res) {
  const token = getBearerToken(req)
  if (!token) { res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to manage OAuth applications.' } }); return null }
  try { return await verifyFirebaseIdToken(token) } catch { res.status(401).json({ error: { code: 'AUTH_INVALID', message: 'Your sign-in session expired. Sign in again.' } }); return null }
}
export async function registerClient({ uid, name, websiteUrl, redirectUris, scopes }) {
  const cleanName = String(name || '').trim().slice(0, 80)
  const website = validRedirect(websiteUrl)
  const redirects = normalizeRedirects(redirectUris)
  const cleanScopes = normalizeScopes(scopes)
  if (cleanName.length < 2) throw Object.assign(new Error('Choose an application name.'), { code: 'INVALID_CLIENT_NAME' })
  if (!website) throw Object.assign(new Error('Add a valid HTTPS website URL. Localhost HTTP is allowed for development.'), { code: 'INVALID_WEBSITE_URL' })
  if (!redirects.length) throw Object.assign(new Error('Add at least one valid HTTPS redirect URI. Localhost HTTP is allowed for development.'), { code: 'INVALID_REDIRECT_URI' })
  if (!cleanScopes.length) throw Object.assign(new Error('Choose at least one supported scope.'), { code: 'INVALID_SCOPE' })
  const clientId = random('ma_client_')
  const clientSecret = random('ma_secret_')
  const record = { clientId, ownerUid: uid, name: cleanName, websiteUrl: website, redirectUris: redirects, scopes: cleanScopes, secretHash: digest(clientSecret), createdAt: new Date().toISOString(), status: 'active' }
  await databaseRequest('PUT', `oauthClients/${clientId}`, record)
  await databaseRequest('PUT', `oauthClientsByUser/${uid}/${clientId}`, true)
  return { ...record, clientSecret }
}
export async function listClients(uid) {
  const index = await databaseRequest('GET', `oauthClientsByUser/${uid}`) || {}
  const records = await Promise.all(Object.keys(index).map((id) => databaseRequest('GET', `oauthClients/${id}`)))
  return records.filter(Boolean).map((record) => ({ ...record, secretHash: undefined }))
}
export async function getClient(clientId) {
  if (!CLIENT_ID_PATTERN.test(String(clientId || ''))) return null
  const record = await databaseRequest('GET', `oauthClients/${clientId}`)
  return record?.status === 'active' ? record : null
}
export async function rotateClientSecret({ uid, clientId }) {
  const client = await getClient(clientId)
  if (!client || client.ownerUid !== uid) throw Object.assign(new Error('OAuth application not found.'), { code: 'CLIENT_NOT_FOUND' })
  const clientSecret = random('ma_secret_')
  const next = { ...client, secretHash: digest(clientSecret), updatedAt: new Date().toISOString() }
  await databaseRequest('PUT', `oauthClients/${clientId}`, next)
  return { ...next, secretHash: undefined, clientSecret }
}
export async function validateClientCredentials(clientId, clientSecret) {
  const client = await getClient(clientId)
  if (!client || !clientSecret || !equal(client.secretHash, digest(clientSecret))) return null
  return client
}
export async function validateAuthorizationRequest({ clientId, redirectUri, scope, responseType }) {
  const client = await getClient(clientId)
  const normalized = validRedirect(redirectUri)
  if (!client) throw Object.assign(new Error('Unknown or inactive client_id.'), { code: 'INVALID_CLIENT' })
  if (responseType !== 'code') throw Object.assign(new Error('Only response_type=code is supported.'), { code: 'UNSUPPORTED_RESPONSE_TYPE' })
  if (!normalized || !client.redirectUris.includes(normalized)) throw Object.assign(new Error('redirect_uri is not registered for this application.'), { code: 'REDIRECT_URI_MISMATCH' })
  const requested = normalizeScopes(scope || client.scopes.join(' '))
  if (!requested.length || requested.some((item) => !client.scopes.includes(item))) throw Object.assign(new Error('The requested scope is not enabled for this application.'), { code: 'INVALID_SCOPE' })
  return { client, redirectUri: normalized, scopes: requested }
}
export async function issueAuthorizationCode({ clientId, uid, profile, redirectUri, scopes, codeChallenge, codeChallengeMethod }) {
  if (!codeChallenge || codeChallengeMethod !== 'S256') throw Object.assign(new Error('PKCE S256 code_challenge is required.'), { code: 'PKCE_REQUIRED' })
  if (codeChallengeMethod && codeChallengeMethod !== 'S256') throw Object.assign(new Error('Only PKCE S256 is supported.'), { code: 'UNSUPPORTED_CODE_CHALLENGE' })
  if (codeChallenge && !/^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge)) throw Object.assign(new Error('Invalid PKCE code_challenge.'), { code: 'INVALID_CODE_CHALLENGE' })
  const code = random('ma_code_')
  await databaseRequest('PUT', `oauthCodes/${digest(code)}`, { clientId, uid, profile: profile || {}, redirectUri, scopes, codeChallenge: codeChallenge || null, codeChallengeMethod: codeChallengeMethod || null, expiresAt: Date.now() + 5 * 60 * 1000, used: false })
  return code
}
function pkceValid(verifier, challenge) { return challenge ? digest(verifier) === challenge || crypto.createHash('sha256').update(verifier).digest('base64url') === challenge : true }
export async function exchangeAuthorizationCode({ code, clientId, clientSecret, redirectUri, codeVerifier }) {
  const client = await validateClientCredentials(clientId, clientSecret)
  if (!client) throw Object.assign(new Error('Client authentication failed.'), { code: 'INVALID_CLIENT' })
  const record = await databaseRequest('GET', `oauthCodes/${digest(code)}`)
  if (!record || record.used || record.clientId !== clientId || record.redirectUri !== validRedirect(redirectUri) || record.expiresAt < Date.now()) throw Object.assign(new Error('Authorization code is invalid or expired.'), { code: 'INVALID_GRANT' })
  if (record.codeChallenge && (!codeVerifier || !pkceValid(codeVerifier, record.codeChallenge))) throw Object.assign(new Error('PKCE verification failed.'), { code: 'INVALID_GRANT' })
  await databaseRequest('PATCH', `oauthCodes/${digest(code)}`, { used: true, usedAt: Date.now() })
  return issueTokens({ clientId, uid: record.uid, profile: record.profile, scopes: record.scopes })
}
async function issueTokens({ clientId, uid, profile, scopes }) {
  const accessToken = random('ma_at_')
  const refreshToken = random('ma_rt_')
  const expiresAt = Date.now() + 60 * 60 * 1000
  const record = { clientId, uid, profile: profile || {}, scopes, expiresAt, refreshTokenHash: digest(refreshToken), revoked: false }
  await databaseRequest('PUT', `oauthTokens/${digest(accessToken)}`, record)
  await databaseRequest('PUT', `oauthRefreshTokens/${digest(refreshToken)}`, { ...record, accessTokenHash: digest(accessToken) })
  return { accessToken, refreshToken, expiresIn: 3600, scopes }
}
export async function refreshAccessToken({ refreshToken, clientId, clientSecret }) {
  const client = await validateClientCredentials(clientId, clientSecret)
  const record = await databaseRequest('GET', `oauthRefreshTokens/${digest(refreshToken)}`)
  if (!client || !record || record.clientId !== clientId || record.revoked) throw Object.assign(new Error('Refresh token is invalid or revoked.'), { code: 'INVALID_GRANT' })
  await databaseRequest('PATCH', `oauthRefreshTokens/${digest(refreshToken)}`, { revoked: true, revokedAt: Date.now() })
  return issueTokens({ clientId, uid: record.uid, profile: record.profile, scopes: record.scopes })
}
export async function getTokenRecord(token) { return databaseRequest('GET', `oauthTokens/${digest(token)}`) }
export async function revokeToken(token) {
  if (!token) return
  await databaseRequest('PATCH', `oauthTokens/${digest(token)}`, { revoked: true, revokedAt: Date.now() }).catch(() => undefined)
  await databaseRequest('PATCH', `oauthRefreshTokens/${digest(token)}`, { revoked: true, revokedAt: Date.now() }).catch(() => undefined)
}
export function publicClient(client) { return { clientId: client.clientId, name: client.name, websiteUrl: client.websiteUrl, redirectUris: client.redirectUris, scopes: client.scopes, status: client.status } }
