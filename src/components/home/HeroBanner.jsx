import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TT } from '../../api/anilist'
import { TmdbApi } from '../../api/tmdb'

export default function HeroBanner({ items }) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [backdrops, setBackdrops] = useState({})
  const [logos, setLogos] = useState({})

  const anime = items[index % items.length]

  useEffect(() => {
    if (!items.length) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 6500)
    return () => clearInterval(timer)
  }, [items.length])

  // Fetch TMDB visuals for the current slide, once per anime
  useEffect(() => {
    if (!anime) return
    if (!(anime.id in backdrops)) {
      TmdbApi.fetchBackdrop(anime).then((url) => {
        if (url) setBackdrops((b) => ({ ...b, [anime.id]: url }))
      })
    }
    if (!(anime.id in logos)) {
      TmdbApi.fetchLogo(anime).then((url) => {
        if (url) setLogos((l) => ({ ...l, [anime.id]: url }))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anime?.id])

  if (!anime) return null

  const bgUrl = backdrops[anime.id] || anime.bannerImage || anime.coverImage?.extraLarge
  const logoUrl = logos[anime.id]

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[16/8] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={bgUrl}
          src={bgUrl}
          alt={TT(anime)}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/60 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
        <div className="flex gap-2 mb-3">
          {(anime.genres || []).slice(0, 2).map((g) => (
            <span key={g} className="text-[11px] font-semibold text-white/80 bg-black/40 px-2.5 py-1 rounded-full">
              {g}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {logoUrl ? (
            <motion.img
              key={`logo-${anime.id}`}
              src={logoUrl}
              alt={TT(anime)}
              className="max-w-[70vw] sm:max-w-[340px] h-[70px] sm:h-[90px] object-contain object-left mb-2"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.55))' }}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <motion.h1
              key={`title-${anime.id}`}
              className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2 max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {TT(anime)}
            </motion.h1>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/anime/${anime.id}`)}
          className="mt-2 bg-or text-white font-bold text-sm px-6 py-3 rounded-xl shadow-glow"
        >
          View Details
        </motion.button>

        <div className="flex gap-1.5 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all ${i === index % items.length ? 'w-6 bg-or' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
