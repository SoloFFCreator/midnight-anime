import React, { useEffect, useRef, useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native'
import Video from 'react-native-video'
import Icon from 'react-native-vector-icons/Feather'
import Slider from '@react-native-community/slider'
import { StreamingApi, isDirectStreamUrl } from '../api/streaming'
import { totEps } from '../api/anilist'
import { useWatchlistStore } from '../store/watchlistStore'
import { useSettingsStore } from '../store/settingsStore'
import { colors } from '../theme/theme'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

export default function PlayerScreen({ route, navigation }) {
  const { animeId, episode, anime } = route.params
  const videoRef = useRef(null)

  const [sourceState, setSourceState] = useState({ loading: true, error: null, url: null, subtitles: [] })
  const [paused, setPaused] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffering, setBuffering] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [ep, setEp] = useState(episode)

  const { saveProgress, getProgress } = useWatchlistStore()
  const { audioLanguage, autoPlayNext } = useSettingsStore()
  const progressTimer = useRef(null)
  const total = totEps(anime)

  const loadSource = useCallback(async (episodeNum) => {
    setSourceState({ loading: true, error: null, url: null, subtitles: [] })
    const result = await StreamingApi.fetchStreamSources(animeId, episodeNum, audioLanguage === 'dub' ? 'dub' : 'sub')
    if (!result.ok) {
      setSourceState({ loading: false, error: result.reason, url: null, subtitles: [] })
      return
    }
    const direct = result.sources.find((s) => isDirectStreamUrl(s.url)) || result.sources[0]
    setSourceState({ loading: false, error: null, url: direct.url, subtitles: result.subtitles })

    const prior = getProgress(animeId)
    if (prior && prior.episodeId === episodeNum && prior.progressSeconds > 5) {
      setTimeout(() => videoRef.current?.seek(prior.progressSeconds), 300)
    }
  }, [animeId, audioLanguage])

  useEffect(() => { loadSource(ep) }, [ep, loadSource])

  useEffect(() => {
    progressTimer.current = setInterval(() => {
      if (position > 0 && duration > 0) saveProgress(animeId, ep, position, duration)
    }, 10000)
    return () => clearInterval(progressTimer.current)
  }, [animeId, ep, position, duration])

  function onEnd() {
    if (autoPlayNext && ep < total) changeEpisode(ep + 1)
    else navigation.goBack()
  }

  function changeEpisode(newEp) {
    if (newEp < 1 || newEp > total) return
    setPosition(0)
    setEp(newEp)
  }

  function skipIntro() { videoRef.current?.seek(position + 85) }

  if (sourceState.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>Loading episode…</Text>
      </View>
    )
  }

  if (sourceState.error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 32, marginBottom: 10 }}>⚠️</Text>
        <Text style={styles.errorTitle}>Couldn't load this episode</Text>
        <Text style={styles.errorSub}>{sourceState.error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadSource(ep)}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={() => setShowControls((s) => !s)}>
        <Video
          ref={videoRef}
          source={{ uri: sourceState.url }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          paused={paused}
          onLoad={(meta) => setDuration(meta.duration)}
          onProgress={(p) => setPosition(p.currentTime)}
          onBuffer={({ isBuffering }) => setBuffering(isBuffering)}
          onEnd={onEnd}
          textTracks={sourceState.subtitles.map((s, i) => ({ index: i, title: s.label, language: s.language, type: 'text/vtt', uri: s.url }))}
        />
      </TouchableOpacity>

      {buffering && <ActivityIndicator style={styles.bufferSpinner} color={colors.accent} size="large" />}

      {showControls && (
        <View style={styles.controlsOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Icon name="chevron-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.epLabel}>Episode {ep}</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.centerRow}>
            <TouchableOpacity onPress={() => changeEpisode(ep - 1)} disabled={ep <= 1} style={styles.skipBtn}>
              <Icon name="skip-back" size={26} color={ep > 1 ? '#fff' : 'rgba(255,255,255,0.3)'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPaused((p) => !p)} style={styles.playPauseBtn}>
              <Icon name={paused ? 'play' : 'pause'} size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeEpisode(ep + 1)} disabled={ep >= total} style={styles.skipBtn}>
              <Icon name="skip-forward" size={26} color={ep < total ? '#fff' : 'rgba(255,255,255,0.3)'} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={skipIntro} style={styles.skipIntroBtn}>
              <Text style={styles.skipIntroText}>Skip Intro</Text>
            </TouchableOpacity>
            <View style={styles.seekRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Slider
                style={{ flex: 1 }} minimumValue={0} maximumValue={duration || 1} value={position}
                minimumTrackTintColor={colors.accent} maximumTrackTintColor="rgba(255,255,255,0.25)" thumbTintColor={colors.accent}
                onSlidingComplete={(v) => videoRef.current?.seek(v)}
              />
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  loadingText: { color: colors.text2, fontSize: 13, marginTop: 12 },
  errorTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 6 },
  errorSub: { color: colors.text3, fontSize: 12, textAlign: 'center', marginBottom: 18 },
  retryBtn: { backgroundColor: colors.accent, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  backLink: { color: colors.text3, fontSize: 12, fontWeight: '600' },
  bufferSpinner: { position: 'absolute', top: '50%', left: '50%', marginLeft: -18, marginTop: -18 },
  controlsOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.25)' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  epLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
  centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  skipBtn: { padding: 8 },
  playPauseBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  bottomBar: { padding: 14, gap: 8 },
  skipIntroBtn: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginBottom: 4 },
  skipIntroText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  seekRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeText: { color: '#fff', fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
})
