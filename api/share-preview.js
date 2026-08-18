const ANILIST_URL = 'https://graphql.anilist.co'
const LOGO_PATH = '/midnight-anime-logo.png'

const DETAIL_QUERY = `
  query($id:Int){
    Media(id:$id,type:ANIME){
      id
      title{romaji english}
      description(asHtml:false)
      episodes
      format
      streamingEpisodes{title thumbnail}
      coverImage{large extraLarge}
      bannerImage
    }
  }
`

export default async function handler(req, res) {
  const query = new URLSearchParams(req.query || {})
  const kind = query.get('kind') === 'episode' ? 'episode' : 'series'
  const id = Number(query.get('id'))
  const episode = Math.max(1, Number(query.get('episode') || 1))

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

    const title = anime.title?.english || anime.title?.romaji || 'Unknown Anime'
    const episodeTitle = anime.streamingEpisodes?.[episode - 1]?.title || `Episode ${episode}`
    const image = kind === 'episode'
      ? (anime.streamingEpisodes?.[episode - 1]?.thumbnail || anime.bannerImage || anime.coverImage?.extraLarge)
      : (anime.bannerImage || anime.coverImage?.extraLarge)
    const description = cleanDescription(anime.description) || `Watch ${title}${kind === 'episode' ? ` — ${episodeTitle}` : ''} on Midnight Anime.`
    const pageTitle = kind === 'episode' ? `${title} — ${episodeTitle} | Midnight Anime` : `${title} | Midnight Anime`
    const origin = getOrigin(req)
    const target = kind === 'episode' ? `/watch/${id}/${episode}` : `/anime/${id}`
    const canonical = `${origin}${kind === 'episode' ? `/share/episode/${id}/${episode}` : `/share/series/${id}`}`
    const html = renderPreview({ pageTitle, description, image, canonical, target, origin })

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  } catch (error) {
    return res.status(502).send(`Share preview unavailable: ${escapeHtml(error?.message || 'unknown error')}`)
  }
}

function renderPreview({ pageTitle, description, image, canonical, target, origin }) {
  const logo = `${origin}${LOGO_PATH}`
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
  <meta property="og:image" content="${escapeHtml(image || logo)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image || logo)}" />
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
