import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import AnimatedBackground from './components/ui/AnimatedBackground'
import Navbar from './components/ui/Navbar'
import BottomNav from './components/ui/BottomNav'

import LandingPage from './pages/LandingPage'
import DownloadPage from './pages/DownloadPage'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import WatchPage from './pages/WatchPage'
import SearchPage from './pages/SearchPage'
import GenrePage from './pages/GenrePage'
import WatchlistPage from './pages/WatchlistPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import RecommendationPage from './pages/RecommendationPage'
import LegalPage from './pages/LegalPage'
import ShareRedirectPage from './pages/ShareRedirectPage'

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
  const isPublicRoute = ['/', '/download', '/privacy', '/terms'].includes(location.pathname)
  const showAppChrome = !isPublicRoute && !isFullScreenRoute

  return (
    <div className="min-h-screen relative">
      {!isPublicRoute && <AnimatedBackground variant={location.pathname === '/app' ? 'hero' : 'default'} />}

      {showAppChrome && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/share/series/:id" element={<ShareRedirectPage kind="series" />} />
          <Route path="/share/episode/:id/:episode" element={<ShareRedirectPage kind="episode" />} />
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

      {showAppChrome && <div className="h-16" />}
      {showAppChrome && <BottomNav />}
    </div>
  )
}
