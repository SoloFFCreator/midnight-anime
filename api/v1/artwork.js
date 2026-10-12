import { requireCliAuth } from '../../lib/cliAuth.js'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/'
const TMDB_API_KEY = '6de011d3fa665efbd0e924e6bb9fd381'

function json(res, status, body) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Midnight-Client')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900')
  return res.status(status).json(body)
}

async function request(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`TMDB returned HTTP ${response.status}`)
  return response.json()
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method !== 'GET') return json(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })
  if (!(await requireCliAuth(req, res))) return

  const tmdbId = String(req.query?.tmdbId || '').trim()
  if (!tmdbId) return json(res, 400, { error: { code: 'IDENTIFIER_REQUIRED', message: 'Provide a tmdbId.' } })
  const type = req.query?.type === 'movie' ? 'movie' : 'tv'

  try {
    const [details, externalIds] = await Promise.all([
      request(`/${type}/${encodeURIComponent(tmdbId)}`, { language: 'en-US' }),
      request(`/${type}/${encodeURIComponent(tmdbId)}/external_ids`),
    ])
    return json(res, 200, { data: { tmdbId, title: details.name || details.title || null, type, overview: details.overview || '', poster: details.poster_path ? `${TMDB_IMAGE}w780${details.poster_path}` : null, backdrop: details.backdrop_path ? `${TMDB_IMAGE}original${details.backdrop_path}` : null, voteAverage: details.vote_average || null, firstAirDate: details.first_air_date || details.release_date || null, numberOfSeasons: details.number_of_seasons || null, numberOfEpisodes: details.number_of_episodes || null, seasons: details.seasons || [], externalIds: { imdbId: externalIds?.imdb_id || null, tvdbId: externalIds?.tvdb_id || null } }, meta: { source: 'TMDB', resolvedFrom: 'tmdbId' } })
  } catch (error) {
    return json(res, 502, { error: { code: 'UPSTREAM_UNAVAILABLE', message: error?.message || 'TMDB is temporarily unavailable.' } })
  }
}
