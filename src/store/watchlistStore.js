import { create } from 'zustand'
import { ref, set, get, remove, update, onValue } from 'firebase/database'
import { db } from '../api/firebase'
import { useAuthStore } from './authStore'

export const useWatchlistStore = create((setState, getState) => ({
  watchlist: new Set(), // Set<animeId>
  progress: {},         // { [animeId]: WatchProgress }
  episodeRatings: {},   // { [`${animeId}_ep${ep}`]: { likes, dislikes } }
  userRatings: {},      // { [`${animeId}_ep${ep}`]: 1 | -1 | null }
  _unsub: null,

  // Start a real-time listener for watchlist + progress. Call on sign-in.
  startListening() {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    const wlRef = ref(db, `users/${uid}/watchlist`)
    const unsub = onValue(wlRef, (snap) => {
      const data = snap.val() || {}
      setState({ watchlist: new Set(Object.keys(data).map(Number)) })
    })
    setState({ _unsub: unsub })

    // Load progress once on sign-in (not real-time — saves bandwidth)
    get(ref(db, `users/${uid}/progress`)).then((snap) => {
      if (!snap.exists()) return
      const p = {}
      snap.forEach((child) => {
        p[child.key] = child.val()
      })
      setState({ progress: p })
    }).catch(() => {})
  },

  stopListening() {
    const { _unsub } = getState()
    if (_unsub) { _unsub(); setState({ _unsub: null }) }
  },

  async addToWatchlist(anime) {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    const data = {
      id: anime.id, idMal: anime.idMal,
      title: anime.title?.english || anime.title?.romaji || '',
      cover: anime.coverImage?.large || '',
      format: anime.format || 'TV',
      episodes: anime.episodes || null,
      averageScore: anime.averageScore || null,
      addedAt: Date.now(),
    }
    await set(ref(db, `users/${uid}/watchlist/${anime.id}`), data)
    setState((s) => ({ watchlist: new Set([...s.watchlist, anime.id]) }))
  },

  async removeFromWatchlist(animeId) {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    await remove(ref(db, `users/${uid}/watchlist/${animeId}`))
    setState((s) => {
      const next = new Set(s.watchlist)
      next.delete(animeId)
      return { watchlist: next }
    })
  },

  async saveProgress(animeId, episode, timeSeconds, anime) {
    const uid = useAuthStore.getState().user?.uid
    const data = {
      ep: episode, time: timeSeconds,
      duration: anime?.duration || 24,
      updatedAt: Date.now(),
      title: anime?.title?.english || anime?.title?.romaji || '',
      cover: anime?.coverImage?.large || '',
      format: anime?.format || 'TV',
      episodes: anime?.episodes || null,
    }
    setState((s) => ({ progress: { ...s.progress, [animeId]: data } }))
    if (!uid) return
    try { await set(ref(db, `users/${uid}/progress/${animeId}`), data) } catch {}
  },

  getProgress(animeId) {
    return getState().progress[String(animeId)] || null
  },

  // Episode ratings — public real-time counts
  subscribeToRatings(animeId, episode) {
    const rKey = `ratings/${animeId}/ep${episode}`
    return onValue(ref(db, rKey), (snap) => {
      const d = snap.val() || { likes: 0, dislikes: 0 }
      const stateKey = `${animeId}_ep${episode}`
      setState((s) => ({
        episodeRatings: { ...s.episodeRatings, [stateKey]: { likes: d.likes || 0, dislikes: d.dislikes || 0 } },
      }))
    })
  },

  async rateEpisode(animeId, episode, value) {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    const stateKey = `${animeId}_ep${episode}`
    const prev = getState().userRatings[stateKey] || null
    const newRating = prev === value ? null : value
    setState((s) => ({ userRatings: { ...s.userRatings, [stateKey]: newRating } }))
    try {
      await set(ref(db, `users/${uid}/ratings/${animeId}_ep${episode}`), newRating)
    } catch {}
  },

  async loadUserRating(animeId, episode) {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    try {
      const snap = await get(ref(db, `users/${uid}/ratings/${animeId}_ep${episode}`))
      const val = snap.exists() ? snap.val() : null
      const stateKey = `${animeId}_ep${episode}`
      setState((s) => ({ userRatings: { ...s.userRatings, [stateKey]: val } }))
    } catch {}
  },
}))
