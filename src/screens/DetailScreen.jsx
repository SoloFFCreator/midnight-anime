import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/Feather'
import { AniListApi, TT, totEps } from '../api/anilist'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'
import { colors, radius, shadow } from '../theme/theme'

export default function DetailScreen({ route, navigation }) {
  const { animeId, preview } = route.params
  const [anime, setAnime] = useState(preview || null)
  const [descExpanded, setDescExpanded] = useState(false)

  const { isGuest } = useAuthStore()
  const { watchlist, addToWatchlist, removeFromWatchlist, getProgress } = useWatchlistStore()
  const inWatchlist = watchlist.has(animeId)
  const progress = getProgress(animeId)

  useEffect(() => {
    AniListApi.fetchDetail(animeId).then(setAnime)
  }, [animeId])

  if (!anime) return <View style={styles.container}><ActivityIndicator style={{ marginTop: 60 }} color={colors.accent} /></View>

  const total = Math.min(totEps(anime), 50)
  const resumeEp = progress?.episodeId || 1
  const hasProgress = progress && (progress.episodeId > 1 || progress.progressSeconds > 30)
  const related = (anime.recommendations?.nodes || []).map((n) => n.mediaRecommendation).filter(Boolean).slice(0, 6)

  function play(ep) { navigation.navigate('Player', { animeId, episode: ep, anime }) }
  function toggleWatchlist() {
    if (isGuest) { navigation.navigate('Auth'); return }
    inWatchlist ? removeFromWatchlist(animeId) : addToWatchlist(anime)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.bannerWrap}>
        <FastImage source={{ uri: anime.bannerImage || anime.coverImage?.extraLarge }} style={styles.banner} resizeMode={FastImage.resizeMode.cover} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{TT(anime)}</Text>

        <View style={styles.metaRow}>
          {anime.averageScore && <Text style={styles.metaText}>★ {(anime.averageScore / 10).toFixed(1)}</Text>}
          <Text style={styles.metaTextDim}>{anime.format || 'TV'}</Text>
          {anime.seasonYear && <Text style={styles.metaTextDim}>· {anime.season} {anime.seasonYear}</Text>}
        </View>

        <View style={styles.genreRow}>
          {(anime.genres || []).slice(0, 5).map((g) => (
            <TouchableOpacity key={g} style={styles.genreChip} onPress={() => navigation.navigate('Genre', { genreName: g })}>
              <Text style={styles.genreChipText}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.desc} numberOfLines={descExpanded ? undefined : 4}>
          {(anime.description || '').replace(/<[^>]+>/g, '')}
        </Text>
        {!descExpanded && (
          <TouchableOpacity onPress={() => setDescExpanded(true)}><Text style={styles.showMore}>Show more</Text></TouchableOpacity>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.playBtn, shadow.glow]} onPress={() => play(resumeEp)}>
            <Icon name="play" size={16} color="#fff" />
            <Text style={styles.playBtnText}>{hasProgress ? `CONTINUE E${resumeEp}` : 'START WATCHING E1'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.wlBtn, inWatchlist && styles.wlBtnActive]} onPress={toggleWatchlist}>
            <Icon name={inWatchlist ? 'bookmark' : 'bookmark'} size={18} color={inWatchlist ? colors.accent : colors.text2} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Episodes ({total >= 9999 ? 'Ongoing' : total})</Text>
      {Array.from({ length: total }, (_, i) => i + 1).map((ep) => (
        <EpisodeRow key={ep} ep={ep} anime={anime} onPress={() => play(ep)} />
      ))}

      {related.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {related.map((r) => (
              <TouchableOpacity key={r.id} onPress={() => navigation.push('Detail', { animeId: r.id, preview: r })} style={{ width: 110 }}>
                <FastImage source={{ uri: r.coverImage?.large }} style={styles.relatedPoster} />
                <Text style={styles.relatedTitle} numberOfLines={2}>{TT(r)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  )
}

function EpisodeRow({ ep, anime, onPress }) {
  const streamEp = anime.streamingEpisodes?.[ep - 1]
  const thumb = streamEp?.thumbnail || anime.bannerImage || anime.coverImage?.large
  const dur = anime.duration ? `${anime.duration}m` : '23m'

  return (
    <TouchableOpacity style={styles.epRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.epThumbWrap}>
        <FastImage source={{ uri: thumb }} style={styles.epThumb} resizeMode={FastImage.resizeMode.cover} />
        <View style={styles.epDurBadge}><Text style={styles.epDurText}>{dur}</Text></View>
        <View style={styles.epPlayOverlay}><Icon name="play" size={13} color="#fff" /></View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.epTitle} numberOfLines={1}>E{ep}{streamEp?.title ? ` — ${streamEp.title}` : ''}</Text>
        <Text style={styles.epSub}>Sub · Dub</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bannerWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.bg2 },
  banner: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 12 },
  title: { color: colors.text1, fontSize: 22, fontWeight: '900', marginBottom: 6, lineHeight: 27 },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  metaText: { color: colors.text2, fontSize: 12, fontWeight: '700' },
  metaTextDim: { color: colors.text3, fontSize: 12 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  genreChip: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  genreChipText: { color: colors.text2, fontSize: 11, fontWeight: '600' },
  desc: { color: colors.text2, fontSize: 13, lineHeight: 19 },
  showMore: { color: colors.accent, fontSize: 12, fontWeight: '700', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  playBtn: { flex: 1, height: 48, backgroundColor: colors.accent, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  playBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  wlBtn: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line2, alignItems: 'center', justifyContent: 'center' },
  wlBtnActive: { borderColor: colors.accent },
  sectionTitle: { color: colors.text1, fontSize: 15, fontWeight: '800', paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  epRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  epThumbWrap: { width: 110, aspectRatio: 16 / 9, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.bg2 },
  epThumb: { width: '100%', height: '100%' },
  epDurBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, borderRadius: 4 },
  epDurText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  epPlayOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  epTitle: { color: colors.text1, fontSize: 13, fontWeight: '600' },
  epSub: { color: colors.text3, fontSize: 10.5 },
  relatedPoster: { width: '100%', aspectRatio: 2 / 3, borderRadius: radius.md, backgroundColor: colors.bg2 },
  relatedTitle: { color: colors.text1, fontSize: 11, fontWeight: '600', marginTop: 6, lineHeight: 14 },
})
