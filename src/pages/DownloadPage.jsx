import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ANDROID_PACKAGE, APK_DOWNLOAD_URL, openMidnightAnimeApp } from '../utils/openApp'

const installSteps = [
  ['01', 'Download the APK', 'Tap the download button and let the Android package finish downloading.'],
  ['02', 'Allow the install', 'If Android asks, allow your browser to install apps from this source.'],
  ['03', 'Open Midnight Anime', 'Tap Install, then launch the app and start building your watchlist.'],
]

const mobileFeatures = [
  { label: 'Take your watchlist with you', detail: 'Pick up from the same episode across the web and Android app.', icon: 'bookmark' },
  { label: 'Download episodes for later', detail: 'Save supported anime episodes for offline viewing when you are away from a connection.', icon: 'download' },
  { label: 'Sub, Dub & Hindi', detail: 'Switch between available audio tracks without leaving the episode.', icon: 'captions' },
  { label: 'Phone, TV & Android TV', detail: 'Use the free Midnight Anime experience on mobile, television, and Android TV where the device supports the APK.', icon: 'tv' },
]

const screenshots = [
  ['img-1788361819829-s5qzr.jpg', 'Midnight Anime home screen'],
  ['img-1788361819852-jldqs.jpg', 'Anime discovery screen'],
  ['img-1788361819756-ic2py.jpg', 'Anime details screen'],
  ['img-1788361819801-sbxt6.jpg', 'Episode browsing screen'],
  ['img-1788361819864-x9aht.jpg', 'Watchlist screen'],
  ['img-1788361819887-o8t0d.jpg', 'Video player screen'],
]

export default function DownloadPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cameFromIntent = Boolean(location.state?.fromAppIntent)

  const openApp = () => openMidnightAnimeApp(navigate)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07060b] text-[#f5f0e8] font-body">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <motion.div className="absolute -left-40 top-12 h-[28rem] w-[28rem] rounded-full bg-or/20 blur-[120px]" animate={{ x: [0, 24, 0], y: [0, -18, 0], opacity: [0.55, 0.8, 0.55] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -right-40 top-[32rem] h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-[130px]" animate={{ x: [0, -30, 0], opacity: [0.45, 0.75, 0.45] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:52px_52px]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.08] bg-[#07060b]/55 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Midnight Anime home">
            <img src="/midnight-anime-logo.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-[15px] font-extrabold tracking-tight">Midnight<span className="text-or">Anime</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/app" className="hidden text-[13px] font-semibold text-white/55 transition-colors hover:text-white sm:block">Browse catalogue</Link>
            <button type="button" onClick={openApp} className="rounded-full border border-white/15 bg-white/[0.07] px-4 py-2.5 text-[13px] font-bold text-white backdrop-blur-xl transition hover:border-or/50 hover:bg-or/15">Open App</button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-or/25 bg-or/10 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb870]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffb870] shadow-[0_0_12px_#ffb870]" /> Android edition
            </p>
            <h1 className="max-w-2xl font-display text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl">Your anime shelf.<br /><span className="bg-gradient-to-r from-or via-[#ffb870] to-white bg-clip-text text-transparent">Always with you.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/58 sm:text-lg">Bring Midnight Anime to your phone for a faster, more focused way to discover, watch, and keep up with the shows you love.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.a href={APK_DOWNLOAD_URL} download whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-or px-6 py-4 text-[14px] font-black text-white shadow-[0_15px_50px_rgba(244,117,33,.22)] transition hover:bg-or2">
                <Icon name="download" className="h-5 w-5" /> Download APK
              </motion.a>
              <motion.button type="button" onClick={openApp} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 text-[14px] font-black text-white/85 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.1]">
                <Icon name="launch" className="h-5 w-5" /> Open App
              </motion.button>
            </div>
            <p className="mt-4 text-[11px] text-white/35">Android 8.0+ · Direct APK · Package {ANDROID_PACKAGE}</p>
            {cameFromIntent && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 inline-flex rounded-xl border border-or/20 bg-or/10 px-3 py-2 text-[12px] text-[#ffc38b]">The app did not open, so you landed here to download it.</motion.p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative mx-auto w-full max-w-[31rem]">
            <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-or/25 via-fuchsia-500/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/[0.075] p-3 shadow-2xl backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#25192a] via-[#111118] to-[#09090d] p-6 sm:p-8">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/40"><span>Midnight Anime</span><span className="rounded-full bg-green/15 px-2 py-1 text-green">Ready</span></div>
                <div className="mt-12 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-or/15 ring-1 ring-or/30"><img src="/midnight-anime-logo.svg" alt="" className="h-11 w-11 rounded-xl" /></div><div><p className="font-display text-xl font-black">Watch anywhere</p><p className="mt-1 text-[12px] text-white/45">One tap from browse to play</p></div></div>
                <div className="mt-10 grid grid-cols-2 gap-3">{['Watchlist sync', 'Episode downloads', 'Sub · Dub · Hindi', 'Mobile-first player'].map((item, index) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3"><span className="text-lg text-or">{['↺', '↓', '◉', '▣'][index]}</span><p className="mt-2 text-[11px] font-bold text-white/70">{item}</p></div>)}</div>
                <div className="mt-6 rounded-2xl border border-or/20 bg-gradient-to-r from-or/15 to-transparent p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold text-white/65">Your next episode</span><span className="text-[10px] text-or">Continue</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-or" /></div></div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mobileFeatures.map((feature, index) => <motion.article key={feature.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.35, delay: index * 0.06 }} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-or/30 hover:bg-white/[0.08]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-or/12 text-or"><Icon name={feature.icon} className="h-5 w-5" /></div><h2 className="mt-5 font-display text-[15px] font-bold">{feature.label}</h2><p className="mt-2 text-[12px] leading-relaxed text-white/48">{feature.detail}</p></motion.article>)}
        </section>

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Inside the app</p><h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">A closer look at Midnight Anime.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">These screens show the free Android experience across discovery, details, watchlists, and playback. The same app can be used on compatible TV and Android TV devices.</p></div><span className="rounded-full border border-green/20 bg-green/10 px-3 py-1.5 text-[10px] font-bold text-green">Free to use</span></div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{screenshots.map(([file, alt], index) => <motion.figure key={file} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.3, delay: index * 0.05 }} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25"><img src={`/download/screenshots/${file}`} alt={alt} loading="lazy" className="aspect-[460/1024] w-full object-cover transition duration-500 group-hover:scale-105" /><figcaption className="px-2.5 py-2 text-[10px] font-semibold text-white/45">{index + 1}. {alt}</figcaption></motion.figure>)}</div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-or/20 bg-gradient-to-br from-or/15 via-white/[0.045] to-fuchsia-500/10 p-7 sm:p-9"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">One clean install</p><h2 className="mt-4 font-display text-3xl font-black tracking-tight sm:text-4xl">No store detour. Just the app.</h2><p className="mt-4 text-sm leading-relaxed text-white/55">Download the official release package directly from the Midnight Anime GitHub release. Android may ask for one permission before the first install.</p><a href={APK_DOWNLOAD_URL} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-or">Get the latest APK <Icon name="arrow" className="h-4 w-4" /></a></div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 backdrop-blur-xl sm:p-9"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Install guide</p><h2 className="mt-3 font-display text-2xl font-black">From download to first episode.</h2></div><span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/40 sm:block">About 2 minutes</span></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{installSteps.map(([number, title, detail]) => <div key={number} className="relative"><span className="font-mono text-[11px] font-bold text-or">{number}</span><h3 className="mt-3 text-[13px] font-bold">{title}</h3><p className="mt-2 text-[12px] leading-relaxed text-white/45">{detail}</p></div>)}</div></div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-8 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="flex items-center gap-2 font-display font-bold text-white/75"><img src="/midnight-anime-logo.svg" alt="" className="h-7 w-7 rounded-lg" />Midnight<span className="text-or">Anime</span></Link><div className="flex gap-5"><Link to="/news" className="transition hover:text-white">Updates</Link><Link to="/about" className="transition hover:text-white">About</Link><Link to="/privacy" className="transition hover:text-white">Privacy</Link></div><span>© Midnight Anime, LLC</span></div></footer>
    </div>
  )
}

function Icon({ name, className = '' }) {
  const common = { viewBox: '0 0 24 24', className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    launch: <><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-3-6 3z" />,
    captions: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h3M14 10h3M7 14h2M12 14h5" /></>,
    phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
    tv: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4M8 2l4 3 4-3" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}
