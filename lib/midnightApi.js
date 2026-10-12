const ANILIST_URL = 'https://graphql.anilist.co'

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Midnight-Client')
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
}

export function handleOptions(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

export function sendJson(res, status, payload) {
  setCors(res)
  res.status(status).json(payload)
}

export function requireGet(req, res) {
  if (handleOptions(req, res)) return false
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS')
    sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })
    return false
  }
  return true
}

export function positiveInt(value, fallback, max = 100) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

export async function aniList(query, variables = {}) {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) throw new Error(`AniList returned HTTP ${response.status}`)
  const json = await response.json()
  if (json.errors?.length) throw new Error(json.errors[0].message || 'AniList request failed')
  return json.data
}

export function apiError(res, error) {
  console.error('[midnight-api]', error)
  sendJson(res, 502, { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'The requested catalogue resource is temporarily unavailable.' } })
}

export const mediaFields = `
  id idMal title{romaji english native}
  coverImage{large extraLarge color} bannerImage
  episodes status averageScore genres format season seasonYear
  nextAiringEpisode{episode}
`
