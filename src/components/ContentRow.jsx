import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import AnimeCard from './AnimeCard'
import { colors } from '../theme/theme'

export default function ContentRow({ title, items, onPressAnime, onSeeAll }) {
  if (!items?.length) return null
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        )}
      </View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={{ marginRight: 10 }}>
            <AnimeCard anime={item} onPress={() => onPressAnime(item)} />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  title: { color: colors.text1, fontSize: 17, fontWeight: '800' },
  seeAll: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 16 },
})
