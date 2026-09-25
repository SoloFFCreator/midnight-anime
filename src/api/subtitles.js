export const SubtitlesApi = {
  async search({ title, season = 1, episode = 1, language = 'en' }) {
    const params = new URLSearchParams({ title, season: String(season), episode: String(episode), language })
    const response = await fetch(`/api/subtitles?${params.toString()}`, { headers: { Accept: 'application/json' } })
    const json = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(json?.error || `Subtitle search failed (${response.status})`)
    return json.tracks || []
  },
}
