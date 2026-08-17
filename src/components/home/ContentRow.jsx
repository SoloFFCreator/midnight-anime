import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimeCard from './AnimeCard'

export default function ContentRow({ title, items, genreLink }) {
  if (!items?.length) return null

  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-white text-[17px] font-extrabold">{title}</h2>
        {genreLink && (
          <Link to={genreLink} className="text-or text-[12px] font-bold hover:underline">
            See all
          </Link>
        )}
      </div>
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none snap-x">
        {items.map((anime) => (
          <div key={anime.id} className="snap-start">
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
