import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { colors, radius } from '../theme/theme'

export default function AuthScreen({ navigation }) {
  const { signIn, signUp, continueAsGuest, sendPasswordReset, isLoading, error, clearError } = useAuthStore()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit() {
    if (tab === 'signin') await signIn(email, password)
    else await signUp(email, password)
    navigation.replace('Main')
  }

  function guest() {
    continueAsGuest()
    navigation.replace('Main')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Welcome to</Text>
      <Text style={styles.title}>AnimeStream</Text>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'signin' && styles.tabActive]} onPress={() => setTab('signin')}>
          <Text style={[styles.tabText, tab === 'signin' && styles.tabTextActive]}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'signup' && styles.tabActive]} onPress={() => setTab('signup')}>
          <Text style={[styles.tabText, tab === 'signup' && styles.tabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input} value={email} onChangeText={setEmail} placeholder="Email"
        placeholderTextColor={colors.text4} autoCapitalize="none" keyboardType="email-address"
      />
      <TextInput
        style={styles.input} value={password} onChangeText={setPassword} placeholder="Password"
        placeholderTextColor={colors.text4} secureTextEntry
      />

      {tab === 'signin' && (
        <TouchableOpacity onPress={() => sendPasswordReset(email)} style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={isLoading || !email || !password}>
        {isLoading ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.primaryBtnText}>{tab === 'signin' ? 'Sign In' : 'Create Account'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={guest} style={styles.guestBtn}>
        <Text style={styles.guestBtnText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, paddingTop: 80 },
  eyebrow: { color: colors.text3, fontSize: 14 },
  title: { color: colors.text1, fontSize: 30, fontWeight: '900', marginBottom: 28 },
  tabs: { flexDirection: 'row', backgroundColor: colors.bg2, borderRadius: radius.pill, padding: 3, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.text3, fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  input: { backgroundColor: colors.bg2, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, color: colors.text1, fontSize: 14, marginBottom: 12 },
  forgot: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  error: { color: colors.error, fontSize: 12, marginBottom: 10 },
  primaryBtn: { backgroundColor: colors.accent, paddingVertical: 15, borderRadius: radius.md, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  guestBtn: { alignItems: 'center', marginTop: 18 },
  guestBtnText: { color: colors.text3, fontWeight: '600', fontSize: 13 },
})
