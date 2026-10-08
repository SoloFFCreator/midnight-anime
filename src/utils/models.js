// Avatar portraits use TMDB's credited voice-cast profile image CDN.
// IDs are stable so existing saved avatar selections continue to work.
export const AVATAR_CHOICES = [
  { id: 'a1', anime: 'Attack on Titan', name: 'Mikasa', color: '#4f3144', symbol: '◇', image: 'https://image.tmdb.org/t/p/w185/zptGIN1iklKJL1xrfHKOpxR2qJ9.jpg' },
  { id: 'a2', anime: 'Attack on Titan', name: 'Eren', color: '#3c4c39', symbol: '◆', image: 'https://image.tmdb.org/t/p/w185/8wKdPV11IwowfwoqGqMMNt9hmp6.jpg' },
  { id: 'a3', anime: 'Attack on Titan', name: 'Armin', color: '#34495e', symbol: '✦', image: 'https://image.tmdb.org/t/p/w185/f7PuEx1h2g4FLgMzk9wCrWuS9Eu.jpg' },
  { id: 'a4', anime: 'Attack on Titan', name: 'Sasha', color: '#6c4932', symbol: '○', image: 'https://image.tmdb.org/t/p/w185/p3OKrnliz2C8ub14Pn5pN3T8Q9B.jpg' },
  { id: 'a5', anime: 'Demon Slayer', name: 'Inosuke', color: '#355a67', symbol: '◇', image: 'https://image.tmdb.org/t/p/w185/ugDwdWEXnmv43jcbnfAi4XwiQ8C.jpg' },
  { id: 'a6', anime: 'Demon Slayer', name: 'Tanjiro', color: '#254b48', symbol: '✦', image: 'https://image.tmdb.org/t/p/w185/ke0ROEfZo7kbu7icfO6ClWEtXIW.jpg' },
  { id: 'a7', anime: 'Demon Slayer', name: 'Zenitsu', color: '#776332', symbol: '╳', image: 'https://image.tmdb.org/t/p/w185/yrSDcgFefHtWkFmLnTrcw2t0MV.jpg' },
  { id: 'a8', anime: 'Demon Slayer', name: 'Nezuko', color: '#744052', symbol: '✧', image: 'https://image.tmdb.org/t/p/w185/AoRQOZRC0yINB0WeKnM569rV1wF.jpg' },
  { id: 'a9', anime: 'Jujutsu Kaisen', name: 'Megumi', color: '#2c3f5c', symbol: '◈', image: 'https://image.tmdb.org/t/p/w185/2otstbLfQ7MXuFt1X8MFOb4OIgd.jpg' },
  { id: 'a10', anime: 'Jujutsu Kaisen', name: 'Yuji', color: '#8a4737', symbol: '＋', image: 'https://image.tmdb.org/t/p/w185/vBnNL3Jqy0zkS3ZgsXZmvDM9Dfz.jpg' },
  { id: 'a11', anime: 'Jujutsu Kaisen', name: 'Nobara', color: '#6c3e54', symbol: '✧', image: 'https://image.tmdb.org/t/p/w185/iKKCPgKrNd4pJ0iBOC1SBZy2Y4Y.jpg' },
  { id: 'a12', anime: 'Jujutsu Kaisen', name: 'Gojo', color: '#3a5680', symbol: '◎', image: 'https://image.tmdb.org/t/p/w185/wb8behVKjBHX9XXrEydvNINCYwH.jpg' },
  { id: 'a13', anime: 'Death Note', name: 'Misa', color: '#513a52', symbol: '♡', image: 'https://image.tmdb.org/t/p/w185/AvbCkdSXoKgrQAyG08b4WdGKoX5.jpg' },
  { id: 'a14', anime: 'Death Note', name: 'Light', color: '#60452d', symbol: '△', image: 'https://image.tmdb.org/t/p/w185/nuok8ueG7k9hPZ09Tpr8e7Qn0ah.jpg' },
  { id: 'a15', anime: 'Hunter x Hunter', name: 'Killua', color: '#3e6680', symbol: '╳', image: 'https://image.tmdb.org/t/p/w185/47itMqJIuXsHnK6FVBl3OoucggL.jpg' },
  { id: 'a16', anime: 'Hunter x Hunter', name: 'Gon', color: '#56703b', symbol: '✦', image: 'https://image.tmdb.org/t/p/w185/zNjrblq3xS1idpCsmSl5P5eTon7.jpg' },
  { id: 'a17', anime: 'One Piece', name: 'Luffy', color: '#9b4531', symbol: '○', image: 'https://image.tmdb.org/t/p/w185/by4t1tYtEXsfbFj9TvOjozBmQla.jpg' },
  { id: 'a18', anime: 'One Piece', name: 'Zoro', color: '#3e604b', symbol: '◇', image: 'https://image.tmdb.org/t/p/w185/cOHSa0FBrG3u9P6g8A56sInkvod.jpg' },
]

export const ALL_GENRES = [
  { name: 'Isekai', symbol: '◎', description: 'Transported to another world' },
  { name: 'Action', symbol: '◇', description: 'Battles & epic moments' },
  { name: 'Romance', symbol: '♡', description: 'Love stories' },
  { name: 'Comedy', symbol: '◌', description: 'Laugh-out-loud moments' },
  { name: 'Fantasy', symbol: '✦', description: 'Magic & otherworlds' },
  { name: 'Adventure', symbol: '⌁', description: 'Journey & exploration' },
  { name: 'Drama', symbol: '△', description: 'Emotional story-driven' },
  { name: 'Horror', symbol: '◒', description: 'Fear & darkness' },
  { name: 'Sci-Fi', symbol: '⊕', description: 'Futuristic & technology' },
  { name: 'Slice of Life', symbol: '○', description: 'Everyday relaxing life' },
  { name: 'Sports', symbol: '✧', description: 'Competitions & athletics' },
  { name: 'Supernatural', symbol: '◈', description: 'Spirits & powers' },
  { name: 'Mecha', symbol: '▣', description: 'Giant robots' },
  { name: 'Mystery', symbol: '?', description: 'Puzzles & secrets' },
  { name: 'Psychological', symbol: '◉', description: 'Mind games' },
]

export function isMovie(anime) { return anime?.format === 'MOVIE' }
