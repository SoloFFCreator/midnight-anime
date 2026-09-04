import { useState } from 'react'
import { shareLink } from '../../utils/share'

export default function ShareButton({ title, text, path, compact = false }) {
  const [status, setStatus] = useState('idle')

  async function handleShare() {
    setStatus('sharing')
    const result = await shareLink({ title, text, path })
    if (result.cancelled) {
      setStatus('idle')
      return
    }
    setStatus(result.ok ? (result.method === 'native' ? 'shared' : 'copied') : 'failed')
    window.setTimeout(() => setStatus('idle'), 2200)
  }

  const label = status === 'copied' ? 'Link copied' : status === 'shared' ? 'Shared' : status === 'failed' ? 'Copy unavailable' : 'Share'

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={status === 'sharing'}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 text-t2 transition-colors hover:border-or/60 hover:text-white disabled:opacity-60 ${compact ? 'px-3 py-2 text-[11px] font-bold' : 'h-12 px-4 text-[12px] font-black'}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5" />
      </svg>
      {label}
    </button>
  )
}
