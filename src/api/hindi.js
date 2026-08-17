const STREAM_ENDPOINT = '/api/hindi-stream'

function isPlayableUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function normalizeSource(source, index) {
  if (!isPlayableUrl(source?.url)) return null
  const url = source.url.trim()
  const isHls = /\.m3u8(?:$|[?#])/i.test(url) || /m3u8/i.test(source?.type || '')
  return {
    id: `${source.name || 'Hindi source'}-${source.quality || index}`,
    name: source.name || 'Hindi source',
    title: source.title || `Hindi${source.quality ? ` — ${source.quality}` : ''}`,
    quality: source.quality || 'Auto',
    url,
    type: isHls ? 'hls' : 'mp4',
    headers: source.headers || {},
  }
}

export const HindiApi = {
  async fetchStreams({ tmdbId, mediaType = 'tv', season = 1, episode = 1 }) {
    if (!tmdbId) return { ok: false, reason: 'TMDB ID is required for Hindi playback', streams: [] }

    try {
      const params = new URLSearchParams({
        tmdbId: String(tmdbId),
        type: mediaType,
        season: String(season),
        episode: String(episode),
        audio: 'hindi',
      })
      const res = await fetch(`${STREAM_ENDPOINT}?${params.toString()}`, { headers: { Accept: 'application/json' } })
      if (!res.ok) return { ok: false, reason: `Hindi API returned HTTP ${res.status}`, streams: [] }
      const json = await res.json()
      const streams = (Array.isArray(json) ? json : json?.streams || json?.sources || [])
        .map(normalizeSource)
        .filter(Boolean)

      if (!streams.length) return { ok: false, reason: 'No direct Hindi stream was returned', streams: [] }
      return { ok: true, streams }
    } catch (error) {
      return { ok: false, reason: error.message || 'Hindi API network error', streams: [] }
    }
  },
}
