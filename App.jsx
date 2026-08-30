import { useMemo, useState } from 'react'

const anime = [
  { title: 'Solo Leveling', meta: 'S2 · 13 eps', genre: 'Action', score: '9.4', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=85' },
  { title: 'Jujutsu Kaisen', meta: 'S2 · 23 eps', genre: 'Dark fantasy', score: '9.2', image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&w=900&q=85' },
  { title: 'Demon Slayer', meta: 'S4 · 11 eps', genre: 'Adventure', score: '9.1', image: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=900&q=85' },
  { title: 'Bleach: TYBW', meta: 'S3 · 14 eps', genre: 'Shonen', score: '9.0', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=85' },
  { title: 'Frieren', meta: 'S1 · 28 eps', genre: 'Fantasy', score: '9.6', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=900&q=85' },
  { title: 'Chainsaw Man', meta: 'S1 · 12 eps', genre: 'Action', score: '8.8', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=900&q=85' },
]

function Card({ item, saved, onSave }) {
  return <article className="anime-card">
    <div className="poster" style={{ backgroundImage: `linear-gradient(180deg, transparent 50%, rgba(7,8,13,.9)), url(${item.image})` }}>
      <span className="score">★ {item.score}</span>
      <button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onSave(item.title)} aria-label={` ${saved ? 'Remove' : 'Add'} ${item.title} ${saved ? 'from' : 'to'} watchlist`}>{saved ? '✓' : '+'}</button>
      <span className="poster-title">{item.title}</span>
    </div>
    <div className="card-copy"><h3>{item.title}</h3><p>{item.meta} <span>·</span> {item.genre}</p></div>
  </article>
}

export default function App() {
  const [active, setActive] = useState('Home')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(['Frieren'])
  const filtered = useMemo(() => anime.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [query])
  const toggleSave = (title) => setSaved((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title])
  const nav = ['Home', 'Discover', 'Watchlist']

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">A</span><span>ANIME<span>STREAM</span></span></div><nav aria-label="Primary navigation">{nav.map((item) => <button key={item} className={active === item ? 'nav-item active' : 'nav-item'} onClick={() => setActive(item)}><span>{item === 'Home' ? '⌂' : item === 'Discover' ? '⌕' : '▱'}</span>{item}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item"><span>⚙</span>Settings</button><div className="profile"><div className="avatar">MK</div><div><strong>mika.k</strong><small>Premium member</small></div><span className="more">···</span></div></div></aside>
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand">ANIMESTREAM</div><div className="search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anime, characters, genres..." aria-label="Search anime" /></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♢</button><button className="user-button"><span className="avatar small">MK</span><span>mika.k</span><span>⌄</span></button></div></header>
      {active === 'Home' && <>
        <section className="hero"><div className="hero-content"><p className="eyebrow">Spotlight · New episode</p><h1>Solo<br /><em>Leveling</em></h1><p className="hero-desc">The weakest hunter of all mankind finds a second chance to become something more.</p><div className="hero-meta"><span>2025</span><span>·</span><span>TV-14</span><span>·</span><span className="rating">★ 9.4</span></div><div className="hero-actions"><button className="primary-button" onClick={() => alert('Opening Solo Leveling')}>▶ Watch now</button><button className="secondary-button" onClick={() => toggleSave('Solo Leveling')}>{saved.includes('Solo Leveling') ? '✓ In watchlist' : '+ Add to watchlist'}</button></div></div><div className="hero-fade" /></section>
        <section className="content-section"><div className="section-heading"><div><p className="eyebrow">Curated for you</p><h2>Continue watching</h2></div><button className="text-button">See all →</button></div><div className="progress-row"><div className="continue-card"><div className="mini-art one" /><div><strong>One Piece</strong><small>Episode 1102 · 23m left</small><div className="progress"><span style={{ width: '68%' }} /></div></div><button>▶</button></div><div className="continue-card"><div className="mini-art two" /><div><strong>Attack on Titan</strong><small>Episode 76 · 18m left</small><div className="progress"><span style={{ width: '42%' }} /></div></div><button>▶</button></div></div></section>
        <section className="content-section"><div className="section-heading"><div><p className="eyebrow">Trending this week</p><h2>Popular right now</h2></div><button className="text-button">Browse all →</button></div><div className="anime-grid">{filtered.map((item) => <Card key={item.title} item={item} saved={saved.includes(item.title)} onSave={toggleSave} />)}</div>{filtered.length === 0 && <p className="empty">No anime found for “{query}”.</p>}</section>
      </>}
      {active === 'Discover' && <section className="standalone"><p className="eyebrow">Explore the catalog</p><h1>Find your next<br /><em>favorite story.</em></h1><div className="filter-row">{['All', 'Action', 'Fantasy', 'Drama', 'Comedy'].map((tag) => <button key={tag} className={tag === 'All' ? 'filter active' : 'filter'}>{tag}</button>)}</div><div className="anime-grid">{filtered.map((item) => <Card key={item.title} item={item} saved={saved.includes(item.title)} onSave={toggleSave} />)}</div></section>}
      {active === 'Watchlist' && <section className="standalone"><p className="eyebrow">Your collection</p><h1>Saved for<br /><em>later.</em></h1><div className="anime-grid">{anime.filter((item) => saved.includes(item.title)).map((item) => <Card key={item.title} item={item} saved onSave={toggleSave} />)}</div>{saved.length === 0 && <p className="empty">Your watchlist is waiting for a new favorite.</p>}</section>}
    </main>
  </div>
}
