const FIREBASE_API_KEY = 'AIzaSyClcy2YXqryJAkg_wy1W4RLqkYMIsEg2Rk'

export async function requireCliAuth(req, res) {
  const client = String(req.headers?.['x-midnight-client'] || '')
  if (!client.startsWith('cli/')) return true
  const authorization = String(req.headers?.authorization || '')
  const idToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!idToken) {
    res.status(401).json({ error: { code: 'CLI_AUTH_REQUIRED', message: 'Run `midnight-anime login` before using the CLI.' } })
    return false
  }
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    const body = await response.json().catch(() => null)
    const user = body?.users?.[0]
    if (!response.ok || !user?.localId) throw new Error('Invalid token')
    req.midnightUser = { uid: user.localId, email: user.email || null }
    return true
  } catch {
    res.status(401).json({ error: { code: 'CLI_AUTH_INVALID', message: 'The CLI session has expired. Run `midnight-anime login` again.' } })
    return false
  }
}
