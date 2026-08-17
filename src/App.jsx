import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import AnimatedBackground from './components/ui/AnimatedBackground'
import Navbar from './components/ui/Navbar'
import BottomNav from './components/ui/BottomNav'

import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import WatchPage from './pages/WatchPage'
import SearchPage from './pages/SearchPage'
import GenrePage from './pages/GenrePage'
import WatchlistPage from './pages/WatchlistPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import RecommendationPage from './pages/RecommendationPage'

import { useAuthStore } from './store/authStore'
import { useWatchlistStore } from './store/watchlistStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  const init = useAuthStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const startListening = useWatchlistStore((s) => s.startListening)
  const stopListening = useWatchlistStore((s) => s.stopListening)

  useEffect(() => {
    const unsub = init()
    return () => unsub && unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) startListening()
    else stopListening()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const isFullScreenRoute = location.pathname.startsWith('/recommend/')

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground variant={location.pathname === '/' ? 'hero' : 'default'} />

      {!isFullScreenRoute && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="/anime/:id" element={<AnimatedPage><DetailPage /></AnimatedPage>} />
          <Route path="/watch/:id/:episode" element={<AnimatedPage><WatchPage /></AnimatedPage>} />
          <Route path="/search" element={<AnimatedPage><SearchPage /></AnimatedPage>} />
          <Route path="/genre/:name" element={<AnimatedPage><GenrePage /></AnimatedPage>} />
          <Route path="/watchlist" element={<AnimatedPage><WatchlistPage /></AnimatedPage>} />
          <Route path="/settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />
          <Route path="/auth" element={<AnimatedPage><AuthPage /></AnimatedPage>} />
          <Route path="/recommend/:id" element={<RecommendationPage />} />
          <Route path="/trending" element={<AnimatedPage><HomePage /></AnimatedPage>} />
        </Routes>
      </AnimatePresence>

      {!isFullScreenRoute && <div className="h-16" />}
      {!isFullScreenRoute && <BottomNav />}
    </div>
  )
}
