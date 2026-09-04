import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AniListApi } from '../api/anilist'
import { groupSeasons } from '../utils/seasonGrouper'
import { ALL_GENRES } from '../utils/models'
import AnimeCard from '../components/home/AnimeCard'

export default function GenrePage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const genreInfo = ALL_GENRES.find((g) => g.name === name)

  useEffect(() => {
    setLoading(true)
    AniListApi.fetchGenre(name).then(({ results: raw }) => {
      setResults(groupSeasons(raw))
      setLoading(false)
    })
  }, [name])

  return (
    <div className="pb-10">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-bg2 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-white fill-none" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            {genreInfo && <span>{genreInfo.emoji}</span>}
            <h1 className="text-[18px] font-extrabold text-white">{name} Anime</h1>
          </div>
          {genreInfo && <p className="text-[11px] text-t3">{genreInfo.description}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div className="w-7 h-7 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
        </div>
      ) : (
        <>
          <p className="px-4 pb-2 text-[12px] text-t3">{results.length} anime</p>
          <div className="grid grid-cols-3 gap-3 px-4">
            {results.map((a) => <AnimeCard key={a.id} anime={a} width="100%" />)}
          </div>
        </>
      )}
    </div>
  )
}
