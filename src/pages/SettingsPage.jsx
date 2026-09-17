import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { usePlayerStore } from '../store/playerStore'
import { AVATAR_CHOICES } from '../utils/models'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, profile, avatarChoiceId, setAvatarChoice, sendPasswordReset, sendVerificationEmail, signOut, infoMessage, error } = useAuthStore()
  const { autoPlayNext, setAutoPlayNext } = usePlayerStore()
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const choice = AVATAR_CHOICES.find((a) => a.id === avatarChoiceId)

  return (
    <div className="pb-16">
      <h1 className="px-4 py-4 text-[20px] font-black text-white">Settings</h1>

      {/* Profile card */}
      <div className="flex items-center gap-3.5 px-4 py-4 bg-gradient-to-r from-bg2 to-bg1">
        <button
          onClick={() => user && setShowAvatarPicker(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: choice ? choice.color : '#222230' }}
        >
          {choice?.image ? <img src={choice.image} alt={`${choice.name} character avatar`} className="w-full h-full rounded-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.style.display = 'none' }} />
            : choice ? <span className="text-2xl font-light">{choice.symbol}</span>
            : profile?.photoURL ? <img src={profile.photoURL} className="w-full h-full rounded-full object-cover" alt="" />
            : <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-t3 fill-none" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-[15px] truncate">{profile?.displayName || 'Not signed in'}</p>
          <p className="text-t3 text-[12px] truncate">{profile?.email || 'Sign in to sync your watchlist'}</p>
        </div>
        <button
          onClick={() => (user ? navigate('/profile-menu') : navigate('/auth'))}
          className="border border-or text-or text-[12px] font-bold px-3.5 py-2 rounded-full"
        >
          {user ? 'My Profile' : 'Sign In'}
        </button>
      </div>

      {(infoMessage || error) && (
        <div className="px-4 py-2">
          <p className={`text-[12px] ${error ? 'text-red' : 'text-green'}`}>{error || infoMessage}</p>
        </div>
      )}

      {user && (
        <Section title="Password & Security">
          <Row icon="lock" label="Reset Password" subtitle="Sends a reset link to your email" onClick={() => sendPasswordReset(profile.email)} />
          {!profile?.isGoogleUser && (
            <Row
              icon="mail"
              label={profile?.emailVerified ? 'Email Verified' : 'Verify Email'}
              subtitle={profile?.emailVerified ? 'Your email is verified' : 'Confirm your email address'}
              trailing={profile?.emailVerified ? <span className="text-green text-[10.5px] font-black">✓ Verified</span> : null}
              onClick={profile?.emailVerified ? undefined : sendVerificationEmail}
            />
          )}
        </Section>
      )}

      <Section title="Playback">
        <Row
          icon="play"
          label="Auto-play Next"
          subtitle="Play next episode automatically"
          trailing={<Toggle checked={autoPlayNext} onChange={setAutoPlayNext} />}
          onClick={() => setAutoPlayNext(!autoPlayNext)}
        />
      </Section>

      <Section title="Account">
        <Row icon="bookmark" label="My Watchlist" onClick={() => navigate('/watchlist')} />
        {user && <Row icon="logout" label="Sign Out" labelColor="text-red" onClick={signOut} />}
      </Section>

      <Section title="About">
        <Row icon="info" label="Midnight Anime" subtitle="Version 2.0 · Free HD Streaming" />
        <Row icon="bolt" label="Powered by AniList & TMDB" subtitle="Anime and episode data via public APIs" />
      </Section>

      <AnimatePresence>
        {showAvatarPicker && (
          <AvatarPickerSheet current={avatarChoiceId} onChoose={(id) => { setAvatarChoice(id); setShowAvatarPicker(false) }} onClose={() => setShowAvatarPicker(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-4">
      <p className="px-4 pb-2 text-[10px] font-black text-t4 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

const ICONS = {
  lock: 'M4 11h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9zM7 11V7a5 5 0 0 1 10 0v4',
  mail: 'M22 6l-10 7L2 6M2 4h20v16H2z',
  play: 'M5 3l14 9-14 9V3z',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  bolt: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
}

function Row({ icon, label, subtitle, trailing, onClick, selected, labelColor = 'text-white' }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? 'cursor-pointer' : ''} ${selected ? 'bg-or/10' : ''}`}>
      <div className="w-8.5 h-8.5 w-[34px] h-[34px] rounded-[9px] bg-bg2 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" className={`w-[17px] h-[17px] fill-none ${selected ? 'stroke-or' : 'stroke-or'}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS[icon]} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-bold truncate ${selected ? 'text-or' : labelColor}`}>{label}</p>
        {subtitle && <p className="text-[11.5px] text-t3 truncate">{subtitle}</p>}
      </div>
      {trailing}
      {selected && (
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-or fill-none flex-shrink-0" strokeWidth="2.2"><path d="M20 6 9 17l-5-5" /></svg>
      )}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-or' : 'bg-bg3'}`}
    >
      <motion.div className="w-5 h-5 bg-white rounded-full absolute top-0.5" animate={{ left: checked ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  )
}

function AvatarPickerSheet({ current, onChoose, onClose }) {
  const groupedChoices = AVATAR_CHOICES.reduce((groups, avatar) => {
    const key = avatar.anime || 'Midnight originals'
    if (!groups[key]) groups[key] = []
    groups[key].push(avatar)
    return groups
  }, {})

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full sm:w-[380px] bg-[#16161e] rounded-t-2xl sm:rounded-2xl p-4 pb-8"
      >
        <p className="text-white font-bold text-[15px] mb-1">Choose Avatar</p>
        <p className="text-t3 text-[11px] mb-3">Character artwork from AniList</p>
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          {Object.entries(groupedChoices).map(([anime, choices]) => (
            <section key={anime}>
              <div className="mb-1.5 flex items-center gap-2"><h3 className="text-[10px] font-black uppercase tracking-wide text-t3">{anime}</h3><span className="h-px flex-1 bg-white/[0.08]" /></div>
              <div className="grid grid-cols-3 gap-2.5">
                {choices.map((a) => (
                  <motion.button
                    key={a.id} whileTap={{ scale: 0.92 }}
                    onClick={() => onChoose(a.id)}
                    aria-label={`Choose ${a.name} from ${anime}`}
                    className="flex flex-col items-center gap-1.5 rounded-xl py-3"
                    style={{ background: current === a.id ? `${a.color}22` : 'transparent', border: `2px solid ${current === a.id ? a.color : 'transparent'}` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-[22px]" style={{ background: a.color }}>
                      {a.image ? <img src={a.image} alt={`${a.name} character avatar`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.style.display = 'none' }} /> : <span className="font-light">{a.symbol}</span>}
                    </div>
                    <span className={`text-[10.5px] font-semibold ${current === a.id ? 'text-or' : 'text-t2'}`}>{a.name}</span>
                  </motion.button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
