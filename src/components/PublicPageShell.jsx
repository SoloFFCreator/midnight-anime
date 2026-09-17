import { Link } from 'react-router-dom'

const links = [
  { to: '/news', label: 'Anime Updates' },
  { to: '/wiki', label: 'Wiki' },
  { to: '/about', label: 'About' },
]

export default function PublicPageShell({ eyebrow, title, intro, children }) {
  return (
    <div className="min-h-screen bg-[#07060b] text-[#f5f0e8] font-body overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/4 h-[34rem] w-[34rem] rounded-full bg-or/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-48 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07060b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Midnight Anime home">
            <img src="/midnight-anime-logo.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-[15px] font-extrabold tracking-tight">Midnight<span className="text-or">Anime</span></span>
          </Link>
          <nav aria-label="Information pages" className="hidden items-center gap-7 text-[13px] font-medium text-white/55 md:flex">
            {links.map((link) => <Link key={link.to} to={link.to} className="transition-colors hover:text-white">{link.label}</Link>)}
          </nav>
          <Link to="/app" className="rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-or hover:text-white">Open catalogue</Link>
        </div>
        <nav aria-label="Mobile information pages" className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-5 pb-3 text-xs text-white/55 md:hidden">
          {links.map((link) => <Link key={link.to} to={link.to} className="whitespace-nowrap transition-colors hover:text-white">{link.label}</Link>)}
        </nav>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-or">{eyebrow}</p>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{intro}</p>
        </div>
        <div className="mt-14">{children}</div>
      </main>

      <footer className="relative border-t border-white/[0.08] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-white/80"><img src="/midnight-anime-logo.png" alt="" className="h-7 w-7 rounded-lg" />Midnight<span className="text-or">Anime</span></Link>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/app" className="hover:text-white">Catalogue</Link>
            <Link to="/download" className="hover:text-white">Download</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
          <span>© 2026 Midnight Anime</span>
        </div>
      </footer>
    </div>
  )
}

export function InfoCard({ icon, title, children }) {
  return <article className="group rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 transition-transform duration-200 hover:-translate-y-1 hover:border-or/30 hover:bg-white/[0.055] sm:p-7">
    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-or/10 text-or">{icon}</div>
    <h2 className="font-display text-lg font-bold">{title}</h2>
    <div className="mt-3 text-sm leading-relaxed text-white/55">{children}</div>
  </article>
}

export function ArrowIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}
