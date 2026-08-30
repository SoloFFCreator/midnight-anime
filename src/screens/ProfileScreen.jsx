import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { useAuthStore } from '../store/authStore'
import { colors, radius } from '../theme/theme'

export default function ProfileScreen({ navigation }) {
  const { isGuest, profile, signOut } = useAuthStore()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Icon name="user" size={24} color={colors.text3} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{isGuest ? 'Guest' : profile?.displayName}</Text>
          <Text style={styles.email}>{isGuest ? 'Browsing without an account' : profile?.email}</Text>
        </View>
        {isGuest && (
          <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      <Row icon="settings" label="Settings" onPress={() => navigation.navigate('Settings')} />
      <Row icon="bookmark" label="My Watchlist" onPress={() => navigation.navigate('Watchlist')} />
      <Row icon="download" label="Downloads" onPress={() => navigation.navigate('Downloads')} />
      <Row icon="info" label="About AnimeStream" subtitle="Version 1.0.0" />

      {!isGuest && (
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Icon name="log-out" size={16} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function Row({ icon, label, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}><Icon name={icon} size={16} color={colors.accent} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {onPress && <Icon name="chevron-right" size={16} color={colors.text4} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text1, fontSize: 20, fontWeight: '900', padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg2, marginHorizontal: 16, borderRadius: radius.lg, padding: 16, marginBottom: 20 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.bg3, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text1, fontSize: 15, fontWeight: '800' },
  email: { color: colors.text3, fontSize: 12, marginTop: 2 },
  signInBtn: { borderWidth: 1.5, borderColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  signInBtnText: { color: colors.accent, fontWeight: '700', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { color: colors.text1, fontSize: 14, fontWeight: '700' },
  rowSub: { color: colors.text3, fontSize: 11.5, marginTop: 1 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 24, padding: 14 },
  signOutText: { color: colors.error, fontWeight: '700', fontSize: 13 },
})
