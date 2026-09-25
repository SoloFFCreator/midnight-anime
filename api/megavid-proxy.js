const ALLOWED_HOSTS = new Set(['megavid.buzz', 'www.megavid.buzz'])
const HLS_TYPES = new Set(['application/vnd.apple.mpegurl', 'application/x-mpegurl', 'audio/mpegurl', 'audio/x-mpegurl'])

function proxyUrl(url) {
  return `/api/megavid-proxy?url=${encodeURIComponent(url)}`
}

function rewritePlaylist(body, sourceUrl) {
  return body.split(/\r?\n/).map((line) => {
    const trimmed = line.trim()
    if (!trimmed) return line

    let rewritten = line.replace(/URI="([^"]+)"/g, (_match, uri) => {
      try { return `URI="${proxyUrl(new URL(uri, sourceUrl).toString())}"` } catch { return `URI="${uri}"` }
    })
    if (!trimmed.startsWith('#')) {
      try { rewritten = proxyUrl(new URL(trimmed, sourceUrl).toString()) } catch { /* keep malformed provider line unchanged */ }
    }
    return rewritten
  }).join('\n')
}

export default async function handler(req, res) {
  const rawUrl = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url
  if (!rawUrl) return res.status(400).json({ error: 'A Megavid URL is required' })

  let target
  try { target = new URL(rawUrl) } catch { return res.status(400).json({ error: 'Invalid Megavid URL' }) }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return res.status(403).json({ error: 'Only Megavid media URLs are supported' })
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: '*/*',
        Origin: 'https://megavid.buzz',
        Referer: 'https://megavid.buzz/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
      },
    })
    if (!upstream.ok) return res.status(upstream.status).send(await upstream.text())

    const contentType = upstream.headers.get('content-type') || ''
    const isPlaylist = HLS_TYPES.has(contentType.split(';')[0].toLowerCase()) || /\.m3u8(?:$|[?#])/i.test(target.pathname)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', isPlaylist ? 'application/vnd.apple.mpegurl' : contentType || 'application/octet-stream')

    if (isPlaylist) return res.status(200).send(rewritePlaylist(await upstream.text(), target.toString()))
    return res.status(200).send(Buffer.from(await upstream.arrayBuffer()))
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Megavid proxy request failed' })
  }
}
