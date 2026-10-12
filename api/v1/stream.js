import { apiError, handleOptions, sendJson } from '../../lib/midnightApi.js'

const UPSTREAM = 'https://nuvio-stream-api-20260925.onrender.com/api/stream'
const IDENTIFIERS = ['malId', 'tmdbId', 'imdbId', 'anilistId']

export default async function handler(req, res) {
  if (handleOptions(req)) return
  if (req.method !== 'GET') return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for this endpoint.' } })

  const supplied = IDENTIFIERS.filter((key) => String(req.query?.[key] || '').trim())
  if (supplied.length !== 1) return sendJson(res, 400, { error: { code: 'IDENTIFIER_REQUIRED', message: `Provide exactly one of ${IDENTIFIERS.join(', ')}.` } })

  const type = req.query?.type === 'movie' ? 'movie' : 'tv'
  const audio = ['sub', 'dub', 'hindi'].includes(req.query?.audio) ? req.query.audio : 'sub'
  const params = new URLSearchParams({ [supplied[0]]: String(req.query[supplied[0]]).trim(), type, audio })
  if (type === 'tv') {
    const season = Number.parseInt(req.query?.season, 10)
    const episode = Number.parseInt(req.query?.episode, 10)
    if (!Number.isInteger(season) || season < 1 || !Number.isInteger(episode) || episode < 1) {
      return sendJson(res, 400, { error: { code: 'EPISODE_REQUIRED', message: 'TV streams require positive season and episode values.' } })
    }
    params.set('season', String(season))
    params.set('episode', String(episode))
  }

  try {
    const response = await fetch(`${UPSTREAM}?${params.toString()}`, { headers: { Accept: 'application/json' } })
    const body = await response.json().catch(() => null)
    if (!response.ok) return sendJson(res, response.status, { error: { code: 'STREAM_UNAVAILABLE', message: body?.error?.message || `Stream service returned HTTP ${response.status}.` } })
    return sendJson(res, 200, {
      data: Array.isArray(body) ? body : body?.streams || body?.sources || body?.data || body,
      meta: { source: 'Nuvio Stream API', identifier: supplied[0], type, audio, note: 'Availability and playback headers can vary by title, episode, language, and upstream source.' },
    })
  } catch (error) {
    return apiError(res, error)
  }
}
