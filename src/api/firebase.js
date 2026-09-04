import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// Same Firebase project used across the web/Android builds
const firebaseConfig = {
  apiKey: 'AIzaSyClcy2YXqryJAkg_wy1W4RLqkYMIsEg2Rk',
  authDomain: 'mid-night-anime.firebaseapp.com',
  databaseURL: 'https://mid-night-anime-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'mid-night-anime',
  storageBucket: 'mid-night-anime.firebasestorage.app',
  messagingSenderId: '655330045563',
  appId: '1:655330045563:web:3d99e3be8ad7cb2734bcde',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
export const googleProvider = new GoogleAuthProvider()
