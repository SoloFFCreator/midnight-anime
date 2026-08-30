import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import FastImage from 'react-native-fast-image'
import LinearGradient from 'react-native-linear-gradient'
import { TT } from '../api/anilist'
import { colors, radius, shadow } from '../theme/theme'

const { width: SCREEN_W } = Dimensions.get('window')

export default function HeroBanner({ items, onPressDetail }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!items?.length) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000)
    return () => clearInterval(timerRef.current)
  }, [items?.length])

  if (!items?.length) return null
  const anime = items[index % items.length]
  const bgUrl = anime.bannerImage || anime.coverImage?.extraLarge

  return (
    <View style={styles.wrap}>
      <FastImage source={{ uri: bgUrl }} style={styles.bg} resizeMode={FastImage.resizeMode.cover} />
      <LinearGradient colors={['transparent', 'rgba(10,10,15,0.4)', colors.bg]} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <View style={styles.genreRow}>
          {(anime.genres || []).slice(0, 2).map((g) => (
            <View key={g} style={styles.genreChip}><Text style={styles.genreText}>{g}</Text></View>
          ))}
        </View>

        <Text style={styles.title} numberOfLines={2}>{TT(anime)}</Text>

        <TouchableOpacity style={[styles.playBtn, shadow.glow]} onPress={() => onPressDetail(anime)} activeOpacity={0.9}>
          <Text style={styles.playBtnText}>▶  View Details</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {items.map((_, i) => (
            <View key={i} style={[styles.dot, i === index % items.length && styles.dotActive]} />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: SCREEN_W, aspectRatio: 4 / 5, backgroundColor: colors.bg2 },
  bg: { ...StyleSheet.absoluteFillObject },
  content: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  genreRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  genreChip: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  genreText: { color: colors.text2, fontSize: 11, fontWeight: '600' },
  title: { color: colors.text1, fontSize: 26, fontWeight: '900', marginBottom: 14, lineHeight: 30 },
  playBtn: { backgroundColor: colors.accent, alignSelf: 'flex-start', paddingHorizontal: 22, paddingVertical: 13, borderRadius: radius.md },
  playBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 22, backgroundColor: colors.accent },
})
