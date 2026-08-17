import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AniListApi, TT, totEps } from '../api/anilist'
import { TmdbApi } from '../api/tmdb'
import { MetadataApi } from '../api/metadata'
import ExternalIds from '../components/ui/ExternalIds'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'
import { isMovie } from '../utils/models'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [anime, setAnime] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [backdropUrl, setBackdropUrl] = useState(null)
  const [episodeImages, setEpisodeImages] = useState({})
  const [metadata, setMetadata] = useState(null)
  const [descExpanded, setDescExpanded] = useState(false)

  const { user } = useAuthStore()
  const { watchlist, addToWatchlist, removeFromWatchlist, getProgress } = useWatchlistStore()
  const inWatchlist = watchlist.has(Number(id))
  const progress = getProgress(id)

  useEffect(() => {
    setAnime(null)
    setLogoUrl(null)
    setBackdropUrl(null)
    setEpisodeImages({})
    setMetadata(null)

    AniListApi.fetchDetail(Number(id)).then((data) => {
      setAnime(data)
      MetadataApi.fetch(data).then(setMetadata)
      TmdbApi.fetchLogo(data).then((url) => url && setLogoUrl(url))
      TmdbApi.fetchBackdrop(data).then((url) => url && setBackdropUrl(url))
      TmdbApi.fetchEpisodeImages(data).then((images) => images && setEpisodeImages(images))
    })
  }, [id])

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  const seasons = buildSeasons(anime)
  const total = Math.min(totEps(anime), 50)
  const bgUrl = backdropUrl || anime.bannerImage || anime.coverImage?.extraLarge
  const resumeEp = progress?.ep || 1
  const hasProgress = progress && (progress.ep > 1 || progress.time > 30)

  return (
    <div className="pb-10">
      <div className="relative w-full aspect-video">
        <img src={bgUrl} alt={TT(anime)} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-white fill-none" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <AnimatePresence>
          {logoUrl && (
            <motion.img
              src={logoUrl} alt={TT(anime)}
              className="absolute bottom-4 left-4 max-w-[220px] h-[60px] object-contain object-left"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 pt-2">
        {!logoUrl && <h1 className="text-[22px] font-black text-white leading-tight mb-1.5">{TT(anime)}</h1>}

        <div className="flex items-center gap-2 text-[12px]">
          {anime.averageScore && (
            <span className="flex items-center gap-1 text-t2 font-bold">
              <span className="text-or">★</span> {(anime.averageScore / 10).toFixed(1)}
            </span>
          )}
          <span className="text-t3">{anime.format || 'TV'}</span>
          {anime.seasonYear && <span className="text-t3">· {anime.season} {anime.seasonYear}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {(anime.genres || []).slice(0, 5).map((g) => (
            <span key={g} onClick={() => navigate(`/genre/${g}`)} className="text-[11px] font-medium text-t2 bg-white/[0.06] px-2.5 py-1 rounded-full cursor-pointer">
              {g}
            </span>
          ))}
        </div>

        <ExternalIds metadata={metadata} />

        <p className={`mt-3 text-[13px] leading-relaxed text-t2 ${descExpanded ? '' : 'line-clamp-4'}`}>
          {(anime.description || '').replace(/<[^>]+>/g, '')}
        </p>
        {!descExpanded && (
          <button onClick={() => setDescExpanded(true)} className="text-or text-[12px] font-bold mt-1">
            Show more
          </button>
        )}

        <div className="flex gap-2.5 mt-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/watch/${anime.id}/${resumeEp}`)}
            className="flex-1 h-12 bg-or rounded-xl flex items-center justify-center gap-2 font-black text-[13px] text-white"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M5 3l14 9-14 9V3z" /></svg>
            {hasProgress ? `CONTINUE E${resumeEp}` : 'START WATCHING E1'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => (user ? (inWatchlist ? removeFromWatchlist(anime.id) : addToWatchlist(anime)) : navigate('/auth'))}
            className={`w-12 h-12 rounded-xl border flex items-center justify-center ${inWatchlist ? 'border-or text-or' : 'border-white/15 text-t2'}`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {seasons.length > 0 && (
        <div className="mt-5">
          <h2 className="px-4 py-2 text-[15px] font-extrabold text-white">More Seasons</h2>
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none">
            {seasons.map((s) => (
              <div
                key={s.anime.id}
                onClick={() => !s.isCurrent && navigate(`/anime/${s.anime.id}`)}
                className={`flex-shrink-0 w-[120px] rounded-xl overflow-hidden cursor-pointer ${s.isCurrent ? 'bg-or/10 ring-1 ring-or/40' : 'bg-bg2'}`}
              >
                <div className="w-full aspect-video">
                  <img src={s.anime.coverImage?.large} alt={TT(s.anime)} className="w-full h-full object-cover" />
                </div>
                <div className="p-1.5">
                  <p className={`text-[9px] font-black ${s.isCurrent ? 'text-or' : 'text-t3'}`}>
                    {s.label.toUpperCase()} {s.anime.seasonYear || ''}
                  </p>
                  <p className="text-[10.5px] font-bold text-white line-clamp-2 leading-tight">{TT(s.anime)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="px-4 pt-5 pb-3 text-[15px] font-extrabold text-white">
        Episodes ({total >= 9999 ? 'Ongoing' : total})
      </h2>
      <div>
        {Array.from({ length: total }, (_, i) => i + 1).map((ep) => (
          <EpisodeRow key={ep} ep={ep} anime={anime} thumbOverride={episodeImages[ep]} onClick={() => navigate(`/watch/${anime.id}/${ep}`)} />
        ))}
      </div>
    </div>
  )
}

function EpisodeRow({ ep, anime, thumbOverride, onClick }) {
  const streamEp = anime.streamingEpisodes?.[ep - 1]
  const thumb = thumbOverride || streamEp?.thumbnail || anime.bannerImage || anime.coverImage?.large
  const dur = anime.duration ? `${anime.duration}m` : '23m'

  return (
    <motion.div whileTap={{ backgroundColor: 'rgba(255,255,255,.03)' }} onClick={onClick} className="flex items-center gap-2.5 px-4 py-2 cursor-pointer">
      <div className="relative w-[110px] aspect-video rounded-lg overflow-hidden flex-shrink-0">
        <img src={thumb} alt="" className="w-full h-full object-cover" />
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">{dur}</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-black/45 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white ml-0.5"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-t3 uppercase truncate">{TT(anime)}</p>
        <p className="text-[13px] font-semibold text-white truncate">
          E{ep}{streamEp?.title ? ` — ${streamEp.title}` : ''}
        </p>
        <p className="text-[10.5px] text-t3">Dub | Sub | Hindi</p>
      </div>
    </motion.div>
  )
}

/** Builds season strip from AniList relations — same logic as web/Android. */
function buildSeasons(media) {
  const edges = media.relations?.edges || []
  const related = []
  edges.forEach((e) => {
    if (!e.node?.id) return
    if (['PREQUEL', 'SEQUEL', 'PARENT', 'ALTERNATIVE_VERSION', 'SIDE_STORY'].includes(e.relationType)) {
      related.push({ anime: e.node, type: e.relationType, isCurrent: false })
    }
  })
  related.push({ anime: media, type: 'CURRENT', isCurrent: true })
  if (related.length <= 1) return []

  const order = { PREQUEL: 0, PARENT: 1, CURRENT: 2, SEQUEL: 3, ALTERNATIVE_VERSION: 4, SIDE_STORY: 5 }
  const sorted = [...related].sort((a, b) => (order[a.type] ?? 3) - (order[b.type] ?? 3) || (a.anime.seasonYear || 9999) - (b.anime.seasonYear || 9999))
  const mainSeasons = sorted.filter((i) => i.type !== 'ALTERNATIVE_VERSION' && i.type !== 'SIDE_STORY')

  return sorted.map((item) => {
    let label
    if (item.type === 'SIDE_STORY') label = 'Side Story'
    else if (item.type === 'ALTERNATIVE_VERSION') label = 'Alt. Version'
    else {
      const idx = mainSeasons.indexOf(item)
      label = `Season ${idx >= 0 ? idx + 1 : sorted.indexOf(item) + 1}`
    }
    return { anime: item.anime, label, isCurrent: item.isCurrent }
  })
}
