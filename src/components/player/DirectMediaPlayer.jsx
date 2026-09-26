import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

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

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    play: <path d="M8 5v14l11-7-11-7Z" />,
    pause: <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a8 8 0 0 1 0 10" /></>,
    mute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m18 9-5 6m0-6 5 6" /></>,
    fullscreen: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" /></>,
    minimize: <><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M21 16h-5v5" /></>,
    back: <path d="m15 18-6-6 6-6" />,
    forward: <path d="m9 18 6-6-6-6" />,
    retry: <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" />,
  }
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function ControlButton({ label, onClick, children, className = '' }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95 ${className}`}>{children}</button>
}

export default function DirectMediaPlayer({ source, subtitleTracks = [], onRetry, onEnded }) {
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
  const [subtitleTrack, setSubtitleTrack] = useState('off')
  const [controlsVisible, setControlsVisible] = useState(true)
  const controlsTimerRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !source?.url) return undefined

    let hls
    revealControls()
    setError('')
    setBuffering(true)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setBuffered(0)
    setSubtitleTrack('off')

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
    const onVideoError = () => setError('This source could not be played. Try another source or retry.')

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
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        xhrSetup: (xhr) => {
          Object.entries(source.headers || {}).forEach(([key, value]) => {
            if (!/^(user-agent|origin|referer|accept|host|content-length)$/i.test(key)) xhr.setRequestHeader(key, value)
          })
        },
      })
      hlsRef.current = hls
      hls.loadSource(source.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) setError('The stream could not be loaded. Please retry.')
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

  useEffect(() => () => window.clearTimeout(controlsTimerRef.current), [])

  useEffect(() => {
    if (subtitleTrack === 'off') {
      const defaultTrack = subtitleTracks.find((track) => track.default)
      if (defaultTrack?.id) setSubtitleTrack(defaultTrack.id)
    }
    const textTracks = videoRef.current?.textTracks
    if (!textTracks) return
    for (let index = 0; index < textTracks.length; index += 1) {
      textTracks[index].mode = textTracks[index].id === subtitleTrack ? 'showing' : 'disabled'
    }
  }, [subtitleTrack, subtitleTracks])

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
      if (event.code === 'Space') { event.preventDefault(); togglePlay() }
      if (event.key.toLowerCase() === 'm') setVolume((value) => (value > 0 ? 0 : 1))
      if (event.key === 'ArrowLeft') seekBy(-10)
      if (event.key === 'ArrowRight') seekBy(10)
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

  function revealControls() {
    setControlsVisible(true)
    window.clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 5000)
  }

  function seekTo(value) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Number(value)
    setCurrentTime(Number(value))
  }

  function seekBy(seconds) {
    const video = videoRef.current
    if (!video) return
    const next = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds))
    video.currentTime = next
    setCurrentTime(next)
  }

  function toggleFullscreen() {
    const container = videoRef.current?.parentElement
    if (!container) return
    if (document.fullscreenElement) document.exitFullscreen?.()
    else container.requestFullscreen?.()
  }

  const progressPercent = duration ? Math.min(100, (currentTime / duration) * 100) : 0
  const bufferedPercent = duration ? Math.min(100, (buffered / duration) * 100) : 0

  return (
    <div className="group relative h-full w-full overflow-hidden bg-black text-white select-none" onMouseMove={revealControls} onTouchStart={revealControls}>
      <video ref={videoRef} className="absolute inset-0 h-full w-full cursor-pointer object-contain" playsInline crossOrigin="anonymous" onClick={togglePlay}>
        {subtitleTracks.map((track) => <track key={track.id} id={track.id} kind="subtitles" label={track.label} srcLang={track.language} src={track.src} />)}
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/95" />

      {buffering && !error && <div className="absolute inset-0 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-or" /></div>}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center">
          <p className="text-sm font-bold text-white">Playback unavailable</p>
          <p className="max-w-sm text-xs leading-relaxed text-white/60">{error}</p>
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg bg-or px-4 py-2 text-xs font-black text-white transition hover:bg-or/90"><Icon name="retry" className="h-4 w-4" /> Retry</button>
        </div>
      )}

      {!playing && !buffering && !error && <button type="button" onClick={togglePlay} aria-label="Play video" className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-or/95 text-white shadow-[0_8px_35px_rgba(244,117,33,.35)] transition hover:scale-105"><Icon name="play" className="ml-1 h-7 w-7 fill-current" /></button>}

      {!error && <div className={`absolute bottom-0 left-0 right-0 px-3 pb-2 pt-14 transition-opacity duration-300 sm:px-5 sm:pb-4 ${controlsVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="relative mb-2 h-1.5 w-full rounded-full bg-white/20">
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${bufferedPercent}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-or" style={{ width: `${progressPercent}%` }} />
          <input aria-label="Seek video" type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => seekTo(event.target.value)} className="absolute -top-2 h-5 w-full cursor-pointer opacity-0" />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton label={playing ? 'Pause' : 'Play'} onClick={togglePlay}><Icon name={playing ? 'pause' : 'play'} className="h-4 w-4 fill-current" /></ControlButton>
          <ControlButton label="Back 10 seconds" onClick={() => seekBy(-10)}><Icon name="back" className="h-4 w-4" /><span className="sr-only">10</span></ControlButton>
          <ControlButton label="Forward 10 seconds" onClick={() => seekBy(10)}><Icon name="forward" className="h-4 w-4" /><span className="sr-only">10</span></ControlButton>
          <ControlButton label={volume > 0 ? 'Mute' : 'Unmute'} onClick={() => setVolume((value) => (value > 0 ? 0 : 1))}><Icon name={volume > 0 ? 'volume' : 'mute'} className="h-4 w-4" /></ControlButton>
          <input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="hidden h-1 w-16 cursor-pointer accent-or sm:block" />
          <span className="ml-1 text-[10px] font-semibold tabular-nums text-white/70 sm:text-[11px]">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="ml-auto flex items-center gap-1.5">
            {subtitleTracks.length > 0 && <select aria-label="Subtitles" value={subtitleTrack} onChange={(event) => setSubtitleTrack(event.target.value)} className="max-w-[120px] rounded-md border border-white/10 bg-black/45 px-1.5 py-1 text-[10px] font-bold text-white outline-none hover:border-white/25"><option value="off">Subtitles off</option>{subtitleTracks.map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}</select>}
            <select aria-label="Playback speed" value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} className="rounded-md border border-white/10 bg-black/45 px-1.5 py-1 text-[10px] font-bold text-white outline-none hover:border-white/25">{[0.75, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}x</option>)}</select>
            <ControlButton label="Fullscreen" onClick={toggleFullscreen}><Icon name="fullscreen" className="h-4 w-4" /></ControlButton>
          </div>
        </div>
      </div>}
    </div>
  )
}
