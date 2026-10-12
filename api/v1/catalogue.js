import { aniList, apiError, handleOptions, mediaFields, positiveInt, sendJson } from '../../lib/midnightApi.js'
import { requireCliAuth } from '../../lib/cliAuth.js'

const VIEWS = {
  trending: 'sort:TRENDING_DESC,status_not:NOT_YET_RELEASED',
  popular: 'sort:POPULARITY_DESC',
  seasonal: 'sort:SCORE_DESC,season:WINTER,seasonYear:2026',
  movies: 'sort:SCORE_DESC,format:MOVIE',
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })
  if (!(await requireCliAuth(req, res))) return

  const view = String(req.query?.view || 'trending').toLowerCase()
  if (!VIEWS[view]) return sendJson(res, 400, { error: { code: 'INVALID_VIEW', message: `view must be one of: ${Object.keys(VIEWS).join(', ')}.` } })
  const page = positiveInt(req.query?.page, 1, 50)
  const perPage = positiveInt(req.query?.limit, 20, 50)
  const filter = VIEWS[view]

  const query = `query($page:Int,$perPage:Int){ Page(page:$page,perPage:$perPage){ pageInfo{currentPage,hasNextPage,total} media(type:ANIME,isAdult:false,${filter}){${mediaFields}} } }`
  try {
    const data = await aniList(query, { page, perPage })
    return sendJson(res, 200, {
      data: data.Page?.media || [],
      meta: { source: 'AniList', view, page, limit: perPage, hasNext: Boolean(data.Page?.pageInfo?.hasNextPage), total: data.Page?.pageInfo?.total || null },
    })
  } catch (error) {
    return apiError(res, error)
  }
}
