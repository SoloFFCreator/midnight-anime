import { create } from 'zustand'
import { firebaseDb } from '../api/firebase'
import { useAuthStore } from './authStore'

export const useWatchlistStore = create((set, get) => ({
  watchlist: new Set(),   // Set<animeId>
  progress: {},           // { [animeId]: { episodeId, progressSeconds, durationSeconds, lastWatchedAt, completed } }
  _unsub: null,

  startListening() {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    const ref = firebaseDb.ref(`users/${uid}/watchlist`)
    const listener = ref.on('value', (snap) => {
      const data = snap.val() || {}
      set({ watchlist: new Set(Object.keys(data).map(Number)) })
    })
    set({ _unsub: () => ref.off('value', listener) })

    firebaseDb.ref(`users/${uid}/progress`).once('value').then((snap) => {
      set({ progress: snap.val() || {} })
    })
  },

  stopListening() {
    get()._unsub?.()
    set({ _unsub: null })
  },

  async addToWatchlist(anime) {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    await firebaseDb.ref(`users/${uid}/watchlist/${anime.id}`).set({
      animeId: anime.id,
      addedAt: Date.now(),
      status: anime.status || 'unknown',
    })
    set((s) => ({ watchlist: new Set([...s.watchlist, anime.id]) }))
  },

  async removeFromWatchlist(animeId) {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    await firebaseDb.ref(`users/${uid}/watchlist/${animeId}`).remove()
    set((s) => { const next = new Set(s.watchlist); next.delete(animeId); return { watchlist: next } })
  },

  /** Per PRD's "Watch data" model: animeId, episodeId, progressSeconds, durationSeconds, lastWatchedAt, completed */
  async saveProgress(animeId, episodeId, progressSeconds, durationSeconds) {
    const completed = durationSeconds > 0 && progressSeconds / durationSeconds >= 0.9
    const data = { animeId, episodeId, progressSeconds, durationSeconds, lastWatchedAt: Date.now(), completed }
    set((s) => ({ progress: { ...s.progress, [animeId]: data } }))
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    try { await firebaseDb.ref(`users/${uid}/progress/${animeId}`).set(data) } catch {}
  },

  getProgress(animeId) { return get().progress[animeId] || null },
}))
