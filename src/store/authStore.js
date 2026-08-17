import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db, googleProvider } from '../api/firebase'

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
      await signInWithPopup(auth, googleProvider)
      setState({ isLoading: false })
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
      await sendPasswordResetEmail(auth, email || profile?.email)
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
      await sendEmailVerification(user)
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
