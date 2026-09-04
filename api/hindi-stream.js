const UPSTREAM = 'https://nuvioapi-erbmmxkc.manus.space/api/stream'

export default async function handler(req, res) {
  const query = new URLSearchParams(req.query || {})
  const required = ['tmdbId', 'type', 'season', 'episode', 'audio']

  if (required.some((key) => !query.get(key))) {
    return res.status(400).json({ error: 'tmdbId, type, season, episode, and audio are required' })
  }

  try {
    const upstream = await fetch(`${UPSTREAM}?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    })
    const body = await upstream.text()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.status(upstream.status).send(body)
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Hindi stream provider unavailable' })
  }
}
