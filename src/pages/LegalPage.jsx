import { Link } from 'react-router-dom'

const copy = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'Midnight Anime keeps browsing open and simple. This page summarizes the information used by the app.',
    sections: [
      ['Browsing data', 'Anime titles and episode metadata are requested from AniList and TMDB to render the catalogue. The site does not require an account to browse or watch.'],
      ['Optional account data', 'If you sign in, Firebase Authentication and the app database are used for your watchlist, progress, and episode ratings.'],
      ['Third-party media', 'Playback sources are delivered by external providers. Their availability and privacy practices are outside Midnight Anime’s control.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'Use Midnight Anime responsibly and respect the rights and policies of the services that provide catalogue and playback data.',
    sections: [
      ['Availability', 'The catalogue and playback sources may change, become unavailable, or be removed without notice.'],
      ['Acceptable use', 'Do not misuse the service, attempt to bypass access controls, or use it to infringe the rights of others.'],
      ['External services', 'AniList, TMDB, Firebase, and media providers operate independently and may apply their own terms and policies.'],
    ],
  },
}

export default function LegalPage({ kind = 'privacy' }) {
  const page = copy[kind] || copy.privacy
  return (
    <main className="min-h-screen bg-[#050507] px-5 py-10 text-[#f5f0e8] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-12 inline-flex items-center gap-2.5">
          <img src="https://dipamalla.com.np/logo.svg" alt="Midnight Anime" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-[15px] font-extrabold">Midnight<span className="text-or">Anime</span></span>
        </Link>
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-or">Midnight Anime</p>
        <h1 className="font-display text-4xl font-black tracking-tight">{page.title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-white/60">{page.intro}</p>
        <div className="mt-10 space-y-4">
          {page.sections.map(([heading, text]) => (
            <section key={heading} className="rounded-2xl border border-white/[0.07] bg-[#1c1420] p-6">
              <h2 className="font-display text-lg font-bold">{heading}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">{text}</p>
            </section>
          ))}
        </div>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-or px-5 py-3 text-[13px] font-bold text-white">Back to Midnight Anime</Link>
      </div>
    </main>
  )
}
