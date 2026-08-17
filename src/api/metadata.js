import { TT } from './anilist'

const TMDB_API_KEY = '6de011d3fa665efbd0e924e6bb9fd381'
const BASE = 'https://api.themoviedb.org/3'
const metadataCache = new Map()

const isConfigured = () => Boolean(TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE')

async function safeFetch(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function linkId(anime, pattern) {
  const link = (anime?.externalLinks || []).find((item) => pattern.test(`${item.site || ''} ${item.url || ''}`))
  if (!link?.url) return null
  const match = link.url.match(/(?:\/|:)(tt\d+|\d{2,})[/?#]?/i)
  return match?.[1] || null
}

function mediaTypeFor(anime) {
  return anime?.format === 'MOVIE' ? 'movie' : 'tv'
}

async function findTmdbId(anime, mediaType) {
  const direct = linkId(anime, /themoviedb|tmdb/i)
  if (direct) return direct
  if (!isConfigured()) return null

  const query = encodeURIComponent(TT(anime))
  const json = await safeFetch(`${BASE}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${query}&include_adult=false`)
  const first = json?.results?.[0]
  return first?.id ? String(first.id) : null
}

export const MetadataApi = {
  async fetch(anime) {
    const cacheKey = String(anime?.id || '')
    if (!cacheKey) return null
    if (metadataCache.has(cacheKey)) return metadataCache.get(cacheKey)

    const mediaType = mediaTypeFor(anime)
    const tmdbId = await findTmdbId(anime, mediaType)
    if (!tmdbId) {
      const empty = { tmdbId: null, imdbId: linkId(anime, /imdb/i), mediaType, seasonNumber: 1 }
      metadataCache.set(cacheKey, empty)
      return empty
    }

    const externalIds = await safeFetch(`${BASE}/${mediaType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`)
    const details = mediaType === 'tv'
      ? await safeFetch(`${BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`)
      : null
    const metadata = {
      tmdbId,
      imdbId: externalIds?.imdb_id || linkId(anime, /imdb/i) || null,
      mediaType,
      seasonNumber: details?.seasons?.find((season) => season.season_number > 0)?.season_number || 1,
    }
    metadataCache.set(cacheKey, metadata)
    return metadata
  },
}

export function metadataLinks(metadata) {
  if (!metadata) return []
  return [
    metadata.tmdbId && { label: 'TMDB', value: metadata.tmdbId, href: `https://www.themoviedb.org/${metadata.mediaType}/${metadata.tmdbId}` },
    metadata.imdbId && { label: 'IMDb', value: metadata.imdbId, href: `https://www.imdb.com/title/${metadata.imdbId}/` },
  ].filter(Boolean)
}
