import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AniListApi, TT, totEps } from '../api/anilist'
import { HindiApi } from '../api/hindi'
import { useWatchlistStore } from '../store/watchlistStore'
import { usePlayerStore } from '../store/playerStore'
import { useAuthStore } from '../store/authStore'
import { buildStreamUrl, isMovie } from '../utils/models'

export default function WatchPage() {
  const { id, episode } = useParams()
  const navigate = useNavigate()
  const ep = Number(episode)
  const animeId = Number(id)

  const [anime, setAnime] = useState(null)
  const iframeRef = useRef(null)

  const { user } = useAuthStore()
  const { saveProgress, getProgress, subscribeToRatings, episodeRatings, rateEpisode, userRatings, loadUserRating } = useWatchlistStore()
  const {
    audioTrack, server, autoPlayNext, hindiLoading, hindiUnavailable, hindiStreamUrl,
    seriesFinishShown, showRecommendations,
    setAudioTrack, setServer, setAutoPlayNext, setHindiState, resetForNewEpisode,
    startProgressTracking, stopProgressTracking, triggerRecommendations, dismissRecommendations,
  } = usePlayerStore()

  useEffect(() => {
    AniListApi.fetchDetail(animeId).then(setAnime)
  }, [animeId])

  useEffect(() => {
    resetForNewEpisode()
    if (!anime) return
    const ratingsUnsub = subscribeToRatings(animeId, ep)
    if (user) loadUserRating(animeId, ep)

    const total = totEps(anime)
    startProgressTracking((elapsed) => {
      const durSec = (anime.duration || 24) * 60
      saveProgress(animeId, ep, Math.min(elapsed, durSec), anime)
      const isLastEp = ep >= total
      const watchedEnough = elapsed >= durSec * 0.8
      if (isLastEp && watchedEnough && !usePlayerStore.getState().seriesFinishShown && !isMovie(anime)) {
        triggerRecommendations()
      }
    })

    if (audioTrack === 'HIN') loadHindi()

    return () => stopProgressTracking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, ep, anime?.id])

  useEffect(() => {
    if (showRecommendations) navigate(`/recommend/${animeId}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRecommendations])

  async function loadHindi() {
    setHindiState({ hindiLoading: true, hindiUnavailable: false, hindiStreamUrl: null })
    const result = await HindiApi.fetchStreamUrl(animeId, ep)
    if (result.ok) setHindiState({ hindiLoading: false, hindiStreamUrl: result.streamUrl })
    else setHindiState({ hindiLoading: false, hindiUnavailable: true })
  }

  function changeAudio(track) {
    setAudioTrack(track)
    if (track === 'HIN') loadHindi()
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  const total = totEps(anime)
  const isLastEp = ep >= total && !isMovie(anime)
  const streamUrl = buildStreamUrl(anime, ep, audioTrack, server)
  const rKey = `${animeId}_ep${ep}`
  const ratings = episodeRatings[rKey] || { likes: 0, dislikes: 0 }
  const userRating = userRatings[rKey]

  return (
    <div className="pb-10">
      {/* Player area */}
      <div className="relative w-full aspect-video bg-black">
        {audioTrack === 'HIN' ? (
          <HindiPlayerArea
            loading={hindiLoading}
            unavailable={hindiUnavailable}
            streamUrl={hindiStreamUrl}
            onRetry={loadHindi}
            onFallbackSub={() => changeAudio('SUB')}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={streamUrl}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
          />
        )}
      </div>

      <div className="px-4 pt-3">
        <h1 className="text-[17px] font-extrabold text-white truncate">{TT(anime)}</h1>
        <p onClick={() => navigate(`/anime/${anime.id}`)} className="text-[12px] text-t3 cursor-pointer">
          {isMovie(anime) ? 'Movie' : `Episode ${ep}`}
        </p>
      </div>

      {!isMovie(anime) && (
        <div className="flex items-center justify-between px-4 py-2">
          <button
            disabled={ep <= 1}
            onClick={() => navigate(`/watch/${animeId}/${ep - 1}`)}
            className={`flex items-center gap-1 text-[13px] font-bold ${ep > 1 ? 'text-t2' : 'text-t4'}`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Previous
          </button>
          <span className="text-[13px] font-black text-white">Episode {ep}</span>
          <button
            disabled={ep >= total}
            onClick={() => navigate(`/watch/${animeId}/${ep + 1}`)}
            className={`flex items-center gap-1 text-[13px] font-bold ${ep < total ? 'text-t2' : 'text-t4'}`}
          >
            Next
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      )}

      {isLastEp && (
        <div className="flex justify-end px-4 pb-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={triggerRecommendations}
            className="flex items-center gap-1.5 bg-or text-white text-[11.5px] font-black px-3.5 py-2 rounded-full shadow-[0_0_0_0_rgba(244,117,33,.5)]"
            animate={{ boxShadow: ['0 0 0 0 rgba(244,117,33,.5)', '0 0 0 6px rgba(244,117,33,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✓ Finished?
          </motion.button>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex bg-bg2 rounded-full p-0.5">
          {['SUB', 'DUB', 'HIN'].map((t) => (
            <button
              key={t}
              onClick={() => changeAudio(t)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-black ${audioTrack === t ? 'bg-or text-white' : 'text-t3'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-t3">
          Auto-play
          <input type="checkbox" checked={autoPlayNext} onChange={(e) => setAutoPlayNext(e.target.checked)} className="accent-or w-4 h-4" />
        </label>
      </div>

      <div className="px-4 py-2">
        <p className="text-[11px] font-bold text-t3 mb-1.5">Video Server</p>
        <div className="flex gap-2">
          {[{ id: 'VIDNEST', label: 'VidNest / AnimePahe' }, { id: 'MEGAPLAY', label: 'megaplay.buzz' }].map((s) => (
            <button
              key={s.id}
              onClick={() => setServer(s.id)}
              className={`px-3 py-2 rounded-lg text-[12px] font-bold ${server === s.id ? 'bg-or/15 text-or' : 'bg-bg2 text-t2'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="text-[12px] text-t3">Rate this episode:</span>
        <RatingBtn active={userRating === 1} count={ratings.likes} color="text-or" onClick={() => rateEpisode(animeId, ep, 1)} icon="up" />
        <RatingBtn active={userRating === -1} count={ratings.dislikes} color="text-red" onClick={() => rateEpisode(animeId, ep, -1)} icon="down" />
      </div>
    </div>
  )
}

function HindiPlayerArea({ loading, unavailable, streamUrl, onRetry, onFallbackSub }) {
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <motion.div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
        <p className="text-t2 text-[12px]">Loading Hindi audio…</p>
      </div>
    )
  }
  if (unavailable) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-3xl">🇮🇳</p>
        <p className="text-white font-bold text-[14px]">Hindi dub not available yet</p>
        <p className="text-t3 text-[12px]">Our Hindi library is growing daily — this episode isn't added yet.</p>
        <div className="flex gap-2.5 mt-1">
          <button onClick={onFallbackSub} className="bg-or text-white text-[12px] font-bold px-4 py-2 rounded-lg">Watch in SUB</button>
          <button onClick={onRetry} className="border border-white/20 text-white text-[12px] font-bold px-4 py-2 rounded-lg">Retry</button>
        </div>
      </div>
    )
  }
  if (streamUrl) return <iframe src={streamUrl} className="w-full h-full" allowFullScreen frameBorder="0" />
  return null
}

function RatingBtn({ active, count, color, onClick, icon }) {
  const fmt = count > 999 ? `${(count / 1000).toFixed(1)}K` : count
  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={onClick} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold ${active ? `${color} bg-white/5` : 'text-t2 bg-bg2'}`}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        {icon === 'up'
          ? <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          : <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />}
      </svg>
      {fmt}
    </motion.button>
  )
}
