import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'animestream_settings'

const defaults = {
  subtitleLanguage: 'en',
  audioLanguage: 'sub',   // 'sub' | 'dub'
  playbackQuality: 'auto',
  downloadQuality: '720p',
  dataSaver: false,
  theme: 'dark',
  autoPlayNext: true,
  notificationsEnabled: false,
}

export const useSettingsStore = create((set, get) => ({
  ...defaults,
  _loaded: false,

  async load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) set({ ...defaults, ...JSON.parse(raw), _loaded: true })
      else set({ _loaded: true })
    } catch { set({ _loaded: true }) }
  },

  async update(partial) {
    set(partial)
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get())) } catch {}
  },
}))
