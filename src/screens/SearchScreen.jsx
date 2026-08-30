import React, { useState, useRef, useCallback } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { AniListApi } from '../api/anilist'
import { groupSeasons } from '../utils/seasonGrouper'
import AnimeCard from '../components/AnimeCard'
import { colors, radius } from '../theme/theme'

const GENRES = ['Action', 'Romance', 'Comedy', 'Fantasy', 'Isekai', 'Horror', 'Sci-Fi', 'Slice of Life', 'Sports', 'Mystery']

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [ungroupedCount, setUngroupedCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef(null)

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const { results: raw } = await AniListApi.search(q)
      setResults(groupSeasons(raw))
      setUngroupedCount(raw.length)
    } catch { setResults([]) }
    setLoading(false)
  }, [])

  function onChangeText(v) {
    setQuery(v)
    clearTimeout(debounceRef.current)
    if (!v.trim()) { setResults([]); setHasSearched(false); return }
    debounceRef.current = setTimeout(() => runSearch(v), 450)
  }

  function openDetail(anime) { navigation.navigate('Detail', { animeId: anime.id, preview: anime }) }
  function openGenre(genre) { navigation.navigate('Genre', { genreName: genre }) }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search" size={16} color={colors.text3} />
        <TextInput
          value={query} onChangeText={onChangeText} placeholder="Search anime, movies..."
          placeholderTextColor={colors.text4} style={styles.input}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false) }}>
            <Icon name="x" size={16} color={colors.text3} />
          </TouchableOpacity>
        )}
      </View>

      {!hasSearched ? (
        <View style={styles.genreSection}>
          <Text style={styles.sectionLabel}>Browse by Genre</Text>
          <View style={styles.genreGrid}>
            {GENRES.map((g) => (
              <TouchableOpacity key={g} style={styles.genreChip} onPress={() => openGenre(g)}>
                <Text style={styles.genreChipText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : (
        <>
          <Text style={styles.resultCount}>
            {results.length === ungroupedCount ? `${results.length} results` : `${results.length} series · ${ungroupedCount} seasons grouped`}
          </Text>
          <FlatList
            data={results}
            numColumns={3}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            columnWrapperStyle={{ gap: 10, marginBottom: 14 }}
            renderItem={({ item }) => <AnimeCard anime={item} width="31%" onPress={() => openDetail(item)} />}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg2,
    marginHorizontal: 16, marginTop: 16, marginBottom: 8, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10,
  },
  input: { flex: 1, color: colors.text1, fontSize: 14 },
  genreSection: { paddingHorizontal: 16, marginTop: 12 },
  sectionLabel: { color: colors.text3, fontSize: 11, fontWeight: '700', marginBottom: 10 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { backgroundColor: colors.bg2, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md },
  genreChipText: { color: colors.text2, fontSize: 13, fontWeight: '600' },
  resultCount: { color: colors.text3, fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
})
