import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../theme/theme'

export default function SplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.85)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(async () => {
      const seenOnboarding = await AsyncStorage.getItem('onboarding_complete')
      navigation.replace(seenOnboarding ? 'Main' : 'Onboarding')
    }, 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>▶</Text>
        </View>
        <Text style={styles.wordmark}>AnimeStream</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14,
  },
  logoEmoji: { color: '#fff', fontSize: 26 },
  wordmark: { color: colors.text1, fontSize: 20, fontWeight: '900', textAlign: 'center', letterSpacing: -0.3 },
})
