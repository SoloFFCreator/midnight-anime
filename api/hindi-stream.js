const UPSTREAM = 'https://nuvio-stream-api-20260925.onrender.com/api/stream'

export default async function handler(req, res) {
  const query = new URLSearchParams(req.query || {})
  const required = ['type', 'audio']

  if (required.some((key) => !query.get(key))) {
    return res.status(400).json({ error: 'type and audio are required' })
  }

  const identifiers = ['tmdbId', 'imdbId', 'malId'].filter((key) => query.get(key))
  if (identifiers.length !== 1) {
    return res.status(400).json({ error: 'Provide exactly one identifier: tmdbId, imdbId, or malId' })
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
