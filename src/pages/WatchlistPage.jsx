import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AniListApi } from '../api/anilist'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'
import AnimeCard from '../components/home/AnimeCard'

export default function WatchlistPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { watchlist } = useWatchlistStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    Promise.all([...watchlist].map((id) => AniListApi.fetchDetail(id).catch(() => null)))
      .then((results) => { setItems(results.filter(Boolean)); setLoading(false) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, watchlist.size])

  return (
    <div className="pb-10">
      <h1 className="px-4 py-4 text-[20px] font-black text-white">My List</h1>

      {!user ? (
        <EmptyPrompt icon="🔖" title="Sign in to save anime" subtitle="Your watchlist syncs across devices" cta="Sign In" onClick={() => navigate('/auth')} />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <motion.div className="w-7 h-7 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
        </div>
      ) : items.length === 0 ? (
        <EmptyPrompt icon="📑" title="Your list is empty" subtitle="Tap the bookmark icon on any anime to add it" />
      ) : (
        <div className="grid grid-cols-3 gap-3 px-4">
          {items.map((a) => <AnimeCard key={a.id} anime={a} width="100%" />)}
        </div>
      )}
    </div>
  )
}

function EmptyPrompt({ icon, title, subtitle, cta, onClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center px-6">
      <p className="text-4xl">{icon}</p>
      <p className="font-bold text-white">{title}</p>
      <p className="text-t3 text-[12px]">{subtitle}</p>
      {cta && (
        <button onClick={onClick} className="mt-3 bg-or text-white font-bold px-5 py-2.5 rounded-full text-sm">{cta}</button>
      )}
    </div>
  )
}
