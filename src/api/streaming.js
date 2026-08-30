/**
 * Streaming source interface — deliberately thin and swappable. This app
 * never hardcodes a specific third-party scraper/embed source; it calls
 * whatever endpoint you configure below and expects a direct stream URL
 * (or an embed URL) back. Point BASE_URL at your own streaming API.
 *
 * Expected response shape (adjust the parsing in `fetchStreamSources`
 * below to match whatever your actual API returns):
 * {
 *   sources: [
 *     { url: "https://.../stream.m3u8", quality: "1080p", type: "hls" },
 *     { url: "https://.../embed/xyz", type: "embed" }
 *   ],
 *   subtitles: [{ url: "https://.../en.vtt", language: "en", label: "English" }]
 * }
 */

const BASE_URL = 'https://YOUR-STREAMING-API.example.com' // <-- point this at your own API

export const StreamingApi = {
  /**
   * @param {number} animeId - AniList ID (or map to your own ID scheme here)
   * @param {number} episode
   * @param {'sub'|'dub'} audio
   */
  async fetchStreamSources(animeId, episode, audio = 'sub') {
    try {
      const res = await fetch(`${BASE_URL}/api/stream?id=${animeId}&ep=${episode}&audio=${audio}`)
      if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
      const json = await res.json()
      if (!json.sources?.length) return { ok: false, reason: 'No sources returned' }
      return { ok: true, sources: json.sources, subtitles: json.subtitles || [] }
    } catch (e) {
      return { ok: false, reason: e.message || 'Network error' }
    }
  },
}

/** True if a URL is a directly playable media file (react-native-video can open it). */
export function isDirectStreamUrl(url) {
  return /\.(m3u8|mp4|mkv|webm)(\?|$)/i.test(url || '')
}
