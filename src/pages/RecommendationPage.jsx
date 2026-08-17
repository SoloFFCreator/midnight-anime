import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AniListApi, TT, totEps } from '../api/anilist'
import { usePlayerStore } from '../store/playerStore'

export default function RecommendationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [anime, setAnime] = useState(null)
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const dismissRecommendations = usePlayerStore((s) => s.dismissRecommendations)

  useEffect(() => {
    setLoading(true)
    AniListApi.fetchDetail(Number(id)).then((data) => {
      setAnime(data)
      const nodes = (data.recommendations?.nodes || []).map((n) => n.mediaRecommendation).filter(Boolean).slice(0, 8)
      setRecs(nodes)
      setLoading(false)
    })
  }, [id])

  function handleClose() {
    dismissRecommendations()
    navigate('/app', { replace: true })
  }

  function handlePick(rec) {
    dismissRecommendations()
    navigate(`/anime/${rec.id}`)
  }

  const bgUrl = anime?.bannerImage || anime?.coverImage?.extraLarge
  const srcGenres = anime?.genres || []

  return (
    <div className="fixed inset-0 z-50 bg-[#050507] overflow-y-auto">
      {bgUrl && (
        <>
          <img src={bgUrl} alt="" className="fixed inset-0 w-full h-full object-cover blur-3xl scale-110" />
          <div className="fixed inset-0 bg-gradient-to-b from-black/55 via-black/85 to-[#0a0a0f]" />
        </>
      )}

      <div className="relative">
        <div className="flex items-center justify-between px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 bg-green/15 border border-green/30 text-green text-[11px] font-black px-3 py-1.5 rounded-full"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            SERIES COMPLETE
          </motion.div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-white fill-none" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {anime && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-4 py-5">
            <p className="text-[11px] font-bold text-white/55">YOU JUST FINISHED</p>
            <h1 className="text-2xl font-black text-white leading-tight mt-1">{TT(anime)}</h1>
            <p className="text-[13px] text-white/60 mt-1.5">
              {totEps(anime) >= 9999 ? 'Ongoing' : `${totEps(anime)} Episodes`} · Complete
            </p>
          </motion.div>
        )}

        <div className="bg-[#0a0a0f] rounded-t-[20px] pt-6 min-h-[50vh]">
          <div className="px-4">
            <h2 className="text-[19px] font-black text-white">Watch Next</h2>
            <p className="text-t3 text-[12.5px]">Handpicked from what you just watched</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <motion.div className="w-7 h-7 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            </div>
          ) : recs.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <p className="text-3xl">🎬</p>
              <p className="text-t2 text-[13px]">No recommendations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 px-4 py-4">
              {recs.map((rec, i) => (
                <RecCard key={rec.id} rec={rec} srcGenres={srcGenres} index={i} onClick={() => handlePick(rec)} />
              ))}
            </div>
          )}

          <div className="px-4 pb-6">
            <button onClick={handleClose} className="w-full h-[50px] bg-white/[0.06] rounded-xl text-t2 font-bold text-[13.5px] flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecCard({ rec, srcGenres, index, onClick }) {
  const shared = (rec.genres || []).filter((g) => srcGenres.includes(g))
  const reason = shared.length ? shared.slice(0, 2).join(' · ') : rec.format || 'TV'
  const score = rec.averageScore ? (rec.averageScore / 10).toFixed(1) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-bg3">
        <img src={rec.coverImage?.large} alt={TT(rec)} className="w-full h-full object-cover" />
        {score && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 text-or text-[10px] font-black px-1.5 py-0.5 rounded-md">★{score}</div>
        )}
      </div>
      <p className="mt-1.5 text-[12px] font-black text-white leading-tight line-clamp-2">{TT(rec)}</p>
      <p className="text-[10px] font-bold text-or">{reason}</p>
    </motion.div>
  )
}
