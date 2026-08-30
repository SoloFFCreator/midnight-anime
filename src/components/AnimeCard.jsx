import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'
import { TT, totEps } from '../api/anilist'
import { colors, radius, shadow } from '../theme/theme'

export default function AnimeCard({ anime, width = 128, onPress }) {
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null
  const seasonCount = anime._seasonCount || 0

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ width }}>
      <View style={[styles.posterWrap, shadow.card]}>
        <FastImage
          source={{ uri: anime.coverImage?.extraLarge || anime.coverImage?.large }}
          style={styles.poster}
          resizeMode={FastImage.resizeMode.cover}
        />
        {score && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>★ {score}</Text>
          </View>
        )}
        {anime.format === 'MOVIE' && (
          <View style={styles.movieBadge}>
            <Text style={styles.movieBadgeText}>MOVIE</Text>
          </View>
        )}
        {seasonCount > 1 && (
          <View style={styles.seasonBadge}>
            <Text style={styles.seasonBadgeText}>{seasonCount} seasons</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{TT(anime)}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  posterWrap: {
    width: '100%', aspectRatio: 2 / 3, borderRadius: radius.md,
    overflow: 'hidden', backgroundColor: colors.bg2,
  },
  poster: { width: '100%', height: '100%' },
  scoreBadge: {
    position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  scoreText: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  movieBadge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: colors.accentDim,
    borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  movieBadgeText: { color: colors.accent, fontSize: 9, fontWeight: '900' },
  seasonBadge: {
    position: 'absolute', bottom: 6, left: 6, backgroundColor: colors.accent,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  seasonBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  title: { color: colors.text1, fontSize: 12, fontWeight: '600', marginTop: 6, lineHeight: 15 },
})
