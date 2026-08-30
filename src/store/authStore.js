import { create } from 'zustand'
import { firebaseAuth, firebaseDb } from '../api/firebase'

const cleanError = (msg) =>
  (msg || 'Something went wrong').replace(/^\[.*?\]\s*/, '').replace(/\s*\(auth\/[a-z-]+\)\.?$/, '').trim()

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isGuest: true,
  isLoading: true,
  error: null,

  init() {
    return firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        set({
          user, isGuest: false, isLoading: false,
          profile: {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            emailVerified: user.emailVerified,
          },
        })
      } else {
        set({ user: null, profile: null, isGuest: true, isLoading: false })
      }
    })
  },

  async signIn(email, password) {
    set({ error: null, isLoading: true })
    try {
      await firebaseAuth.signInWithEmailAndPassword(email, password)
      set({ isLoading: false })
    } catch (e) { set({ isLoading: false, error: cleanError(e.message) }) }
  },

  async signUp(email, password) {
    set({ error: null, isLoading: true })
    try {
      await firebaseAuth.createUserWithEmailAndPassword(email, password)
      set({ isLoading: false })
    } catch (e) { set({ isLoading: false, error: cleanError(e.message) }) }
  },

  async sendPasswordReset(email) {
    if (!email?.trim()) { set({ error: 'Enter your email address first' }); return }
    try {
      await firebaseAuth.sendPasswordResetEmail(email)
      set({ error: null })
      return true
    } catch (e) { set({ error: cleanError(e.message) }); return false }
  },

  continueAsGuest() { set({ isGuest: true, user: null, profile: null }) },

  async signOut() {
    await firebaseAuth.signOut()
    set({ user: null, profile: null, isGuest: true })
  },

  clearError() { set({ error: null }) },
}))
