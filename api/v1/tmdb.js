import { aniList, apiError, handleOptions, sendJson } from '../../lib/midnightApi.js'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/'
const TMDB_API_KEY = process.env.TMDB_API_KEY || '6de011d3fa665efbd0e924e6bb9fd381'

async function tmdb(path, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`TMDB returned HTTP ${response.status}`)
  return response.json()
}

export default async function handler(req, res) {
  if (handleOptions(req)) return
  if (req.method !== 'GET') return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })

  const tmdbId = String(req.query?.tmdbId || '').trim()
  const anilistId = Number.parseInt(req.query?.anilistId, 10)
  const mediaType = req.query?.type === 'movie' ? 'movie' : 'tv'
  if (!tmdbId && (!Number.isInteger(anilistId) || anilistId < 1)) return sendJson(res, 400, { error: { code: 'IDENTIFIER_REQUIRED', message: 'Provide a tmdbId or a positive anilistId.' } })

  try {
    let resolvedTmdbId = tmdbId
    let resolvedTitle = null
    if (!resolvedTmdbId) {
      const result = await aniList('query($id:Int){Media(id:$id,type:ANIME){title{romaji english} format}}', { id: anilistId })
      const media = result.Media
      if (!media) return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'AniList title was not found.' } })
      resolvedTitle = media.title.english || media.title.romaji
      const search = await tmdb(`/search/${mediaType}`, { query: resolvedTitle, include_adult: 'false' })
      resolvedTmdbId = search.results?.[0]?.id ? String(search.results[0].id) : ''
      if (!resolvedTmdbId) return sendJson(res, 404, { error: { code: 'TMDB_NOT_FOUND', message: 'No matching TMDB title was found.' } })
    }

    const [details, externalIds] = await Promise.all([
      tmdb(`/${mediaType}/${encodeURIComponent(resolvedTmdbId)}`, { language: 'en-US' }),
      tmdb(`/${mediaType}/${encodeURIComponent(resolvedTmdbId)}/external_ids`),
    ])
    return sendJson(res, 200, {
      data: {
        tmdbId: resolvedTmdbId,
        anilistId: Number.isInteger(anilistId) ? anilistId : null,
        title: resolvedTitle || details.name || details.title || null,
        type: mediaType,
        overview: details.overview || '',
        poster: details.poster_path ? `${TMDB_IMAGE}w780${details.poster_path}` : null,
        backdrop: details.backdrop_path ? `${TMDB_IMAGE}original${details.backdrop_path}` : null,
        voteAverage: details.vote_average || null,
        firstAirDate: details.first_air_date || details.release_date || null,
        numberOfSeasons: details.number_of_seasons || null,
        numberOfEpisodes: details.number_of_episodes || null,
        seasons: details.seasons || [],
        externalIds: { imdbId: externalIds?.imdb_id || null, tvdbId: externalIds?.tvdb_id || null },
      },
      meta: { source: 'TMDB', resolvedFrom: tmdbId ? 'tmdbId' : 'anilistId' },
    })
  } catch (error) {
    return apiError(res, error)
  }
}
