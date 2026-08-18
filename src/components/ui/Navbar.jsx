import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { AVATAR_CHOICES } from '../../utils/models'

function avatarDataUri(choice) {
  if (!choice) return null
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${choice.color}"/><text x="50" y="62" font-size="46" text-anchor="middle">${choice.emoji}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, profile, avatarChoiceId } = useAuthStore()
  const choice = AVATAR_CHOICES.find((a) => a.id === avatarChoiceId)
  const avatarUrl = choice ? avatarDataUri(choice) : profile?.photoURL

  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden">
            <img src="/midnight-anime-logo.png" alt="" className="h-7 w-7 object-contain" />
          </div>
          <span className="font-display font-extrabold text-[15px]">Midnight<span className="text-or">Anime</span></span>
        </Link>

        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/search')} className="w-9 h-9 rounded-full bg-bg2 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-white/80 fill-none" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          </motion.button>

          {user ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/settings')}>
              <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-or/40" />
            </motion.button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="text-[12px] font-bold bg-bg2 text-white/80 px-3.5 py-2 rounded-full"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
