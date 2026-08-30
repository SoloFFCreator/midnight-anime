import React, { useRef, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, radius } from '../theme/theme'

const { width: SCREEN_W } = Dimensions.get('window')

const slides = [
  { emoji: '🌙', title: 'Every anime,\none app', body: 'Track, discover, and stream thousands of series and movies.' },
  { emoji: '📥', title: 'Watch anywhere', body: 'Download episodes for offline viewing, no connection needed.' },
  { emoji: '🎯', title: 'Pick up instantly', body: 'Continue exactly where you left off, on any device.' },
]

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0)
  const listRef = useRef(null)

  async function finish() {
    await AsyncStorage.setItem('onboarding_complete', '1')
    navigation.replace('Auth')
  }

  function next() {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 })
      setIndex(index + 1)
    } else {
      finish()
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextBtnText}>{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
        {index < slides.length - 1 && (
          <TouchableOpacity onPress={finish}><Text style={styles.skip}>Skip</Text></TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  slide: { width: SCREEN_W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 80 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { color: colors.text1, fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 12, lineHeight: 32 },
  body: { color: colors.text3, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  footer: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bg3 },
  dotActive: { width: 22, backgroundColor: colors.accent },
  nextBtn: { backgroundColor: colors.accent, width: '100%', paddingVertical: 15, borderRadius: radius.md, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  skip: { color: colors.text3, fontSize: 12, fontWeight: '600', marginTop: 14 },
})
