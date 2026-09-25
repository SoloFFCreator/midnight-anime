const OPEN_SUBTITLES_API = 'https://api.opensubtitles.com/api/v1'
const USER_AGENT = 'MidnightAnime v2.0'

function apiKey() {
  return process.env.OPENSUBTITLES_API_KEY
}

function headers() {
  return {
    Accept: 'application/json',
    'Api-Key': apiKey() || '',
    'User-Agent': USER_AGENT,
  }
}

function srtToVtt(text) {
  if (/^WEBVTT/m.test(text)) return text
  return `WEBVTT\n\n${text.replace(/\r?\n/g, '\n').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')}`
}

async function openSubtitles(path, options = {}) {
  return fetch(`${OPEN_SUBTITLES_API}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } })
}

export default async function handler(req, res) {
  if (!apiKey()) return res.status(503).json({ error: 'Subtitle service is not configured' })

  try {
    if (req.query?.fileId) {
      const fileId = Number(req.query.fileId)
      if (!Number.isInteger(fileId) || fileId <= 0) return res.status(400).json({ error: 'Invalid subtitle file ID' })
      const upstream = await openSubtitles('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId, sub_format: 'srt' }),
      })
      const json = await upstream.json()
      if (!upstream.ok || !json?.link) return res.status(upstream.status || 502).json({ error: json?.message || 'Subtitle download failed' })
      const subtitle = await fetch(json.link)
      if (!subtitle.ok) return res.status(502).json({ error: 'Subtitle file could not be fetched' })
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8')
      return res.status(200).send(srtToVtt(await subtitle.text()))
    }

    const title = String(req.query?.title || '').trim()
    const season = Number(req.query?.season || 1)
    const episode = Number(req.query?.episode || 1)
    const language = String(req.query?.language || 'en').toLowerCase()
    if (!title) return res.status(400).json({ error: 'Anime title is required' })

    const params = new URLSearchParams({
      query: title,
      season_number: String(Math.max(1, season)),
      episode_number: String(Math.max(1, episode)),
      languages: language,
      type: 'episode',
      order_by: 'download_count',
      order_direction: 'desc',
    })
    const upstream = await openSubtitles(`/subtitles?${params.toString()}`)
    const json = await upstream.json()
    if (!upstream.ok) return res.status(upstream.status).json({ error: json?.message || 'Subtitle search failed' })

    const tracks = (json?.data || []).slice(0, 5).map((item) => {
      const attributes = item.attributes || {}
      const file = attributes.files?.[0]
      if (!file?.file_id) return null
      return {
        id: String(item.id),
        fileId: file.file_id,
        language: attributes.language || language,
        label: attributes.language === 'en' ? 'English' : String(attributes.language || language).toUpperCase(),
        release: attributes.release || 'OpenSubtitles',
        hearingImpaired: Boolean(attributes.hearing_impaired),
        src: `/api/subtitles?fileId=${encodeURIComponent(file.file_id)}`,
      }
    }).filter(Boolean)

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=120')
    return res.status(200).json({ tracks })
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Subtitle service unavailable' })
  }
}
