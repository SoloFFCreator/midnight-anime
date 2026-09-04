// Original color+icon avatar system — not third-party character art.
export const AVATAR_CHOICES = [
  { id: 'a1', name: 'Sunset',  color: '#f47521', emoji: '🌅' },
  { id: 'a2', name: 'Moon',    color: '#6c5ce7', emoji: '🌙' },
  { id: 'a3', name: 'Flame',   color: '#e74c3c', emoji: '🔥' },
  { id: 'a4', name: 'Storm',   color: '#3b82f6', emoji: '⚡' },
  { id: 'a5', name: 'Leaf',    color: '#22c55e', emoji: '🍃' },
  { id: 'a6', name: 'Star',    color: '#f59e0b', emoji: '⭐' },
  { id: 'a7', name: 'Wave',    color: '#06b6d4', emoji: '🌊' },
  { id: 'a8', name: 'Blossom', color: '#ec4899', emoji: '🌸' },
  { id: 'a9', name: 'Shadow',  color: '#64748b', emoji: '🌑' },
  { id: 'a10', name: 'Ghost',  color: '#a78bfa', emoji: '👻' },
  { id: 'a11', name: 'Skull',  color: '#ef4444', emoji: '💀' },
  { id: 'a12', name: 'Crown',  color: '#facc15', emoji: '👑' },
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
export function buildStreamUrl(anime, episode, audioTrack, server) {
  if (!anime) return ''
  const al = anime.id
  const lang = audioTrack === 'DUB' ? 'dub' : 'sub'

  if (isMovie(anime)) {
    if (server === 'VIDNEST') return `https://vidnest.fun/animepahe/${al}/1/${lang}`
    const tmdbLink = (anime.externalLinks || []).find((l) => /themoviedb/i.test(l.site))
    const tmdbId = tmdbLink?.url?.match(/\/(?:movie|tv)\/(\d+)/)?.[1]
    if (tmdbId) return `https://megaplay.buzz/stream/movie/${tmdbId}`
    return `https://megaplay.buzz/stream/ani/${al}/1/${lang}`
  }

  return server === 'VIDNEST'
    ? `https://vidnest.fun/animepahe/${al}/${episode}/${lang}`
    : `https://megaplay.buzz/stream/ani/${al}/${episode}/${lang}`
}
