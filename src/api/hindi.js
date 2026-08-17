const STREAM_ENDPOINT = '/api/hindi-stream'
const REQUEST_TIMEOUT_MS = 15_000

function isPlayableUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function sourceUrl(source) {
  if (typeof source === 'string') return source
  return source?.url || source?.file || source?.link || source?.src || source?.stream || source?.source
}

function normalizeSource(source, index) {
  const url = sourceUrl(source)
  if (!isPlayableUrl(url)) return null
  const cleanUrl = url.trim()
  const declaredType = typeof source === 'object' ? `${source.type || ''} ${source.mimeType || ''}` : ''
  const isHls = /\.m3u8(?:$|[?#])/i.test(cleanUrl) || /m3u8|mpegurl/i.test(declaredType)
  const name = typeof source === 'object' ? (source.name || source.provider || 'Hindi source') : 'Hindi source'
  const quality = typeof source === 'object' ? (source.quality || source.resolution || 'Auto') : 'Auto'

  return {
    id: `${name}-${quality}-${index}`,
    name,
    title: typeof source === 'object' && source.title ? source.title : `Hindi${quality !== 'Auto' ? ` — ${quality}` : ''}`,
    quality,
    url: cleanUrl,
    type: isHls ? 'hls' : 'mp4',
    headers: typeof source === 'object' ? source.headers || {} : {},
  }
}

function responseSources(json) {
  if (Array.isArray(json)) return json
  if (Array.isArray(json?.streams)) return json.streams
  if (Array.isArray(json?.sources)) return json.sources
  if (Array.isArray(json?.data)) return json.data
  if (json?.url || json?.file || json?.link || json?.src) return [json]
  return []
}

export const HindiApi = {
  async fetchStreams({ tmdbId, mediaType = 'tv', season = 1, episode = 1 }) {
    if (!tmdbId) return { ok: false, reason: 'TMDB ID is required for Hindi playback', streams: [] }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const params = new URLSearchParams({
        tmdbId: String(tmdbId),
        type: mediaType === 'movie' ? 'movie' : 'tv',
        season: String(Math.max(1, Number(season) || 1)),
        episode: String(Math.max(1, Number(episode) || 1)),
        audio: 'hindi',
      })
      const res = await fetch(`${STREAM_ENDPOINT}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!res.ok) return { ok: false, reason: `Hindi API returned HTTP ${res.status}`, streams: [] }
      const json = await res.json()
      const streams = responseSources(json).map(normalizeSource).filter(Boolean)

      if (!streams.length) return { ok: false, reason: 'No direct Hindi stream was returned for this episode', streams: [] }
      return { ok: true, streams }
    } catch (error) {
      const reason = error?.name === 'AbortError' ? 'Hindi API request timed out' : error?.message || 'Hindi API network error'
      return { ok: false, reason, streams: [] }
    } finally {
      window.clearTimeout(timeout)
    }
  },
}
