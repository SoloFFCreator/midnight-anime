import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './src/navigation/RootNavigator'
import { useAuthStore } from './src/store/authStore'
import { useWatchlistStore } from './src/store/watchlistStore'
import { useSettingsStore } from './src/store/settingsStore'
import { colors } from './src/theme/theme'

export default function App() {
  const initAuth = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const startListening = useWatchlistStore((s) => s.startListening)
  const stopListening = useWatchlistStore((s) => s.stopListening)
  const loadSettings = useSettingsStore((s) => s.load)

  useEffect(() => {
    const unsub = initAuth()
    loadSettings()
    return () => unsub && unsub()
  }, [])

  useEffect(() => {
    if (user) startListening()
    else stopListening()
  }, [user])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <RootNavigator initialRoute="Splash" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
