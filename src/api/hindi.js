const BASE = 'https://midnight-anime-core.vercel.app/api/anime'

export const HindiApi = {
  async fetchStreamUrl(animeId, episode) {
    try {
      const res = await fetch(`${BASE}?id=${animeId}&ep=${episode}`)
      if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
      const json = await res.json()
      if (!json.streamUrl) return { ok: false, reason: 'No stream URL in response' }
      return { ok: true, streamUrl: json.streamUrl }
    } catch (e) {
      return { ok: false, reason: e.message || 'Network error' }
    }
  },
}
