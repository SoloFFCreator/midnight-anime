import React, { useEffect, useState, useCallback } from 'react'
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { AniListApi } from '../api/anilist'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'
import HeroBanner from '../components/HeroBanner'
import ContentRow from '../components/ContentRow'
import { HomeSkeleton } from '../components/SkeletonLoader'
import { colors } from '../theme/theme'

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const { user, isGuest } = useAuthStore()
  const { progress } = useWatchlistStore()

  const load = useCallback(async () => {
    try {
      const home = await AniListApi.fetchHome()
      setData(home)
    } catch (e) { /* keep last-known data on error */ }
  }, [])

  useEffect(() => { load() }, [load])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  function openDetail(anime) { navigation.navigate('Detail', { animeId: anime.id, preview: anime }) }
  function openGenre(genre) { navigation.navigate('Genre', { genreName: genre }) }

  const continueWatching = !isGuest
    ? Object.values(progress).sort((a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0)).slice(0, 10)
    : []

  if (!data) return <View style={styles.container}><HomeSkeleton /></View>

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <HeroBanner items={data.trending} onPressDetail={openDetail} />

      <ContentRow title="Trending Now" items={data.trending} onPressAnime={openDetail} />
      <ContentRow title="Latest Episodes" items={data.latest} onPressAnime={openDetail} />
      <ContentRow title="Most Popular" items={data.popular} onPressAnime={openDetail} />
      <ContentRow title="This Season" items={data.seasonal} onPressAnime={openDetail} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
})
