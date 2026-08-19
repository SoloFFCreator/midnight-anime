const ANILIST_URL = 'https://graphql.anilist.co'
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY || '6de011d3fa665efbd0e924e6bb9fd381'
const TMDB_IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original'
const TMDB_IMAGE_W780 = 'https://image.tmdb.org/t/p/w780'
const LOGO_PATH = '/midnight-anime-logo.png'

const DETAIL_QUERY = `
  query($id:Int){
    Media(id:$id,type:ANIME){
      id
      title{romaji english native}
      description(asHtml:false)
      episodes
      format
      streamingEpisodes{title thumbnail}
      coverImage{large extraLarge}
      bannerImage
      externalLinks{site url}
    }
  }
`

export default async function handler(req, res) {
  const query = new URLSearchParams(req.query || {})
  const kind = query.get('kind') === 'episode' ? 'episode' : 'series'
  const id = Number(query.get('id'))
  const episode = Math.max(1, Number(query.get('episode') || 1))
  const season = Math.max(1, Number(query.get('season') || 1))

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).send('A valid anime id is required.')
  }

  try {
    const upstream = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: DETAIL_QUERY, variables: { id } }),
    })
    const payload = await upstream.json()
    const anime = payload.data?.Media

    if (!upstream.ok || !anime) {
      return res.status(404).send('Anime not found.')
    }

    const title = anime.title?.english || anime.title?.romaji || anime.title?.native || 'Unknown Anime'
    const anilistEpisode = anime.streamingEpisodes?.[episode - 1]
    const tmdb = await resolveTmdbArtwork(anime, { kind, season, episode })
    const episodeTitle = tmdb.episodeTitle || anilistEpisode?.title || `Episode ${episode}`
    const anilistImage = kind === 'episode'
      ? (anilistEpisode?.thumbnail || anime.bannerImage || anime.coverImage?.extraLarge)
      : (anime.bannerImage || anime.coverImage?.extraLarge)
    const image = tmdb.image || anilistImage
    const description = cleanDescription(
      (kind === 'episode' && tmdb.episodeDescription) || anime.description,
    ) || `Watch ${title}${kind === 'episode' ? ` — ${episodeTitle}` : ''} on Midnight Anime.`
    const pageTitle = kind === 'episode' ? `${title} — ${episodeTitle} | Midnight Anime` : `${title} | Midnight Anime`
    const origin = getOrigin(req)
    const target = kind === 'episode' ? `/watch/${id}/${episode}` : `/anime/${id}`
    const canonical = `${origin}${kind === 'episode' ? `/share/episode/${id}/${episode}` : `/share/series/${id}`}`
    const html = renderPreview({ pageTitle, description, image, canonical, target, origin, tmdbId: tmdb.tmdbId })

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  } catch (error) {
    return res.status(502).send(`Share preview unavailable: ${escapeHtml(error?.message || 'unknown error')}`)
  }
}

async function resolveTmdbArtwork(anime, { kind, season, episode }) {
  const media = await resolveTmdbMedia(anime)
  if (!media) return {}

  const details = await tmdbFetch(`/${media.mediaType}/${media.id}`, {
    append_to_response: 'images',
    include_image_language: 'en,null',
  })
  if (!details) return { tmdbId: media.id }

  const backdrop = details.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${details.backdrop_path}` : null
  const poster = details.poster_path ? `${TMDB_IMAGE_W780}${details.poster_path}` : null
  const imageBackdrops = details.images?.backdrops || []
  const alternateBackdrop = imageBackdrops.find((item) => !item.iso_639_1)?.file_path || imageBackdrops[0]?.file_path
  const seriesImage = backdrop || (alternateBackdrop ? `${TMDB_IMAGE_ORIGINAL}${alternateBackdrop}` : null) || poster

  if (kind !== 'episode' || media.mediaType !== 'tv') {
    return { tmdbId: media.id, image: seriesImage }
  }

  const episodeData = await tmdbFetch(`/tv/${media.id}/season/${season}/episode/${episode}`, {
    append_to_response: 'images',
    include_image_language: 'en,null',
  })
  const episodeImage = episodeData?.still_path ? `${TMDB_IMAGE_ORIGINAL}${episodeData.still_path}` : null

  return {
    tmdbId: media.id,
    image: episodeImage || seriesImage,
    episodeTitle: episodeData?.name || null,
    episodeDescription: episodeData?.overview || null,
  }
}

async function resolveTmdbMedia(anime) {
  const directLink = (anime.externalLinks || []).find((link) => /themoviedb/i.test(link.site || ''))
  const directMatch = directLink?.url?.match(/themoviedb\.org\/(tv|movie)\/(\d+)/i)
  if (directMatch) return { mediaType: directMatch[1], id: directMatch[2] }

  const titles = [anime.title?.english, anime.title?.romaji, anime.title?.native].filter(Boolean)
  if (!titles.length || !TMDB_API_KEY) return null

  for (const title of [...new Set(titles)]) {
    const search = await tmdbFetch('/search/multi', {
      query: title,
      include_adult: 'false',
      language: 'en-US',
    })
    const candidates = (search?.results || []).filter((result) => result.media_type === 'tv' || result.media_type === 'movie')
    const best = candidates.sort((a, b) => scoreTmdbMatch(b, title) - scoreTmdbMatch(a, title))[0]
    if (best?.id) return { mediaType: best.media_type, id: String(best.id) }
  }

  return null
}

function scoreTmdbMatch(result, title) {
  const wanted = normalizeTitle(title)
  const names = [result.name, result.original_name, result.title, result.original_title].filter(Boolean).map(normalizeTitle)
  if (names.includes(wanted)) return 100
  if (names.some((name) => name.includes(wanted) || wanted.includes(name))) return 70
  return 10
}

function normalizeTitle(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

async function tmdbFetch(path, params = {}) {
  if (!TMDB_API_KEY) return null
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

function renderPreview({ pageTitle, description, image, canonical, target, origin, tmdbId }) {
  const logo = `${origin}${LOGO_PATH}`
  const previewImage = image || logo
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="theme-color" content="#ff7411" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <link rel="icon" href="${escapeHtml(logo)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Midnight Anime" />
  <meta property="og:title" content="${escapeHtml(pageTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(previewImage)}" />
  <meta property="og:image:alt" content="${escapeHtml(pageTitle)} artwork" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  ${tmdbId ? `<meta name="tmdb:id" content="${escapeHtml(tmdbId)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(previewImage)}" />
</head>
<body style="background:#050507;color:#fff;font-family:Arial,sans-serif;text-align:center;padding:48px 20px">
  <img src="${escapeHtml(logo)}" alt="Midnight Anime" width="72" height="72" style="border-radius:18px" />
  <h1>${escapeHtml(pageTitle)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${escapeHtml(target)}" style="color:#ff7411">Open in Midnight Anime</a></p>
  <script>window.setTimeout(function(){ window.location.replace(${JSON.stringify(target)}) }, 120)</script>
</body>
</html>`
}

function getOrigin(req) {
  const forwardedProto = req.headers?.['x-forwarded-proto'] || 'https'
  const host = req.headers?.host || 'midnight-anime.vercel.app'
  return `${forwardedProto}://${host}`
}

function cleanDescription(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 240)
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
