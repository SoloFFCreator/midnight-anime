import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AniListApi, TT, totEps } from '../api/anilist'
import { NuvioApi } from '../api/hindi'
import { MetadataApi } from '../api/metadata'
import DirectMediaPlayer from '../components/player/DirectMediaPlayer'
import { useWatchlistStore } from '../store/watchlistStore'
import { usePlayerStore } from '../store/playerStore'
import { useAuthStore } from '../store/authStore'
import { isMovie } from '../utils/models'
import ShareButton from '../components/ui/ShareButton'
import { buildEpisodeSharePath } from '../utils/share'

export default function WatchPage() {
  const { id, episode } = useParams()
  const navigate = useNavigate()
  const ep = Number(episode)
  const animeId = Number(id)

  const [anime, setAnime] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [hindiStreams, setHindiStreams] = useState([])
  const [hindiSourceIndex, setHindiSourceIndex] = useState(0)
  const [streamLoading, setStreamLoading] = useState(false)
  const [streamError, setStreamError] = useState('')

  const { user } = useAuthStore()
  const { saveProgress, subscribeToRatings, episodeRatings, rateEpisode, userRatings, loadUserRating } = useWatchlistStore()
  const {
    audioTrack, autoPlayNext,
    seriesFinishShown, showRecommendations,
    setAudioTrack, setAutoPlayNext, setHindiState, resetForNewEpisode,
    startProgressTracking, stopProgressTracking, triggerRecommendations,
  } = usePlayerStore()

  useEffect(() => {
    let active = true
    setAnime(null)
    setMetadata(null)
    setHindiStreams([])
    setHindiSourceIndex(0)
    AniListApi.fetchDetail(animeId).then(async (data) => {
      if (!active) return
      setAnime(data)
      const resolved = await MetadataApi.fetch(data)
      if (active) setMetadata(resolved)
    })
    return () => { active = false }
  }, [animeId])

  useEffect(() => {
    resetForNewEpisode()
    setHindiStreams([])
    setHindiSourceIndex(0)
    if (!anime) return undefined

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

    return () => {
      ratingsUnsub?.()
      stopProgressTracking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, ep, anime?.id])

  useEffect(() => {
    if (anime && metadata) loadStream()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioTrack, metadata?.tmdbId, metadata?.imdbId, metadata?.mediaType, metadata?.seasonNumber, ep])

  useEffect(() => {
    if (showRecommendations) navigate(`/recommend/${animeId}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRecommendations])

  async function loadStream() {
    const audio = audioTrack === 'DUB' ? 'dub' : audioTrack === 'SUB' ? 'sub' : 'hindi'
    setStreamLoading(true)
    setStreamError('')
    setHindiStreams([])
    setHindiSourceIndex(0)

    const result = await NuvioApi.fetchStreams({
      malId: anime?.idMal,
      tmdbId: metadata?.tmdbId,
      imdbId: metadata?.imdbId,
      mediaType: metadata?.mediaType || (isMovie(anime) ? 'movie' : 'tv'),
      season: metadata?.seasonNumber || 1,
      episode: isMovie(anime) ? 1 : ep,
      audio,
    })

    if (result.ok) {
      setHindiStreams(result.streams)
      setStreamLoading(false)
      setHindiState({ hindiLoading: false, hindiUnavailable: false })
    } else {
      setStreamLoading(false)
      setStreamError(result.reason)
      setHindiState({ hindiLoading: false, hindiUnavailable: true })
    }
  }

  function changeAudio(track) {
    setAudioTrack(track)
  }

  const total = anime ? totEps(anime) : 1
  const isLastEp = !!anime && ep >= total && !isMovie(anime)
  const handleHindiEnded = useCallback(() => {
    if (!anime || isMovie(anime)) return
    if (autoPlayNext && ep < total) navigate(`/watch/${animeId}/${ep + 1}`)
    else if (ep >= total) triggerRecommendations()
  }, [anime, autoPlayNext, ep, total, animeId, navigate, triggerRecommendations])

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  const streamSource = hindiStreams[hindiSourceIndex]
  const rKey = `${animeId}_ep${ep}`
  const ratings = episodeRatings[rKey] || { likes: 0, dislikes: 0 }
  const userRating = userRatings[rKey]
  const episodeTitle = anime.streamingEpisodes?.[ep - 1]?.title || `Episode ${ep}`
  const shareTitle = `${TT(anime)} — ${episodeTitle} | Midnight Anime`
  const shareText = `Watch ${TT(anime)} — ${episodeTitle} on Midnight Anime.`

  return (
    <div className="pb-10">
      <div className="relative w-full aspect-video bg-black">
        {streamLoading ? (
          <PlayerLoading audioTrack={audioTrack} />
        ) : streamSource ? (
          <DirectMediaPlayer source={streamSource} subtitleTracks={streamSource?.subtitles || []} onRetry={loadStream} onEnded={handleHindiEnded} />
        ) : (
          <PlayerUnavailable audioTrack={audioTrack} error={streamError} onRetry={loadStream} onFallbackSub={() => changeAudio('SUB')} />
        )}
      </div>

      <div className="px-4 pt-3">
        <h1 className="text-[17px] font-extrabold text-white truncate">{TT(anime)}</h1>
        <p onClick={() => navigate(`/anime/${anime.id}`)} className="text-[12px] text-t3 cursor-pointer">
          {isMovie(anime) ? 'Movie' : `Episode ${ep}`}
        </p>
        <div className="mt-2 flex justify-end">
          <ShareButton
            compact
            title={shareTitle}
            text={shareText}
            path={buildEpisodeSharePath(animeId, ep)}
          />
        </div>
      </div>

      {hindiStreams.length > 1 && (
        <div className="px-4 pt-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-t3">Available qualities</p>
          <div className="flex flex-wrap gap-2">
            {hindiStreams.map((source, index) => (
              <button
                key={source.id}
                onClick={() => setHindiSourceIndex(index)}
                className={`rounded-lg border px-3 py-2 text-left ${index === hindiSourceIndex ? 'border-or bg-or/15 text-white' : 'border-white/10 bg-bg2 text-t2'}`}
              >
                <span className="block text-[11px] font-black">{source.quality}</span>
                <span className="block max-w-[170px] truncate text-[10px]">{source.quality || 'Auto'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isMovie(anime) && (
        <div className="flex items-center justify-between px-4 py-2">
          <button disabled={ep <= 1} onClick={() => navigate(`/watch/${animeId}/${ep - 1}`)} className={`flex items-center gap-1 text-[13px] font-bold ${ep > 1 ? 'text-t2' : 'text-t4'}`}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Previous
          </button>
          <span className="text-[13px] font-black text-white">Episode {ep}</span>
          <button disabled={ep >= total} onClick={() => navigate(`/watch/${animeId}/${ep + 1}`)} className={`flex items-center gap-1 text-[13px] font-bold ${ep < total ? 'text-t2' : 'text-t4'}`}>
            Next
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      )}

      {isLastEp && (
        <div className="flex justify-end px-4 pb-1">
          <motion.button whileTap={{ scale: 0.95 }} onClick={triggerRecommendations} className="flex items-center gap-1.5 bg-or text-white text-[11.5px] font-black px-3.5 py-2 rounded-full shadow-[0_0_0_0_rgba(244,117,33,.5)]" animate={{ boxShadow: ['0 0 0 0 rgba(244,117,33,.5)', '0 0 0 6px rgba(244,117,33,0)'] }} transition={{ duration: 2, repeat: Infinity }}>
            ✓ Finished?
          </motion.button>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex bg-bg2 rounded-full p-0.5">
          {['SUB', 'DUB', 'HIN'].map((track) => (
            <button key={track} onClick={() => changeAudio(track)} className={`px-4 py-1.5 rounded-full text-[12px] font-black ${audioTrack === track ? 'bg-or text-white' : 'text-t3'}`}>
              {track}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-t3">
          Auto-play
          <input type="checkbox" checked={autoPlayNext} onChange={(event) => setAutoPlayNext(event.target.checked)} className="accent-or w-4 h-4" />
        </label>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="text-[12px] text-t3">Rate this episode:</span>
        <RatingBtn active={userRating === 1} count={ratings.likes} color="text-or" onClick={() => rateEpisode(animeId, ep, 1)} icon="up" />
        <RatingBtn active={userRating === -1} count={ratings.dislikes} color="text-red" onClick={() => rateEpisode(animeId, ep, -1)} icon="down" />
      </div>
    </div>
  )
}

function PlayerLoading({ audioTrack }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black">
      <motion.div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      <p className="text-t2 text-[12px]">Resolving {audioTrack} source…</p>
    </div>
  )
}

function PlayerUnavailable({ audioTrack, error, onRetry, onFallbackSub }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6 text-center bg-black">
      <p className="text-3xl font-black text-or">{audioTrack}</p>
      <p className="text-white font-bold text-[14px]">{audioTrack} stream unavailable</p>
      <p className="max-w-sm text-t3 text-[12px]">{error || `No direct ${audioTrack} stream was returned for this episode.`}</p>
      <div className="flex gap-2.5 mt-1">
        {audioTrack !== 'SUB' && <button onClick={onFallbackSub} className="bg-or text-white text-[12px] font-bold px-4 py-2 rounded-lg">Watch in SUB</button>}
        <button onClick={onRetry} className="border border-white/20 text-white text-[12px] font-bold px-4 py-2 rounded-lg">Retry</button>
      </div>
    </div>
  )
}

function RatingBtn({ active, count, color, onClick, icon }) {
  const fmt = count > 999 ? `${(count / 1000).toFixed(1)}K` : count
  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={onClick} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold ${active ? `${color} bg-white/5` : 'text-t2 bg-bg2'}`}>
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        {icon === 'up' ? <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /> : <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />}
      </svg>
      {fmt}
    </motion.button>
  )
}
