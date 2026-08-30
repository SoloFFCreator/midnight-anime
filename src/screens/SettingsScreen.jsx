import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { useSettingsStore } from '../store/settingsStore'
import { colors, radius } from '../theme/theme'

const AUDIO_OPTIONS = [{ id: 'sub', label: 'Sub (Japanese)' }, { id: 'dub', label: 'Dub (English)' }]
const QUALITY_OPTIONS = [{ id: 'auto', label: 'Auto' }, { id: '1080p', label: '1080p' }, { id: '720p', label: '720p' }, { id: '480p', label: '480p' }]
const DOWNLOAD_QUALITY_OPTIONS = [{ id: '1080p', label: '1080p' }, { id: '720p', label: '720p' }, { id: '480p', label: '480p' }]

export default function SettingsScreen({ navigation }) {
  const settings = useSettingsStore()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={20} color={colors.text1} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Section title="Playback">
        <OptionRow label="Audio Language" options={AUDIO_OPTIONS} value={settings.audioLanguage} onChange={(v) => settings.update({ audioLanguage: v })} />
        <OptionRow label="Playback Quality" options={QUALITY_OPTIONS} value={settings.playbackQuality} onChange={(v) => settings.update({ playbackQuality: v })} />
        <ToggleRow label="Auto-play Next Episode" value={settings.autoPlayNext} onChange={(v) => settings.update({ autoPlayNext: v })} />
        <ToggleRow label="Data Saver Mode" subtitle="Reduces quality on cellular data" value={settings.dataSaver} onChange={(v) => settings.update({ dataSaver: v })} />
      </Section>

      <Section title="Downloads">
        <OptionRow label="Download Quality" options={DOWNLOAD_QUALITY_OPTIONS} value={settings.downloadQuality} onChange={(v) => settings.update({ downloadQuality: v })} />
      </Section>

      <Section title="Notifications">
        <ToggleRow label="New Episode Alerts" subtitle="Notify when watchlisted anime releases" value={settings.notificationsEnabled} onChange={(v) => settings.update({ notificationsEnabled: v })} />
      </Section>

      <Section title="About">
        <InfoRow label="AnimeStream" subtitle="Version 1.0.0" />
        <InfoRow label="Catalog data" subtitle="Powered by AniList's public API" />
      </Section>
    </ScrollView>
  )
}

function Section({ title, children }) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  )
}

function OptionRow({ label, options, value, onChange }) {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.pillGroup}>
        {options.map((o) => (
          <TouchableOpacity key={o.id} style={[styles.pill, value === o.id && styles.pillActive]} onPress={() => onChange(o.id)}>
            <Text style={[styles.pillText, value === o.id && styles.pillTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

function ToggleRow({ label, subtitle, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.bg3, true: colors.accent }} thumbColor="#fff" />
    </View>
  )
}

function InfoRow({ label, subtitle }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowSub}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text1, fontSize: 18, fontWeight: '800' },
  sectionTitle: { color: colors.text4, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 8 },
  optionRow: { paddingHorizontal: 16, paddingVertical: 12 },
  rowLabel: { color: colors.text1, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  rowSub: { color: colors.text3, fontSize: 11.5, marginTop: 2 },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: colors.bg2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  pillActive: { backgroundColor: colors.accentDim, borderWidth: 1, borderColor: colors.accent },
  pillText: { color: colors.text2, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: colors.accent, fontWeight: '800' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  infoRow: { paddingHorizontal: 16, paddingVertical: 12 },
})
