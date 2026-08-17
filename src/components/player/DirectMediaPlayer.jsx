import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

const BRAND_LOGO = 'https://dipamalla.com.np/logo.svg'

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return '00:00'
  const total = Math.floor(value)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    play: <path d="M8 5v14l11-7-11-7Z" />,
    pause: <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5" /><path d="M18.5 7a8 8 0 0 1 0 10" /></>,
    mute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m18 9-5 6" /><path d="m13 9 5 6" /></>,
    fullscreen: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" /></>,
    retry: <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" />,
  }
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export default function DirectMediaPlayer({ source, onRetry, onEnded }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !source?.url) return undefined

    let hls
    setError('')
    setBuffering(true)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setBuffered(0)

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0)
      setBuffering(false)
    }
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0)
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1))
    }
    const onProgress = () => {
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1))
    }
    const onPlaying = () => { setPlaying(true); setBuffering(false) }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setBuffering(true)
    const onEndedInternal = () => { setPlaying(false); onEnded?.() }
    const onVideoError = () => setError('This source could not be played. Try another Hindi source or retry.')

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('progress', onProgress)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('ended', onEndedInternal)
    video.addEventListener('error', onVideoError)

    const useNativeHls = source.type === 'hls' && video.canPlayType('application/vnd.apple.mpegurl')
    if (source.type === 'hls' && Hls.isSupported() && !useNativeHls) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false })
      hlsRef.current = hls
      hls.loadSource(source.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) setError('The HLS source reported a playback error. Try retrying or choose another source.')
      })
    } else {
      video.src = source.url
      video.load()
    }

    return () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('ended', onEndedInternal)
      video.removeEventListener('error', onVideoError)
      hls?.destroy()
      hlsRef.current = null
    }
  }, [source, onEnded])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.playbackRate = playbackRate
    }
  }, [volume, playbackRate])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return
      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }
      if (event.key.toLowerCase() === 'm') setVolume((value) => (value > 0 ? 0 : 1))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => setError('Playback was blocked by the browser. Press play again to start.'))
    else video.pause()
  }

  function seekTo(value) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Number(value)
    setCurrentTime(Number(value))
  }

  function toggleFullscreen() {
    const container = videoRef.current?.parentElement
    if (!container) return
    if (document.fullscreenElement) document.exitFullscreen?.()
    else container.requestFullscreen?.()
  }

  return (
    <div className="group relative w-full h-full overflow-hidden bg-black text-white select-none">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" playsInline crossOrigin="anonymous" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 opacity-90" />

      <div className="absolute left-4 right-4 top-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src={BRAND_LOGO} alt="Midnight Anime" className="h-7 w-auto max-w-[116px] object-contain object-left" />
          <span className="truncate rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white/80">{source?.title || 'Hindi stream'}</span>
        </div>
        <span className="shrink-0 rounded-full border border-or/40 bg-or/15 px-2.5 py-1 text-[10px] font-black text-or">{source?.quality || 'AUTO'}</span>
      </div>

      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-or border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center">
          <p className="text-sm font-bold text-white">Playback unavailable</p>
          <p className="max-w-sm text-xs leading-relaxed text-white/60">{error}</p>
          <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-full bg-or px-4 py-2 text-xs font-black text-white">
            <Icon name="retry" className="h-4 w-4" /> Retry source
          </button>
        </div>
      )}

      {!playing && !buffering && !error && (
        <button onClick={togglePlay} aria-label="Play Hindi stream" className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-or/95 shadow-[0_0_40px_rgba(244,117,33,.35)] transition hover:scale-105">
          <Icon name="play" className="ml-1 h-6 w-6 fill-white" />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-10 opacity-100 transition sm:opacity-75 sm:group-hover:opacity-100">
        <input
          aria-label="Seek video"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seekTo(event.target.value)}
          className="mb-2 h-1.5 w-full cursor-pointer accent-or"
        />
        <div className="flex items-center gap-2.5">
          <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="text-white transition hover:text-or"><Icon name={playing ? 'pause' : 'play'} className="h-5 w-5 fill-current" /></button>
          <button onClick={() => setVolume((value) => (value > 0 ? 0 : 1))} aria-label={volume > 0 ? 'Mute' : 'Unmute'} className="text-white transition hover:text-or"><Icon name={volume > 0 ? 'volume' : 'mute'} className="h-5 w-5" /></button>
          <input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="hidden w-16 accent-or sm:block" />
          <span className="text-[10px] font-semibold tabular-nums text-white/70">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <span className="ml-auto text-[10px] font-bold text-white/60">Buffered {formatTime(buffered)}</span>
          <select aria-label="Playback speed" value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} className="rounded bg-black/50 px-1.5 py-1 text-[10px] font-bold text-white outline-none">
            {[0.75, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}x</option>)}
          </select>
          <button onClick={toggleFullscreen} aria-label="Fullscreen" className="text-white transition hover:text-or"><Icon name="fullscreen" className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  )
}
