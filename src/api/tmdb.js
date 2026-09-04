import { TT } from '../api/anilist'

/**
 * TMDB integration — supplies higher-quality visual assets AniList doesn't
 * reliably provide: animated title logos, per-episode stills, textless
 * backdrops.
 *
 * ⚠️ SETUP REQUIRED: paste your own TMDB API key below (or better, wire
 * this through your own backend proxy so the key never ships in client
 * bundles — see note at the bottom of this file). Without a key, all
 * lookups return null and callers fall back to AniList's own images.
 */
const TMDB_API_KEY = '6de011d3fa665efbd0e924e6bb9fd381'
const BASE = 'https://api.themoviedb.org/3'
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'
const IMG_W500 = 'https://image.tmdb.org/t/p/w500'

const logoCache = new Map()
const backdropCache = new Map()
const episodeImageCache = new Map()

const isConfigured = () => TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE'

async function safeFetch(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function extractTmdbId(anime) {
  const link = (anime.externalLinks || []).find((l) => /themoviedb/i.test(l.site))
  if (!link) return null
  const m = link.url.match(/\/(?:movie|tv)\/(\d+)/)
  return m ? m[1] : null
}

async function resolveTmdbId(anime) {
  const direct = extractTmdbId(anime)
  if (direct) return direct
  if (!isConfigured()) return null
  const json = await safeFetch(`${BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(TT(anime))}`)
  return json?.results?.[0]?.id ? String(json.results[0].id) : null
}

export const TmdbApi = {
  async fetchLogo(anime) {
    if (!isConfigured()) return null
    if (logoCache.has(anime.id)) return logoCache.get(anime.id)

    const tmdbId = await resolveTmdbId(anime)
    if (!tmdbId) { logoCache.set(anime.id, null); return null }

    const json = await safeFetch(`${BASE}/tv/${tmdbId}/images?api_key=${TMDB_API_KEY}&include_image_language=en,ja,null`)
    const logos = json?.logos || []
    if (!logos.length) { logoCache.set(anime.id, null); return null }

    const best = logos.find((l) => l.iso_639_1 === 'en') || logos.find((l) => l.iso_639_1 === 'ja') || logos[0]
    const url = IMG_W500 + best.file_path
    logoCache.set(anime.id, url)
    return url
  },

  async fetchBackdrop(anime) {
    if (!isConfigured()) return null
    if (backdropCache.has(anime.id)) return backdropCache.get(anime.id)

    const tmdbId = await resolveTmdbId(anime)
    if (!tmdbId) { backdropCache.set(anime.id, null); return null }

    const json = await safeFetch(`${BASE}/tv/${tmdbId}/images?api_key=${TMDB_API_KEY}`)
    const backdrops = json?.backdrops || []
    if (!backdrops.length) { backdropCache.set(anime.id, null); return null }

    const best = backdrops.find((b) => !b.iso_639_1) || backdrops[0]
    const url = IMG_ORIGINAL + best.file_path
    backdropCache.set(anime.id, url)
    return url
  },

  async fetchEpisodeImages(anime) {
    if (!isConfigured()) return null
    if (episodeImageCache.has(anime.id)) return episodeImageCache.get(anime.id)

    const tmdbId = await resolveTmdbId(anime)
    if (!tmdbId) { episodeImageCache.set(anime.id, null); return null }

    const json = await safeFetch(`${BASE}/tv/${tmdbId}/season/1?api_key=${TMDB_API_KEY}`)
    const episodes = json?.episodes || []
    if (!episodes.length) { episodeImageCache.set(anime.id, null); return null }

    const map = {}
    episodes.forEach((ep) => {
      if (ep.still_path) map[ep.episode_number] = IMG_W500 + ep.still_path
    })
    episodeImageCache.set(anime.id, map)
    return map
  },
}

// ── Production note ──────────────────────────────────────────────────
// This key ships in the client bundle as-is, same tradeoff as the web
// app's inline <script> version. For a hardened production deploy,
// replace these direct TMDB calls with requests to your own backend
// (e.g. a small serverless function) that holds the real key server-side
// and forwards the request — same pattern discussed for the Android
// build. Nothing else in this file needs to change, just the base URLs.
