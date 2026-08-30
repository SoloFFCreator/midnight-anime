import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { AniListApi } from '../api/anilist'
import { groupSeasons } from '../utils/seasonGrouper'
import AnimeCard from '../components/AnimeCard'
import { colors } from '../theme/theme'

export default function GenreScreen({ route, navigation }) {
  const { genreName } = route.params
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AniListApi.fetchGenre(genreName).then(({ results: raw }) => {
      setResults(groupSeasons(raw))
      setLoading(false)
    })
  }, [genreName])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.text1} />
        </TouchableOpacity>
        <Text style={styles.title}>{genreName} Anime</Text>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} /> : (
        <FlatList
          data={results}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text1, fontSize: 18, fontWeight: '800' },
})
