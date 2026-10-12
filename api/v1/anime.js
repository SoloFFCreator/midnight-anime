import { requireCliAuth } from '../../lib/cliAuth.js'
const DETAIL_QUERY = `query($id:Int){ Media(id:$id,type:ANIME){ id idMal title{romaji english native} coverImage{large extraLarge color} bannerImage episodes status averageScore genres format season seasonYear duration description(asHtml:false) nextAiringEpisode{episode airingAt} streamingEpisodes{title thumbnail} studios{nodes{name}} externalLinks{url site} } }`

function json(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Midnight-Client')
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  return res.status(status).json(body)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'GET') return json(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })
  if (!(await requireCliAuth(req, res))) return
  const id = Number.parseInt(req.query?.id, 10)
  if (!Number.isInteger(id) || id < 1) return json(res, 400, { error: { code: 'INVALID_ID', message: 'id must be a positive AniList ID.' } })
  try {
    const response = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query: DETAIL_QUERY, variables: { id } }) })
    const result = await response.json()
    if (!response.ok || result.errors?.length) throw new Error(result.errors?.[0]?.message || `AniList returned HTTP ${response.status}`)
    if (!result.data?.Media) return json(res, 404, { error: { code: 'NOT_FOUND', message: 'Anime was not found.' } })
    return json(res, 200, { data: result.data.Media, meta: { source: 'AniList', artwork: 'AniList cover and banner URLs' } })
  } catch (error) {
    return json(res, 502, { error: { code: 'UPSTREAM_UNAVAILABLE', message: error?.message || 'AniList is temporarily unavailable.' } })
  }
}
