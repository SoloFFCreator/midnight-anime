import { aniList, apiError, handleOptions, sendJson } from '../../lib/midnightApi.js'

const DETAIL_QUERY = `query($id:Int){ Media(id:$id,type:ANIME){
  id idMal title{romaji english native} coverImage{large extraLarge color} bannerImage
  episodes status averageScore genres format season seasonYear duration
  description(asHtml:false) nextAiringEpisode{episode airingAt}
  streamingEpisodes{title thumbnail}
  studios{nodes{name}} externalLinks{url site}
  relations{edges{relationType(version:2) node{id idMal title{romaji english} coverImage{large} format episodes season seasonYear status averageScore}}}
  recommendations(perPage:8){nodes{mediaRecommendation{id idMal title{romaji english} coverImage{large} averageScore format genres}}}
} }`

export default async function handler(req, res) {
  if (handleOptions(req)) return
  if (req.method !== 'GET') return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })
  const id = Number.parseInt(req.query?.id, 10)
  if (!Number.isInteger(id) || id < 1) return sendJson(res, 400, { error: { code: 'INVALID_ID', message: 'id must be a positive AniList ID.' } })
  try {
    const result = await aniList(DETAIL_QUERY, { id })
    if (!result.Media) return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Anime was not found.' } })
    return sendJson(res, 200, { data: result.Media, meta: { source: 'AniList', artwork: 'AniList cover and banner URLs' } })
  } catch (error) {
    return apiError(res, error)
  }
}
