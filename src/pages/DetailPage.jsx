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
import ShareButton from '../components/ui/ShareButton'
import { buildSeriesSharePath } from '../utils/share'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [anime, setAnime] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [backdropUrl, setBackdropUrl] = useState(null)
  const [episodeImages, setEpisodeImages] = useState({})
  const [metadata, setMetadata] = useState(null)
  const [franchiseMedia, setFranchiseMedia] = useState([])
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
    setFranchiseMedia([])

    AniListApi.fetchDetail(Number(id)).then(async (data) => {
      setAnime(data)
      MetadataApi.fetch(data).then(setMetadata)
      TmdbApi.fetchLogo(data).then((url) => url && setLogoUrl(url))
      TmdbApi.fetchBackdrop(data).then((url) => url && setBackdropUrl(url))
      TmdbApi.fetchEpisodeImages(data).then((images) => images && setEpisodeImages(images))
      const chain = await loadSeasonChain(data)
      setFranchiseMedia(chain)
    })
  }, [id])

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  const seasons = buildSeasons(anime, franchiseMedia)
  const total = Math.min(totEps(anime), 50)
  const bgUrl = backdropUrl || anime.bannerImage || anime.coverImage?.extraLarge
  const resumeEp = progress?.ep || 1
  const hasProgress = progress && (progress.ep > 1 || progress.time > 30)
  const shareTitle = `${TT(anime)} | Midnight Anime`
  const shareText = stripHtml(anime.description) || `Watch ${TT(anime)} on Midnight Anime.`

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
          <ShareButton
            compact
            title={shareTitle}
            text={shareText}
            path={buildSeriesSharePath(anime.id)}
          />
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
function stripHtml(value) {
  return (value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

async function loadSeasonChain(start) {
  const queue = [start]
  const loaded = new Map([[Number(start.id), start]])
  const visited = new Set()
  const allowed = new Set(['PREQUEL', 'SEQUEL', 'PARENT'])
  while (queue.length && visited.size < 12) {
    const current = queue.shift()
    const currentId = Number(current.id)
    if (visited.has(currentId)) continue
    visited.add(currentId)
    for (const edge of current.relations?.edges || []) {
      if (!allowed.has(edge.relationType) || edge.node?.type !== 'ANIME' || !edge.node?.id) continue
      const nodeId = Number(edge.node.id)
      if (loaded.has(nodeId)) continue
      try {
        const detail = await AniListApi.fetchDetail(nodeId)
        if (detail) {
          loaded.set(nodeId, detail)
          queue.push(detail)
        }
      } catch {
        // Keep the chain usable when one related AniList record is unavailable.
      }
    }
  }
  return [...loaded.values()]
}

function buildSeasons(media, franchiseMedia = []) {
  const source = franchiseMedia.length ? franchiseMedia : [media]
  const related = []
  const seen = new Set([Number(media.id)])
  source.forEach((entry) => {
    if (Number(entry.id) === Number(media.id)) return
    const id = Number(entry.id)
    if (!id || seen.has(id)) return
    seen.add(id)
    related.push({ anime: entry, type: 'SEQUEL', isCurrent: false })
  })
  ;[...source, media].forEach((entry) => {
    for (const edge of entry.relations?.edges || []) {
      if (!edge.node?.id) continue
      if (['ALTERNATIVE_VERSION', 'SIDE_STORY'].includes(edge.relationType)) {
        const id = Number(edge.node.id)
        if (seen.has(id)) continue
        seen.add(id)
        related.push({ anime: edge.node, type: edge.relationType, isCurrent: false })
      }
    }
  })
  related.push({ anime: media, type: 'CURRENT', isCurrent: true })
  if (related.length <= 1) return []

  const seasonOrder = { WINTER: 0, SPRING: 1, SUMMER: 2, FALL: 3 }
  const mainSeasons = related.filter((item) => item.type !== 'ALTERNATIVE_VERSION' && item.type !== 'SIDE_STORY')
  const extras = related.filter((item) => item.type === 'ALTERNATIVE_VERSION' || item.type === 'SIDE_STORY')
  const chronological = (a, b) => {
    const yearA = Number(a.anime.seasonYear) || 9999
    const yearB = Number(b.anime.seasonYear) || 9999
    if (yearA !== yearB) return yearA - yearB
    const seasonA = seasonOrder[a.anime.season] ?? 9
    const seasonB = seasonOrder[b.anime.season] ?? 9
    if (seasonA !== seasonB) return seasonA - seasonB
    return Number(a.anime.id) - Number(b.anime.id)
  }
  const sortedMain = [...mainSeasons].sort(chronological)
  const sortedExtras = [...extras].sort(chronological)
  const sorted = [...sortedMain, ...sortedExtras]

  return sorted.map((item) => {
    let label
    if (item.type === 'SIDE_STORY') label = 'Side Story'
    else if (item.type === 'ALTERNATIVE_VERSION') label = 'Alt. Version'
    else {
      const idx = sortedMain.indexOf(item)
      label = `Season ${idx >= 0 ? idx + 1 : sorted.indexOf(item) + 1}`
    }
    return { anime: item.anime, label, isCurrent: item.isCurrent }
  })
}
