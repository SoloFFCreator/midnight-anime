import { create } from 'zustand'
import RNFS from 'react-native-fs'
import { firebaseDb } from '../api/firebase'
import { useAuthStore } from './authStore'

const DOWNLOAD_DIR = `${RNFS.DocumentDirectoryPath}/downloads`

/**
 * Per PRD: actual media files stay on-device; Firebase only stores
 * download *metadata* (animeId, episodeId, filePath, quality, status)
 * so a user's download list can be seen across sessions/devices, even
 * though the files themselves don't sync.
 */
export const useDownloadsStore = create((set, get) => ({
  downloads: {},   // { [`${animeId}_${episodeId}`]: { filePath, quality, status, progress, downloadedAt } }

  async loadMetadata() {
    const uid = useAuthStore.getState().user?.uid
    if (!uid) return
    const snap = await firebaseDb.ref(`users/${uid}/downloads`).once('value')
    set({ downloads: snap.val() || {} })
  },

  async startDownload(animeId, episodeId, streamUrl, quality = '720p') {
    await RNFS.mkdir(DOWNLOAD_DIR).catch(() => {})
    const key = `${animeId}_${episodeId}`
    const filePath = `${DOWNLOAD_DIR}/${key}.mp4`

    set((s) => ({ downloads: { ...s.downloads, [key]: { filePath, quality, status: 'downloading', progress: 0 } } }))

    const { promise } = RNFS.downloadFile({
      fromUrl: streamUrl,
      toFile: filePath,
      progress: (res) => {
        const pct = res.bytesWritten / res.contentLength
        set((s) => ({ downloads: { ...s.downloads, [key]: { ...s.downloads[key], progress: pct } } }))
      },
      progressDivider: 5,
    })

    try {
      await promise
      const record = { filePath, quality, status: 'completed', progress: 1, downloadedAt: Date.now(), animeId, episodeId }
      set((s) => ({ downloads: { ...s.downloads, [key]: record } }))
      const uid = useAuthStore.getState().user?.uid
      if (uid) await firebaseDb.ref(`users/${uid}/downloads/${key}`).set(record)
    } catch (e) {
      set((s) => ({ downloads: { ...s.downloads, [key]: { ...s.downloads[key], status: 'failed' } } }))
    }
  },

  async deleteDownload(animeId, episodeId) {
    const key = `${animeId}_${episodeId}`
    const record = get().downloads[key]
    if (record?.filePath) await RNFS.unlink(record.filePath).catch(() => {})
    set((s) => { const next = { ...s.downloads }; delete next[key]; return { downloads: next } })
    const uid = useAuthStore.getState().user?.uid
    if (uid) await firebaseDb.ref(`users/${uid}/downloads/${key}`).remove().catch(() => {})
  },

  getDownload(animeId, episodeId) { return get().downloads[`${animeId}_${episodeId}`] || null },
}))
