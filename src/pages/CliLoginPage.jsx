import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { auth } from '../api/firebase'
import { useAuthStore } from '../store/authStore'

export default function CliLoginPage() {
  const [params] = useSearchParams()
  const callback = params.get('callback') || ''
  const state = params.get('state') || ''
  const { user, isLoading, signInWithGoogle } = useAuthStore()
  const [status, setStatus] = useState('waiting')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const validCallback = useMemo(() => {
    try {
      const url = new URL(callback)
      return (url.protocol === 'http:' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost') && url.pathname === '/callback')
    } catch { return false }
  }, [callback])

  useEffect(() => {
    if (!validCallback || !state || sent || !user) return
    let cancelled = false
    const authorize = async () => {
      setStatus('authorizing')
      try {
        const idToken = await auth.currentUser?.getIdToken(true)
        if (!idToken) throw new Error('Your account session could not be verified.')
        const response = await fetch(callback, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, idToken, uid: user.uid, email: user.email || null }) })
        if (!response.ok) throw new Error('The terminal callback could not be reached. Keep the CLI running and try again.')
        if (!cancelled) { setSent(true); setStatus('complete') }
      } catch (authError) { if (!cancelled) { setError(authError.message); setStatus('error') } }
    }
    authorize()
    return () => { cancelled = true }
  }, [callback, state, user, sent, validCallback])

  const invalid = !validCallback || !state
  return <div className="min-h-screen bg-[#050507] px-5 py-10 text-white sm:px-8"><div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center"><section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10"><div className="flex items-center gap-3"><img src="/midnight-anime-logo.svg" alt="Midnight Anime" className="h-11 w-11 rounded-xl" /><div><p className="font-display text-lg font-black">Midnight<span className="text-or">Anime</span></p><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">CLI authorization</p></div></div>{invalid ? <Message title="Invalid login request" text="This verification link is incomplete or is not a secure local terminal callback. Return to your terminal and run midnight-anime login again." tone="error" /> : status === 'complete' ? <><Message title="Terminal authorized" text="Your Midnight Anime account is now connected to the CLI. You can close this tab and return to your terminal." tone="success" /><Link to="/api" className="mt-6 inline-flex rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-or hover:text-or">Read API documentation</Link></> : !user ? <><Message title="Sign in to continue" text="Use your existing Midnight Anime account. The CLI never asks you to paste a password or token into the terminal." /> <button type="button" onClick={signInWithGoogle} disabled={isLoading} className="mt-6 w-full rounded-xl bg-or px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff8126] disabled:opacity-60">{isLoading ? 'Opening sign-in…' : 'Continue with Google'}</button><Link to={`/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="mt-3 block text-center text-sm text-white/45 hover:text-white">Use email and password</Link></> : status === 'error' ? <><Message title="Could not authorize terminal" text={error} tone="error" /><button type="button" onClick={() => { setError(''); setSent(false); setStatus('waiting') }} className="mt-6 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold text-white/70 hover:border-or hover:text-or">Try again</button></> : <Message title="Authorizing terminal…" text="Your account is verified. Sending a short-lived session to the terminal now." />}</section></div></div>
}

function Message({ title, text, tone }) { return <div className="mt-10"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'success' ? 'bg-emerald-400/15 text-emerald-300' : tone === 'error' ? 'bg-red-400/15 text-red-300' : 'bg-or/15 text-or'}`}><span className="font-display text-xl font-black">{tone === 'success' ? '✓' : tone === 'error' ? '!' : '·'}</span></div><h1 className="mt-5 font-display text-3xl font-black tracking-tight">{title}</h1><p className="mt-3 text-sm leading-relaxed text-white/55">{text}</p></div> }
