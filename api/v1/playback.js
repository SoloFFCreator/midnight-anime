const UPSTREAM = 'https://nuvio-stream-api-20260925.onrender.com/api/stream'
const IDENTIFIERS = ['malId', 'tmdbId', 'imdbId', 'anilistId']

function json(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
  return res.status(status).json(body)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'GET') return json(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })

  const query = new URLSearchParams(req.query || {})
  const supplied = IDENTIFIERS.filter((key) => query.get(key))
  if (supplied.length !== 1) return json(res, 400, { error: { code: 'IDENTIFIER_REQUIRED', message: `Provide exactly one of ${IDENTIFIERS.join(', ')}.` } })

  const type = query.get('type') === 'movie' ? 'movie' : 'tv'
  const audio = ['sub', 'dub', 'hindi'].includes(query.get('audio')) ? query.get('audio') : 'sub'
  query.set('type', type)
  query.set('audio', audio)
  if (type === 'tv' && (!query.get('season') || !query.get('episode'))) return json(res, 400, { error: { code: 'EPISODE_REQUIRED', message: 'TV streams require season and episode.' } })

  try {
    const upstream = await fetch(`${UPSTREAM}?${query.toString()}`, { headers: { Accept: 'application/json' } })
    const body = await upstream.json().catch(() => null)
    if (!upstream.ok) return json(res, upstream.status, { error: { code: 'STREAM_UNAVAILABLE', message: body?.error?.message || `Stream service returned HTTP ${upstream.status}.` } })
    return json(res, 200, { data: Array.isArray(body) ? body : body?.streams || body?.sources || body?.data || body, meta: { source: 'Nuvio Stream API', identifier: supplied[0], type, audio } })
  } catch (error) {
    return json(res, 502, { error: { code: 'UPSTREAM_UNAVAILABLE', message: error?.message || 'Stream service unavailable.' } })
  }
}
