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
const editorialCache = new Map()

const isConfigured = () => TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE'

function detectSeasonNumber(title) {
  const value = String(title || '')
  const numeric = value.match(/\b(?:season\s*(\d+)|(\d+)(?:st|nd|rd|th)\s+season)\b/i)
  if (numeric) return Number(numeric[1] || numeric[2])
  const word = value.match(/\b(second|third|fourth|fifth)\s+season\b/i)?.[1]?.toLowerCase()
  return ({ second: 2, third: 3, fourth: 4, fifth: 5 }[word] || 1)
}

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
  async fetchEditorial(anime) {
    if (!isConfigured()) return null
    if (editorialCache.has(anime.id)) return editorialCache.get(anime.id)

    const tmdbId = await resolveTmdbId(anime)
    if (!tmdbId) { editorialCache.set(anime.id, null); return null }

    const json = await safeFetch(`${BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=images&include_image_language=en,null`)
    if (!json) { editorialCache.set(anime.id, null); return null }

    const backdrops = json.images?.backdrops || []
    const bestBackdrop = backdrops.find((item) => !item.iso_639_1) || backdrops[0]
    const metadata = {
      tmdbId,
      backdrop: json.backdrop_path ? `${IMG_ORIGINAL}${json.backdrop_path}` : bestBackdrop?.file_path ? `${IMG_ORIGINAL}${bestBackdrop.file_path}` : null,
      poster: json.poster_path ? `${IMG_W500}${json.poster_path}` : null,
      firstAirDate: json.first_air_date || null,
      lastAirDate: json.last_air_date || null,
      numberOfSeasons: json.number_of_seasons || 0,
      numberOfEpisodes: json.number_of_episodes || 0,
      voteAverage: json.vote_average || 0,
      tagline: json.tagline || '',
      networks: (json.networks || []).map((network) => network.name).filter(Boolean),
    }
    editorialCache.set(anime.id, metadata)
    return metadata
  },
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

    const seasonNumber = detectSeasonNumber(TT(anime))
    const json = await safeFetch(`${BASE}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`)
    const episodes = json?.episodes || []
    if (!episodes.length) { episodeImageCache.set(anime.id, null); return null }

    const map = {}
    episodes.forEach((ep) => {
      if (ep.still_path || ep.name) {
        map[ep.episode_number] = {
          image: ep.still_path ? `${IMG_W500}${ep.still_path}` : null,
          title: ep.name || null,
        }
      }
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
