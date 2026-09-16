// Character portraits are sourced from AniList's public character image CDN.
// IDs are stable so existing saved avatar selections continue to work.
export const AVATAR_CHOICES = [
  { id: 'a1', name: 'Mikasa', color: '#4f3144', emoji: '⚔️', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png' },
  { id: 'a2', name: 'Eren', color: '#3c4c39', emoji: '🔥', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg' },
  { id: 'a3', name: 'Armin', color: '#34495e', emoji: '✦', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b46494-g7xYYuBtYPnO.png' },
  { id: 'a4', name: 'Sasha', color: '#6c4932', emoji: '🍞', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b45887-QPtJH0KwqthW.jpg' },
  { id: 'a5', name: 'Inosuke', color: '#355a67', emoji: '🐗', image: 'https://s4.anilist.co/file/anilistcdn/character/large/n129130-SJC0Kn1DU39E.jpg' },
  { id: 'a6', name: 'Tanjiro', color: '#254b48', emoji: '☀️', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png' },
  { id: 'a7', name: 'Zenitsu', color: '#776332', emoji: '⚡', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b129131-FZrQ7lSlxmEr.png' },
  { id: 'a8', name: 'Nezuko', color: '#744052', emoji: '🌸', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b127518-NRlq1CQ1v1ro.png' },
  { id: 'a9', name: 'Megumi', color: '#2c3f5c', emoji: '◈', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png' },
  { id: 'a10', name: 'Yuji', color: '#8a4737', emoji: '拳', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b127212-FVm2tD0erQ5B.png' },
  { id: 'a11', name: 'Nobara', color: '#6c3e54', emoji: '✿', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b133700-f6sOO3TcgLV6.png' },
  { id: 'a12', name: 'Gojo', color: '#3a5680', emoji: '◉', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png' },
]

export const ALL_GENRES = [
  { name: 'Isekai', emoji: '🌍', description: 'Transported to another world' },
  { name: 'Action', emoji: '⚔️', description: 'Battles & epic moments' },
  { name: 'Romance', emoji: '💖', description: 'Love stories' },
  { name: 'Comedy', emoji: '😂', description: 'Laugh-out-loud moments' },
  { name: 'Fantasy', emoji: '✨', description: 'Magic & otherworlds' },
  { name: 'Adventure', emoji: '🗺️', description: 'Journey & exploration' },
  { name: 'Drama', emoji: '🎭', description: 'Emotional story-driven' },
  { name: 'Horror', emoji: '👻', description: 'Fear & darkness' },
  { name: 'Sci-Fi', emoji: '🚀', description: 'Futuristic & technology' },
  { name: 'Slice of Life', emoji: '☕', description: 'Everyday relaxing life' },
  { name: 'Sports', emoji: '🏆', description: 'Competitions & athletics' },
  { name: 'Supernatural', emoji: '🔮', description: 'Spirits & powers' },
  { name: 'Mecha', emoji: '🤖', description: 'Giant robots' },
  { name: 'Mystery', emoji: '🔍', description: 'Puzzles & secrets' },
  { name: 'Psychological', emoji: '🧠', description: 'Mind games' },
]

export function isMovie(anime) { return anime?.format === 'MOVIE' }

/** Video/audio stream URL builder — mirrors web app's loadPlayer() logic. */
export function buildStreamUrl(anime, episode, audioTrack) {
  if (!anime) return ''
  const al = anime.id
  const lang = audioTrack === 'DUB' ? 'dub' : 'sub'

  if (isMovie(anime)) {
    const tmdbLink = (anime.externalLinks || []).find((l) => /themoviedb/i.test(l.site))
    const tmdbId = tmdbLink?.url?.match(/\/(?:movie|tv)\/(\d+)/)?.[1]
    if (tmdbId) return `https://megaplay.buzz/stream/movie/${tmdbId}`
    return `https://megaplay.buzz/stream/ani/${al}/1/${lang}`
  }

  return `https://megaplay.buzz/stream/ani/${al}/${episode}/${lang}`
}
