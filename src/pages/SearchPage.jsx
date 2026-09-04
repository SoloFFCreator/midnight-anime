import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AniListApi } from '../api/anilist'
import { groupSeasons } from '../utils/seasonGrouper'
import { ALL_GENRES } from '../utils/models'
import AnimeCard from '../components/home/AnimeCard'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [ungroupedCount, setUngroupedCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('ma_recent') || '[]'))
  const debounceRef = useRef(null)

  function saveRecent(q) {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 10)
    setRecent(next)
    localStorage.setItem('ma_recent', JSON.stringify(next))
  }

  async function runSearch(q) {
    if (!q.trim()) return
    setLoading(true)
    setHasSearched(true)
    saveRecent(q)
    try {
      const { results: raw } = await AniListApi.search(q)
      const grouped = groupSeasons(raw)
      setResults(grouped)
      setUngroupedCount(raw.length)
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  function onChange(v) {
    setQuery(v)
    clearTimeout(debounceRef.current)
    if (!v.trim()) { setResults([]); setHasSearched(false); return }
    debounceRef.current = setTimeout(() => runSearch(v), 500)
  }

  return (
    <div className="pb-10">
      <div className="flex items-center gap-2.5 mx-4 mt-4 mb-2 bg-bg2 rounded-full px-3.5 py-2.5">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-t3 fill-none flex-shrink-0" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
          placeholder="Search anime, movies..."
          className="flex-1 bg-transparent outline-none text-white text-[14px] placeholder:text-t4"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false) }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-t3 fill-none" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {!hasSearched ? (
        <EmptyState recent={recent} onRecentClick={runSearch} onRecentRemove={(q) => {
          const next = recent.filter((r) => r !== q); setRecent(next); localStorage.setItem('ma_recent', JSON.stringify(next))
        }} onGenreClick={(g) => navigate(`/genre/${g}`)} />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <motion.div className="w-7 h-7 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-2 text-center px-6">
          <p className="text-4xl">🔍</p>
          <p className="font-bold text-white">No results</p>
          <p className="text-t3 text-[12px]">Nothing found for "{query}"</p>
        </div>
      ) : (
        <>
          <p className="px-4 py-2 text-[12px] text-t3">
            {results.length === ungroupedCount ? `${results.length} results` : `${results.length} series · ${ungroupedCount} seasons grouped`}
          </p>
          <div className="grid grid-cols-3 gap-3 px-4">
            {results.map((a) => <AnimeCard key={a.id} anime={a} width="100%" />)}
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState({ recent, onRecentClick, onRecentRemove, onGenreClick }) {
  return (
    <div className="px-4">
      {recent.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-t3 py-2">Recent Searches</p>
          {recent.map((q) => (
            <div key={q} className="flex items-center justify-between py-2 border-b border-white/5">
              <span onClick={() => onRecentClick(q)} className="text-t2 text-[14px] cursor-pointer">{q}</span>
              <button onClick={() => onRecentRemove(q)}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-t4 fill-none" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] font-bold text-t3 py-2">Browse by Genre</p>
      <div className="grid grid-cols-2 gap-2.5 pb-6">
        {ALL_GENRES.map((g) => (
          <div key={g.name} onClick={() => onGenreClick(g.name)} className="flex items-center gap-2 bg-bg2 rounded-xl p-3 cursor-pointer">
            <span className="text-lg">{g.emoji}</span>
            <div>
              <p className="text-[13px] font-bold text-white">{g.name}</p>
              <p className="text-[10px] text-t3">{g.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
