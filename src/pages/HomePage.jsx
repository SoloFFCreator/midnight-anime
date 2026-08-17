import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AniListApi } from '../api/anilist'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'
import HeroBanner from '../components/home/HeroBanner'
import ContentRow from '../components/home/ContentRow'
import AnimeCard from '../components/home/AnimeCard'

export default function HomePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const { user } = useAuthStore()
  const { progress } = useWatchlistStore()

  useEffect(() => {
    AniListApi.fetchHome()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const continueWatching = user
    ? Object.entries(progress)
        .map(([animeId, p]) => ({ animeId, ...p }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, 10)
    : []

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-4xl mb-3">📡</p>
        <p className="font-bold mb-1">Connection failed</p>
        <p className="text-t3 text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-or text-white font-bold px-5 py-2.5 rounded-full text-sm">
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          className="w-8 h-8 border-2 border-or border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="pb-6">
      {data.trending.length > 0 && <HeroBanner items={data.trending} />}

      {continueWatching.length > 0 && (
        <div className="mt-4">
          <h2 className="px-4 py-2 text-[17px] font-extrabold text-white">Continue Watching</h2>
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none">
            {continueWatching.map((p) => (
              <ContinueCard key={p.animeId} progress={p} />
            ))}
          </div>
        </div>
      )}

      <ContentRow title="Trending Now" items={data.trending} />
      <ContentRow title="Most Popular" items={data.popular} />
      <ContentRow title="This Season" items={data.seasonal} />
      <ContentRow title="Movies" items={data.movies} />
      <ContentRow title="Action" items={data.action} genreLink="/genre/Action" />
      <ContentRow title="Romance" items={data.romance} genreLink="/genre/Romance" />
      <ContentRow title="Isekai" items={data.isekai} genreLink="/genre/Isekai" />
    </div>
  )
}

function ContinueCard({ progress }) {
  const pct = progress.duration ? Math.min(1, progress.time / (progress.duration * 60)) : 0
  return (
    <motion.a
      href={`/watch/${progress.animeId}/${progress.ep}`}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 w-40 block"
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-bg2">
        <img src={progress.cover} alt={progress.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/25">
          <div className="h-full bg-or" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      <p className="mt-1.5 text-[12px] font-semibold text-white line-clamp-1">{progress.title}</p>
      <p className="text-[10px] font-black text-or">EP {progress.ep}</p>
    </motion.a>
  )
}
