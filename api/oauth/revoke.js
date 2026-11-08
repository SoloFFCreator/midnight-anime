import { revokeToken } from '../../lib/oauth.js'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'invalid_request' })
  await revokeToken(req.body?.token)
  return res.status(200).json({ revoked: true })
}
