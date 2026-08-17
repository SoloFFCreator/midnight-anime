import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TT, totEps } from '../../api/anilist'

export default function AnimeCard({ anime, width = 130 }) {
  const navigate = useNavigate()
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null
  const seasonCount = anime._seasonCount || 0
  const epCount = anime.format === 'MOVIE' ? null : totEps(anime)

  return (
    <motion.div
      className="flex-shrink-0 cursor-pointer"
      style={{ width }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={() => navigate(`/anime/${anime.id}`)}
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-bg2 shadow-lg">
        <img
          src={anime.coverImage?.extraLarge || anime.coverImage?.large}
          alt={TT(anime)}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {score && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded-md">
            <span className="text-or text-[10px]">★</span>
            <span className="text-white text-[10px] font-bold">{score}</span>
          </div>
        )}

        {anime.format === 'MOVIE' && (
          <div className="absolute top-1.5 left-1.5 bg-or/20 border border-or/40 px-1.5 py-0.5 rounded-md">
            <span className="text-or text-[9px] font-black">MOVIE</span>
          </div>
        )}

        {epCount != null && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded-md">
            <span className="text-white text-[9px] font-bold">{epCount} ep</span>
          </div>
        )}

        {seasonCount > 1 && (
          <div className="absolute bottom-1.5 left-1.5 bg-or/90 px-1.5 py-0.5 rounded-md">
            <span className="text-white text-[9px] font-black">{seasonCount} seasons</span>
          </div>
        )}
      </div>

      <p className="mt-1.5 text-[12px] font-semibold text-white leading-tight line-clamp-2">
        {TT(anime)}
      </p>
    </motion.div>
  )
}
