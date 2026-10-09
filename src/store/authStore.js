import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../api/firebase'

const GOOGLE_CLIENT_ID = '655330045563-u7dfu8g3cdask48hhdkpr32kiq644adf.apps.googleusercontent.com'

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity-services]')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', () => reject(new Error('Google Sign-In could not be loaded.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentityServices = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Google Sign-In could not be loaded.'))
    document.head.appendChild(script)
  })
}

const cleanError = (msg) =>
  (msg || 'Something went wrong')
    .replace(/^Firebase:\s*/, '')
    .replace(/\s*\(auth\/[a-z-]+\)\.?$/, '')
    .trim()

export const useAuthStore = create((setState, getState) => ({
  user: null,
  profile: null,
  avatarChoiceId: null,
  isLoading: true,
  error: null,
  infoMessage: null,

  // Called once from App.jsx to listen for auth changes
  init() {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load avatar choice from Firebase
        try {
          const snap = await get(ref(db, `users/${user.uid}/avatarChoice`))
          const avatarChoiceId = snap.exists() ? snap.val() : null
          setState({
            user,
            avatarChoiceId,
            profile: {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              photoURL: user.photoURL || '',
              emailVerified: user.emailVerified,
              isGoogleUser: user.providerData?.some((p) => p.providerId === 'google.com'),
            },
            isLoading: false,
          })
        } catch {
          setState({ user, isLoading: false })
        }
      } else {
        setState({ user: null, profile: null, avatarChoiceId: null, isLoading: false })
      }
    })
  },

  async signIn(email, password) {
    setState({ error: null, isLoading: true })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setState({ isLoading: false, infoMessage: 'Signed in!' })
    } catch (e) {
      setState({ isLoading: false, error: cleanError(e.message) })
    }
  },

  async signUp(email, password) {
    setState({ error: null, isLoading: true })
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setState({ isLoading: false, infoMessage: 'Account created!' })
    } catch (e) {
      setState({ isLoading: false, error: cleanError(e.message) })
    }
  },

  async signInWithGoogle() {
    setState({ error: null, isLoading: true })
    try {
      await loadGoogleIdentityServices()
      const accessToken = await new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (response) => {
            if (response.error) reject(new Error(response.error_description || 'Google Sign-In was cancelled.'))
            else resolve(response.access_token)
          },
          error_callback: (error) => reject(new Error(error?.type === 'popup_closed' ? 'Google Sign-In was cancelled.' : 'Google Sign-In could not be completed.')),
        })
        tokenClient.requestAccessToken({ prompt: 'select_account' })
      })
      const credential = GoogleAuthProvider.credential(null, accessToken)
      await signInWithCredential(auth, credential)
      setState({ isLoading: false, infoMessage: 'Signed in with Google!' })
    } catch (e) {
      setState({ isLoading: false, error: cleanError(e.message) })
    }
  },

  async sendPasswordReset(email) {
    if (!email?.trim()) { setState({ error: 'Enter your email address first' }); return }
    const { profile } = getState()
    if (profile?.isGoogleUser) {
      setState({ infoMessage: 'This account uses Google Sign-In — no password to reset' })
      return
    }
    setState({ error: null, isLoading: true })
    try {
      await sendPasswordResetEmail(auth, email || profile?.email, {
        url: 'https://midnightanime.bond/__/auth/handler',
        handleCodeInApp: true,
      })
      setState({ isLoading: false, infoMessage: 'Password reset email sent! Check your inbox (and spam folder).' })
    } catch (e) {
      setState({ isLoading: false, error: cleanError(e.message) })
    }
  },

  async sendVerificationEmail() {
    const user = auth.currentUser
    if (!user) { setState({ error: 'Sign in first' }); return }
    if (user.emailVerified) { setState({ infoMessage: 'Your email is already verified' }); return }
    setState({ error: null, isLoading: true })
    try {
      await sendEmailVerification(user, {
        url: 'https://midnightanime.bond/__/auth/handler',
        handleCodeInApp: true,
      })
      setState({ isLoading: false, infoMessage: `Verification email sent to ${user.email}` })
    } catch (e) {
      setState({ isLoading: false, error: cleanError(e.message) })
    }
  },

  async setAvatarChoice(choiceId) {
    const { user } = getState()
    setState({ avatarChoiceId: choiceId })
    if (user) {
      try { await set(ref(db, `users/${user.uid}/avatarChoice`), choiceId) } catch {}
    }
  },

  async signOut() {
    await fbSignOut(auth)
    setState({ user: null, profile: null, avatarChoiceId: null })
  },

  clearMessages() { setState({ error: null, infoMessage: null }) },
}))
