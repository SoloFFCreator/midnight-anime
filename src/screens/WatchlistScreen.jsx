import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { AniListApi } from '../api/anilist'
import { useAuthStore } from '../store/authStore'
import { useWatchlistStore } from '../store/watchlistStore'
import AnimeCard from '../components/AnimeCard'
import { colors, radius } from '../theme/theme'

export default function WatchlistScreen({ navigation }) {
  const { isGuest } = useAuthStore()
  const { watchlist } = useWatchlistStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isGuest) { setLoading(false); return }
    setLoading(true)
    Promise.all([...watchlist].map((id) => AniListApi.fetchDetail(id).catch(() => null)))
      .then((results) => { setItems(results.filter(Boolean)); setLoading(false) })
  }, [isGuest, watchlist.size])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My List</Text>

      {isGuest ? (
        <EmptyState icon="🔖" title="Sign in to save anime" subtitle="Your watchlist syncs across devices" cta="Sign In" onPress={() => navigation.navigate('Auth')} />
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : items.length === 0 ? (
        <EmptyState icon="📑" title="Your list is empty" subtitle="Tap the bookmark icon on any anime to add it" />
      ) : (
        <FlatList
          data={items}
          numColumns={3}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 14 }}
          renderItem={({ item }) => (
            <AnimeCard anime={item} width="31%" onPress={() => navigation.navigate('Detail', { animeId: item.id, preview: item })} />
          )}
        />
      )}
    </View>
  )
}

function EmptyState({ icon, title, subtitle, cta, onPress }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
      {cta && (
        <TouchableOpacity style={styles.emptyCta} onPress={onPress}>
          <Text style={styles.emptyCtaText}>{cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text1, fontSize: 20, fontWeight: '900', padding: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, marginTop: -60 },
  emptyTitle: { color: colors.text1, fontWeight: '800', fontSize: 15, marginBottom: 4 },
  emptySub: { color: colors.text3, fontSize: 12, textAlign: 'center' },
  emptyCta: { backgroundColor: colors.accent, paddingHorizontal: 20, paddingVertical: 11, borderRadius: radius.pill, marginTop: 16 },
  emptyCtaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
})
