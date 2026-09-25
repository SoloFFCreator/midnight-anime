// Character portraits are sourced from AniList's public character image CDN.
// IDs are stable so existing saved avatar selections continue to work.
export const AVATAR_CHOICES = [
  { id: 'a1', anime: 'Attack on Titan', name: 'Mikasa', color: '#4f3144', symbol: '◇', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png' },
  { id: 'a2', anime: 'Attack on Titan', name: 'Eren', color: '#3c4c39', symbol: '◆', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg' },
  { id: 'a3', anime: 'Attack on Titan', name: 'Armin', color: '#34495e', symbol: '✦', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b46494-g7xYYuBtYPnO.png' },
  { id: 'a4', anime: 'Attack on Titan', name: 'Sasha', color: '#6c4932', symbol: '○', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b45887-QPtJH0KwqthW.jpg' },
  { id: 'a5', anime: 'Demon Slayer', name: 'Inosuke', color: '#355a67', symbol: '◇', image: 'https://s4.anilist.co/file/anilistcdn/character/large/n129130-SJC0Kn1DU39E.jpg' },
  { id: 'a6', anime: 'Demon Slayer', name: 'Tanjiro', color: '#254b48', symbol: '✦', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png' },
  { id: 'a7', anime: 'Demon Slayer', name: 'Zenitsu', color: '#776332', symbol: '╳', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b129131-FZrQ7lSlxmEr.png' },
  { id: 'a8', anime: 'Demon Slayer', name: 'Nezuko', color: '#744052', symbol: '✧', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b127518-NRlq1CQ1v1ro.png' },
  { id: 'a9', anime: 'Jujutsu Kaisen', name: 'Megumi', color: '#2c3f5c', symbol: '◈', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png' },
  { id: 'a10', anime: 'Jujutsu Kaisen', name: 'Yuji', color: '#8a4737', symbol: '＋', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b127212-FVm2tD0erQ5B.png' },
  { id: 'a11', anime: 'Jujutsu Kaisen', name: 'Nobara', color: '#6c3e54', symbol: '✧', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b133700-f6sOO3TcgLV6.png' },
  { id: 'a12', anime: 'Jujutsu Kaisen', name: 'Gojo', color: '#3a5680', symbol: '◎', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png' },
  { id: 'a13', anime: 'Death Note', name: 'Misa', color: '#513a52', symbol: '♡', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b835-CiZa8y2z2gCz.png' },
  { id: 'a14', anime: 'Death Note', name: 'Light', color: '#60452d', symbol: '△', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b80-26EhwSsSqQ50.png' },
  { id: 'a15', anime: 'Hunter x Hunter', name: 'Killua', color: '#3e6680', symbol: '╳', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b27-Z5O02kQUydpT.jpg' },
  { id: 'a16', anime: 'Hunter x Hunter', name: 'Gon', color: '#56703b', symbol: '✦', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b30-lyFExKyDhefc.jpg' },
  { id: 'a17', anime: 'One Piece', name: 'Luffy', color: '#9b4531', symbol: '○', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png' },
  { id: 'a18', anime: 'One Piece', name: 'Zoro', color: '#3e604b', symbol: '◇', image: 'https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png' },
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
