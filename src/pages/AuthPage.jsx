import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const { user, isLoading, error, infoMessage, signIn, signUp, signInWithGoogle, sendPasswordReset, clearMessages } = useAuthStore()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) { clearMessages(); navigate(-1) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function submit() {
    if (tab === 'signin') signIn(email, password)
    else signUp(email, password)
  }

  return (
    <div className="min-h-screen px-6 py-6 pb-16">
      <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-bg2 flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-white fill-none" strokeWidth="2.2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>

      <p className="text-t3 text-[14px]">Welcome to</p>
      <h1 className="text-[28px] font-black text-white mb-6">Midnight Anime</h1>

      <div className="flex bg-bg2 rounded-full p-0.5 mb-5">
        <button onClick={() => setTab('signin')} className={`flex-1 py-2.5 rounded-full text-[13px] font-bold ${tab === 'signin' ? 'bg-or text-white' : 'text-t3'}`}>Sign In</button>
        <button onClick={() => setTab('signup')} className={`flex-1 py-2.5 rounded-full text-[13px] font-bold ${tab === 'signup' ? 'bg-or text-white' : 'text-t3'}`}>Sign Up</button>
      </div>

      <div className="space-y-3">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="w-full bg-bg2 rounded-xl px-4 py-3.5 text-white text-[14px] outline-none border border-transparent focus:border-or/50"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full bg-bg2 rounded-xl px-4 py-3.5 text-white text-[14px] outline-none border border-transparent focus:border-or/50 pr-11"
          />
          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-t3">
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {tab === 'signin' && (
        <div className="text-right mt-1.5">
          <button onClick={() => sendPasswordReset(email)} className="text-or text-[12px] font-bold">Forgot password?</button>
        </div>
      )}

      {error && <p className="text-red text-[12px] mt-3">{error}</p>}
      {infoMessage && <p className="text-green text-[12px] mt-3">{infoMessage}</p>}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={submit}
        disabled={isLoading || !email || !password}
        className="w-full h-[50px] bg-or rounded-xl font-black text-white text-[14px] mt-5 disabled:opacity-50 flex items-center justify-center"
      >
        {isLoading ? (
          <motion.div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
        ) : tab === 'signin' ? 'Sign In' : 'Create Account'}
      </motion.button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-t4 text-[11px]">OR</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button onClick={signInWithGoogle} className="w-full h-[50px] border border-white/15 rounded-xl font-bold text-white text-[14px] flex items-center justify-center gap-2">
        <span className="text-[#4285F4] font-black text-lg">G</span>
        Continue with Google
      </button>
    </div>
  )
}
