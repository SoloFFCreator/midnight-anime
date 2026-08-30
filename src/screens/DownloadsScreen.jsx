import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/Feather'
import { useAuthStore } from '../store/authStore'
import { useDownloadsStore } from '../store/downloadsStore'
import { colors, radius } from '../theme/theme'

export default function DownloadsScreen() {
  const { isGuest } = useAuthStore()
  const { downloads, loadMetadata, deleteDownload } = useDownloadsStore()
  const [freeSpace, setFreeSpace] = useState(null)

  useEffect(() => {
    if (!isGuest) loadMetadata()
    RNFS.getFSInfo().then((info) => setFreeSpace(info.freeSpace))
  }, [isGuest])

  const list = Object.entries(downloads).map(([key, d]) => ({ key, ...d }))

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Downloads</Text>

      {freeSpace != null && (
        <View style={styles.storageBar}>
          <Icon name="hard-drive" size={13} color={colors.text3} />
          <Text style={styles.storageText}>{formatBytes(freeSpace)} free on this device</Text>
        </View>
      )}

      {isGuest ? (
        <Empty icon="📥" title="Sign in to download episodes" subtitle="Downloads sync your library across sessions" />
      ) : list.length === 0 ? (
        <Empty icon="📭" title="No downloads yet" subtitle="Download episodes from the player to watch offline" />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => <DownloadRow item={item} onDelete={() => deleteDownload(item.animeId, item.episodeId)} />}
        />
      )}
    </View>
  )
}

function DownloadRow({ item, onDelete }) {
  const isDownloading = item.status === 'downloading'
  const isFailed = item.status === 'failed'
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>Anime #{item.animeId} · Ep {item.episodeId}</Text>
        <Text style={styles.rowSub}>
          {isDownloading ? `Downloading… ${Math.round((item.progress || 0) * 100)}%` : isFailed ? 'Download failed' : `${item.quality} · Downloaded`}
        </Text>
        {isDownloading && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(item.progress || 0) * 100}%` }]} />
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Icon name="trash-2" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  )
}

function Empty({ icon, title, subtitle }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  )
}

function formatBytes(bytes) {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text1, fontSize: 20, fontWeight: '900', padding: 16, paddingBottom: 4 },
  storageBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 8 },
  storageText: { color: colors.text3, fontSize: 11.5 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg2, borderRadius: radius.md, padding: 14 },
  rowTitle: { color: colors.text1, fontSize: 13, fontWeight: '700' },
  rowSub: { color: colors.text3, fontSize: 11, marginTop: 2 },
  progressTrack: { height: 3, backgroundColor: colors.bg3, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent },
  deleteBtn: { padding: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, marginTop: -60 },
  emptyTitle: { color: colors.text1, fontWeight: '800', fontSize: 15, marginBottom: 4 },
  emptySub: { color: colors.text3, fontSize: 12, textAlign: 'center' },
})
