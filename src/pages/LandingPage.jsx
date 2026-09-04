import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { openMidnightAnimeApp, openWebApp } from '../utils/openApp'

const marqueeItems = ['ISEKAI', 'ACTION', 'ROMANCE', 'HORROR', 'SLICE OF LIFE', 'MECHA']

export default function LandingPage() {
  const navigate = useNavigate()
  const openApp = () => openMidnightAnimeApp(navigate)
  const openWeb = () => openWebApp(navigate)

  return (
    <div className="bg-[#050507] text-[#f5f0e8] font-body overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#050507]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/midnight-anime-logo.png" alt="Midnight Anime" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-extrabold text-[15px] tracking-tight">
              Midnight<span className="text-or">Anime</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <button
            onClick={openWeb}
            className="inline-flex items-center gap-2 bg-white text-black text-[13px] font-bold px-4 py-2.5 rounded-full hover:bg-or hover:text-white transition-colors"
          >
            Get Started
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-28 px-5 sm:px-8 overflow-hidden">
        <motion.div
          className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-or/30 blur-[120px]"
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider uppercase text-[#ffb870] bg-or/10 border border-or/20 rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb870] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ffb870]" />
            </span>
            Always free · No sign-up required to browse
          </div>

          <h1 className="font-display font-black text-[13vw] leading-[0.95] sm:text-7xl md:text-8xl tracking-tight mb-6">
            Anime doesn't
            <br />
            sleep. <span className="text-transparent bg-clip-text bg-gradient-to-r from-or to-[#ffb870]">Neither do we.</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Every episode, every season, one late-night tab. Stream in Sub, Dub, or Hindi —
            free, no subscription, no waiting for the next drop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openWeb}
              className="group inline-flex items-center gap-2 bg-or text-white font-bold text-[15px] px-8 py-4 rounded-full shadow-glow transition-all"
            >
              Get Started
              <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </motion.button>
            <a href="#features" className="inline-flex items-center gap-2 text-white/50 font-semibold text-[14px] px-6 py-4 hover:text-white transition-colors">
              See what's inside
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 mt-14 font-mono text-[11px] font-bold tracking-wide text-white/50 uppercase">
            {['Sub', 'Dub', 'हिंदी', 'HD'].map((tag, i) => (
              <span key={tag} className="flex items-center gap-3">
                <span className="border border-white/10 rounded-md px-2.5 py-1">{tag}</span>
                {i < 3 && <span className="text-white/20">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center font-mono text-[11px] tracking-[0.18em] uppercase text-white/45 mb-2">
            Powered by and trusted by
          </p>
          <p className="text-center text-white/30 text-xs mb-9">
            Built for the people shaping the future of anime and entertainment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5">
            {trustedBrands.map((brand) => <TrustedLogo key={brand.name} {...brand} />)}
          </div>
        </div>
      </section>

      {/* Genre marquee */}
      <section className="py-12 overflow-hidden border-b border-white/[0.06]">
        <motion.div className="flex whitespace-nowrap" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-4 pr-4">
              <span className="font-display font-extrabold text-3xl sm:text-4xl text-white/[0.07]">{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-or/40" />
            </span>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-lg mb-16">
            <p className="font-mono text-[11px] font-bold tracking-wider uppercase text-or mb-4">What's inside</p>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight leading-tight">
              Built like the app you'd actually keep open at 2am.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-[#1c1420] border border-white/[0.07] rounded-3xl p-7 hover:border-or/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-or/10 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-or" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{f.icon}</svg>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-[14px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 px-5 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-[11px] font-bold tracking-wider uppercase text-or mb-4 text-center">Questions</p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight text-center mb-12">Before you dive in</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-[#1c1420] border border-white/[0.07] rounded-2xl p-6 open:border-or/30">
                <summary className="flex items-center justify-between cursor-pointer font-display font-bold text-[15px] list-none">
                  {f.q}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/40 group-open:rotate-45 transition-transform flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </summary>
                <p className="text-white/50 text-[14px] leading-relaxed mt-4">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-5 sm:px-8 overflow-hidden text-center">
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-or/20 blur-[130px]"
          animate={{ opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight mb-6">It's midnight somewhere.</h2>
          <p className="text-white/50 text-base sm:text-lg mb-10">Your next episode is one tap away.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openWeb}
            className="inline-flex items-center gap-2 bg-or text-white font-bold text-[15px] px-9 py-4 rounded-full shadow-glow"
          >
            Get Started
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/midnight-anime-logo.png" alt="Midnight Anime" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold text-[14px]">Midnight<span className="text-or">Anime</span></span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-white/50">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <button onClick={openApp} className="hover:text-white transition-colors">Open App</button>
          </div>
          <p className="text-[12px] text-white/30">© 2026 Midnight Anime</p>
        </div>
      </footer>
    </div>
  )
}

function TrustedLogo({ name, asset, className = '' }) {
  return (
    <div className="group flex min-h-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-5 transition-colors hover:border-or/30 hover:bg-white/[0.05]">
      <img
        src={`/brands/${asset}.svg`}
        alt={`${name} logo`}
        className={`max-h-8 w-auto max-w-[132px] object-contain opacity-65 grayscale brightness-0 invert transition-all group-hover:opacity-100 group-hover:grayscale-0 ${className}`}
      />
    </div>
  )
}

const trustedBrands = [
  { name: 'Sony', asset: 'sony' },
  { name: 'MAPPA', asset: 'mappa', className: 'brightness-0 invert' },
  { name: 'Crunchyroll', asset: 'crunchyroll' },
  { name: 'Google', asset: 'google' },
  { name: 'Meta', asset: 'meta' },
]

const features = [
  { title: 'Sub, Dub & Hindi', desc: 'Switch audio tracks mid-episode. No re-downloading, no separate app for dub fans.', icon: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></> },
  { title: 'Continue where you left off', desc: 'Your watchlist and progress sync the moment you sign in. Pick up mid-scene, any device.', icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /> },
  { title: 'Never miss a drop', desc: 'Turn on alerts for your watchlist and get notified the moment a new episode airs.', icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></> },
  { title: "Finished a series? We've got the next one", desc: "Roll credits and we'll line up what to watch next — matched to what you just loved.", icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
  { title: 'All the seasons, one card', desc: 'No more scrolling past six copies of the same show. Seasons stack together.', icon: <><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M17 2l-5 5-5-5" /></> },
  { title: 'Ratings, out loud', desc: 'Like or dislike any episode — see what the whole community thinks in real time.', icon: <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /> },
]

const faqs = [
  { q: 'Is Midnight Anime really free?', a: 'Yes — no subscription tiers, no paywalled episodes. Sign in only if you want your watchlist and progress saved.' },
  { q: 'Do I need an account to watch?', a: 'No — browsing and watching work right away. Signing in just unlocks your watchlist, continue-watching, and episode ratings.' },
  { q: 'What languages are supported?', a: "Japanese with subtitles, English dub, and Hindi dub where available — switch any time from the player's settings." },
]
