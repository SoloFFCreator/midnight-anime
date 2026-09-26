const STREAM_ENDPOINT = '/api/hindi-stream'
const REQUEST_TIMEOUT_MS = 45_000
const MAX_ATTEMPTS = 2

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
    subtitles: typeof source === 'object' ? (source.subtitles || []).map((track, trackIndex) => ({
      id: `${audio}-${index}-subtitle-${trackIndex}`,
      src: browserSubtitleUrl(track?.url),
      label: track?.label || 'English',
      language: track?.language || track?.label || 'en',
      kind: track?.kind || 'subtitles',
      default: Boolean(track?.default),
    })).filter((track) => track.src) : [],
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

function browserSubtitleUrl(url) {
  if (!isPlayableUrl(url)) return null
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'megavid.buzz' || parsed.hostname === 'www.megavid.buzz') {
      return `/api/megavid-proxy?url=${encodeURIComponent(url)}`
    }
  } catch { /* keep the provider URL when it cannot be parsed */ }
  return url
}

export const NuvioApi = {
  async fetchStreams({ malId, tmdbId, imdbId, mediaType = 'tv', season = 1, episode = 1, audio = 'hindi' }) {
    const identifier = audio === 'hindi'
      ? (tmdbId ? ['tmdbId', tmdbId] : imdbId ? ['imdbId', imdbId] : ['malId', malId])
      : ['malId', malId]
    if (!identifier[1]) return { ok: false, reason: 'A valid anime identifier is required for Nuvio playback', streams: [] }

    const type = mediaType === 'movie' ? 'movie' : 'tv'
    const params = new URLSearchParams({
      type,
      [identifier[0]]: String(identifier[1]),
      audio: audio === 'dub' ? 'dub' : audio === 'sub' ? 'sub' : 'hindi',
    })
    if (type === 'tv') {
      params.set('season', String(Math.max(1, Number(season) || 1)))
      params.set('episode', String(Math.max(1, Number(episode) || 1)))
    }

    let lastReason = 'Nuvio API network error'
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      try {
        const res = await fetch(`${STREAM_ENDPOINT}?${params.toString()}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        let json = null
        try { json = await res.json() } catch { /* preserve useful HTTP error below */ }
        if (!res.ok) {
          lastReason = json?.error?.message || `Nuvio API returned HTTP ${res.status}`
          if (res.status >= 500 && attempt < MAX_ATTEMPTS) continue
          return { ok: false, reason: lastReason, streams: [] }
        }
        const streams = responseSources(json).map((source, index) => normalizeSource(source, index, audio)).filter(Boolean)
        if (!streams.length) return { ok: false, reason: `No ${audio} stream was returned for this episode`, streams: [] }
        return { ok: true, streams }
      } catch (error) {
        lastReason = error?.name === 'AbortError' ? 'Nuvio API request timed out' : error?.message || 'Nuvio API network error'
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => window.setTimeout(resolve, 1200))
          continue
        }
      } finally {
        window.clearTimeout(timeout)
      }
    }
    return { ok: false, reason: lastReason, streams: [] }
  },
}
