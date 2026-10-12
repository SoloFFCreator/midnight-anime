import { aniList, apiError, handleOptions, mediaFields, positiveInt, sendJson } from '../../lib/midnightApi.js'
import { requireCliAuth } from '../../lib/cliAuth.js'

export default async function handler(req, res) {
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })
  if (!(await requireCliAuth(req, res))) return

  const queryText = String(req.query?.q || '').trim()
  if (!queryText) return sendJson(res, 400, { error: { code: 'MISSING_QUERY', message: 'Add a q query parameter, for example q=Frieren.' } })
  if (queryText.length > 100) return sendJson(res, 400, { error: { code: 'QUERY_TOO_LONG', message: 'q must be 100 characters or fewer.' } })
  const page = positiveInt(req.query?.page, 1, 50)
  const perPage = positiveInt(req.query?.limit, 20, 50)

  const query = `query($search:String,$page:Int,$perPage:Int){ Page(page:$page,perPage:$perPage){ pageInfo{currentPage,hasNextPage,total} media(type:ANIME,search:$search,sort:POPULARITY_DESC,isAdult:false){${mediaFields}} } }`
  try {
    const result = await aniList(query, { search: queryText, page, perPage })
    return sendJson(res, 200, {
      data: result.Page?.media || [],
      meta: { source: 'AniList', query: queryText, page, limit: perPage, hasNext: Boolean(result.Page?.pageInfo?.hasNextPage), total: result.Page?.pageInfo?.total || null },
    })
  } catch (error) {
    return apiError(res, error)
  }
}
