import { create } from 'zustand'

/**
 * Player UI state — audio track, server choice, episode progress tracking
 * for the "series finished" auto-detector. Not persisted directly here;
 * watchlistStore.saveProgress() handles Firebase writes.
 */
export const usePlayerStore = create((setState, getState) => ({
  audioTrack: 'SUB',    // 'SUB' | 'DUB' | 'HIN'
  server: 'VIDNEST',    // 'VIDNEST' | 'MEGAPLAY'
  autoPlayNext: true,
  hindiLoading: false,
  hindiUnavailable: false,
  hindiStreamUrl: null,
  seriesFinishShown: false,
  showRecommendations: false,
  elapsedSeconds: 0,
  _progressTimer: null,

  setAudioTrack(track) {
    setState({ audioTrack: track })
  },
  setServer(server) { setState({ server }) },
  setAutoPlayNext(v) { setState({ autoPlayNext: v }) },

  setHindiState(partial) { setState(partial) },

  resetForNewEpisode() {
    getState().stopProgressTracking()
    setState({
      seriesFinishShown: false, showRecommendations: false, elapsedSeconds: 0,
      hindiStreamUrl: null, hindiUnavailable: false,
    })
  },

  /**
   * Starts a 30s interval that saves progress and checks the same
   * "series finished" heuristic as the web/Android builds: last episode
   * + ≥80% of expected duration watched → show recommendations.
   */
  startProgressTracking(onTick) {
    getState().stopProgressTracking()
    const timer = setInterval(() => {
      setState((s) => ({ elapsedSeconds: s.elapsedSeconds + 30 }))
      onTick?.(getState().elapsedSeconds)
    }, 30000)
    setState({ _progressTimer: timer })
  },

  stopProgressTracking() {
    const { _progressTimer } = getState()
    if (_progressTimer) clearInterval(_progressTimer)
    setState({ _progressTimer: null, elapsedSeconds: 0 })
  },

  triggerRecommendations() { setState({ showRecommendations: true, seriesFinishShown: true }) },
  dismissRecommendations() { setState({ showRecommendations: false }) },
}))
