import { TT } from './anilist'

const TMDB_API_KEY = '6de011d3fa665efbd0e924e6bb9fd381'
const BASE = 'https://api.themoviedb.org/3'
const metadataCache = new Map()
const LOOKUP_TIMEOUT_MS = 10_000

const isConfigured = () => Boolean(TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE')

async function safeFetch(url) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
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

function normalized(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function titleScore(anime, result) {
  const target = normalized(TT(anime))
  const names = [result?.name, result?.original_name, result?.title, result?.original_title].map(normalized).filter(Boolean)
  if (!target || !names.length) return 0
  return names.reduce((score, name) => {
    if (name === target) return Math.max(score, 100)
    if (name.includes(target) || target.includes(name)) return Math.max(score, 75)
    const words = target.split(' ').filter((word) => word.length > 2)
    const overlap = words.filter((word) => name.includes(word)).length
    return Math.max(score, overlap / Math.max(words.length, 1) * 50)
  }, 0)
}

async function findTmdbId(anime, mediaType) {
  const direct = linkId(anime, /themoviedb|tmdb/i)
  if (direct) return direct
  if (!isConfigured()) return null

  const titles = [...new Set([TT(anime), anime?.title?.romaji, anime?.title?.english].filter(Boolean))]
  const results = []
  for (const title of titles) {
    const query = encodeURIComponent(title)
    const json = await safeFetch(`${BASE}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${query}&include_adult=false`)
    results.push(...(json?.results || []))
  }
  const unique = [...new Map(results.filter((item) => item?.id).map((item) => [item.id, item])).values()]
  const best = unique.sort((a, b) => titleScore(anime, b) - titleScore(anime, a))[0]
  return best?.id ? String(best.id) : null
}

function chooseSeason(anime, details) {
  const seasons = (details?.seasons || []).filter((season) => season.season_number > 0)
  if (!seasons.length) return 1

  const target = normalized(TT(anime))
  const named = seasons.find((season) => {
    const name = normalized(season.name)
    return name && target.includes(name) && name !== 'season'
  })
  if (named) return named.season_number

  const numberMatch = target.match(/(?:season|part|cour)\s*(\d+)/i)
  if (numberMatch) {
    const requested = Number(numberMatch[1])
    const numbered = seasons.find((season) => season.season_number === requested)
    if (numbered) return numbered.season_number
  }

  const year = Number(anime?.seasonYear)
  if (year) {
    const byYear = seasons.find((season) => String(season.air_date || '').startsWith(String(year)))
    if (byYear) return byYear.season_number
  }

  return seasons[0].season_number
}

export const MetadataApi = {
  async fetch(anime) {
    const cacheKey = String(anime?.id || '')
    if (!cacheKey) return null
    if (metadataCache.has(cacheKey)) return metadataCache.get(cacheKey)

    const mediaType = mediaTypeFor(anime)
    const tmdbId = await findTmdbId(anime, mediaType)
    if (!tmdbId) {
      return { tmdbId: null, imdbId: linkId(anime, /imdb/i), mediaType, seasonNumber: 1 }
    }

    const externalIds = await safeFetch(`${BASE}/${mediaType}/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`)
    const details = mediaType === 'tv'
      ? await safeFetch(`${BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`)
      : null
    const metadata = {
      tmdbId,
      imdbId: externalIds?.imdb_id || linkId(anime, /imdb/i) || null,
      mediaType,
      seasonNumber: mediaType === 'tv' ? chooseSeason(anime, details) : 1,
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
