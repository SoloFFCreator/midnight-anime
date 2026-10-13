import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicPageShell from '../components/PublicPageShell'
import { useAuthStore } from '../store/authStore'

const API_KEY_URL = '/api/keys'

function Icon({ name }) {
  const paths = {
    key: <><circle cx="7.5" cy="15.5" r="3.5" /><path d="m10.5 13 8-8m-2 0 2 2m-5-1 2 2" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.4 2.9 8.3 7 10 4.1-1.7 7-5.6 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.2 2.4 3.2 5.2 3.2 8.5s-1 6.1-3.2 8.5c-2.2-2.4-3.2-5.2-3.2-8.5S9.8 5.9 12 3.5Z" /></>,
    copy: <><rect x="8" y="8" width="10" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function ApiKeyPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [origin, setOrigin] = useState('')
  const [purpose, setPurpose] = useState('')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) { setChecking(false); return }
      setChecking(true)
      try {
        const token = await user.getIdToken()
        const response = await fetch(API_KEY_URL, { headers: { Authorization: `Bearer ${token}` } })
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.error?.message || 'Could not load your API key.')
        if (active && body.data) { setRecord(body.data); setOrigin(body.data.origin) }
      } catch (e) { if (active) setError(e.message) }
      finally { if (active) setChecking(false) }
    }
    load()
    return () => { active = false }
  }, [user])

  async function createKey(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const response = await fetch(API_KEY_URL, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ origin, purpose }) })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error?.message || 'Could not create your API key.')
      setRecord(body.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function copyKey() {
    if (!record?.key) return
    try { await navigator.clipboard.writeText(record.key); setCopied(true); window.setTimeout(() => setCopied(false), 1600) } catch { setError('Copy was blocked by your browser. Select the key and copy it manually.') }
  }

  return <PublicPageShell eyebrow="Developer access / API keys" title="One key. One website. A clearer integration boundary." intro="Create a Midnight Anime API key for your own website. Every account receives one key, and every request is checked against the website origin you register here.">
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <section className="relative overflow-hidden rounded-[2rem] border border-or/25 bg-gradient-to-br from-or/15 via-white/[0.04] to-fuchsia-500/10 p-6 shadow-2xl shadow-black/20 sm:p-9">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-or/20 blur-[90px]" />
        <div className="relative">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-or/15 text-or"><Icon name="key" /></span><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Developer credential</p><p className="mt-1 text-xs text-white/45">Required for every v1 request</p></div></div>
          {!user ? <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl"><h2 className="font-display text-2xl font-black">Sign in to continue</h2><p className="mt-3 text-sm leading-relaxed text-white/55">API keys are connected to your Midnight Anime account so you can manage one credential without putting account passwords in code.</p><Link to="/auth" state={{ from: '/api/keys' }} className="mt-6 inline-flex rounded-full bg-or px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff8126]">Sign in to get a key</Link></div> : checking ? <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6 text-sm text-white/55">Checking your developer access…</div> : record ? <div className="mt-8 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-6 backdrop-blur-xl"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Active API key</p><h2 className="mt-2 font-display text-2xl font-black">Your integration is ready.</h2></div><span className="rounded-full bg-emerald-300/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">{record.status}</span></div><p className="mt-3 text-sm text-white/55">Restricted origin: <code className="text-white/85">{record.origin}</code></p><div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 p-3"><code className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-or">{record.key}</code><button type="button" onClick={copyKey} className="shrink-0 rounded-xl border border-white/10 p-2.5 text-white/60 transition hover:border-or hover:text-or" aria-label="Copy API key"><Icon name="copy" /></button></div><p className="mt-3 text-xs text-white/35">Keep this credential private. Do not commit it to a public repository.</p><Link to="/api" className="mt-6 inline-flex rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/75 transition hover:border-or hover:text-or">Read API documentation</Link>{copied && <span className="ml-3 text-xs font-bold text-emerald-300">Copied</span>}</div> : <form onSubmit={createKey} className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl sm:p-7"><h2 className="font-display text-2xl font-black">Tell us where it will run.</h2><p className="mt-3 text-sm leading-relaxed text-white/55">Register the origin of your website. Browser requests must come from this exact origin, including the protocol and port when applicable.</p><label className="mt-6 block"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Why do you need the API?</span><textarea required minLength={10} maxLength={500} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Tell us about your project or integration" className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-or" /><span className="mt-2 block text-xs text-white/35">A short, honest description helps us understand the integration.</span></label><label className="mt-5 block"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Website origin</span><input required value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="https://yourwebsite.com" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 font-mono text-sm text-white outline-none transition placeholder:text-white/25 focus:border-or" /><span className="mt-2 block text-xs text-white/35">Use https:// for production. Localhost is allowed for development.</span></label><button type="submit" disabled={loading || !origin.trim() || purpose.trim().length < 10} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-or px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#ff8126] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Creating secure key…' : 'Create my API key'}</button></form>}
          {error && <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</p>}
        </div>
      </section>
      <aside className="space-y-4">
        <Feature icon="shield" title="Origin-bound by design" text="The key is accepted only when the request origin matches the website you register. This helps prevent casual reuse on another domain." />
        <Feature icon="key" title="One key per account" text="We issue one active credential per Midnight Anime account. Keep it stable in your server environment and rotate responsibly if access is compromised." />
        <Feature icon="globe" title="Made for real products" text="Use the key with catalogue, search, title, artwork, and playback resources while following the responsible-use policy in the documentation." />
      </aside>
    </div>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6"><p className="max-w-2xl text-sm leading-relaxed text-white/50">Your registered website address is used for access control. Do not use an API key as a substitute for end-user authentication in your own application.</p><Link to="/api" className="font-bold text-or transition hover:text-white">View integration guide →</Link></div>
  </PublicPageShell>
}

function Feature({ icon, title, text }) { return <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-or/30"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-or/10 text-or"><Icon name={icon} /></div><h3 className="mt-5 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p></article> }
