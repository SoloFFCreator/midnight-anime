const STREAM_ENDPOINT = 'https://nuvio-stream-api-20260925.onrender.com/api/stream'
const REQUEST_TIMEOUT_MS = 20_000

function isPlayableUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function sourceUrl(source) {
  if (typeof source === 'string') return source
  return source?.url || source?.file || source?.link || source?.src || source?.stream || source?.source
}

function normalizeSource(source, index, audio) {
  const url = sourceUrl(source)
  if (!isPlayableUrl(url)) return null
  const cleanUrl = url.trim()
  const declaredType = typeof source === 'object' ? `${source.type || ''} ${source.format || ''} ${source.mimeType || ''}` : ''
  const isHls = /\.m3u8(?:$|[?#])/i.test(cleanUrl) || /m3u8|mpegurl|hls/i.test(declaredType)
  const name = typeof source === 'object' ? (source.name || source.provider || 'Nuvio source') : 'Nuvio source'
  const quality = typeof source === 'object' ? (source.quality || source.resolution || 'Auto') : 'Auto'

  return {
    id: `${name}-${quality}-${audio}-${index}`,
    name,
    title: typeof source === 'object' && source.title ? source.title : `${name} — ${audio}`,
    quality,
    url: browserPlayableUrl(cleanUrl, isHls),
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

function browserPlayableUrl(url, isHls) {
  if (!isHls) return url
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'megavid.buzz' || parsed.hostname === 'www.megavid.buzz') {
      return `/api/megavid-proxy?url=${encodeURIComponent(url)}`
    }
  } catch { /* keep the provider URL when it cannot be parsed */ }
  return url
}

export const NuvioApi = {
  async fetchStreams({ malId, mediaType = 'tv', season = 1, episode = 1, audio = 'hindi' }) {
    if (!malId) return { ok: false, reason: 'MAL ID is required for Nuvio playback', streams: [] }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const type = mediaType === 'movie' ? 'movie' : 'tv'
    const params = new URLSearchParams({
      type,
      malId: String(malId),
      audio: audio === 'dub' ? 'dub' : audio === 'sub' ? 'sub' : 'hindi',
    })
    if (type === 'tv') {
      params.set('season', String(Math.max(1, Number(season) || 1)))
      params.set('episode', String(Math.max(1, Number(episode) || 1)))
    }

    try {
      const res = await fetch(`${STREAM_ENDPOINT}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      let json = null
      try { json = await res.json() } catch { /* preserve useful HTTP error below */ }
      if (!res.ok) {
        return { ok: false, reason: json?.error?.message || `Nuvio API returned HTTP ${res.status}`, streams: [] }
      }
      const streams = responseSources(json).map((source, index) => normalizeSource(source, index, audio)).filter(Boolean)
      if (!streams.length) return { ok: false, reason: `No ${audio} stream was returned for this episode`, streams: [] }
      return { ok: true, streams }
    } catch (error) {
      const reason = error?.name === 'AbortError' ? 'Nuvio API request timed out' : error?.message || 'Nuvio API network error'
      return { ok: false, reason, streams: [] }
    } finally {
      window.clearTimeout(timeout)
    }
  },
}
