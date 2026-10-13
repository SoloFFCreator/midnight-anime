import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicPageShell from '../components/PublicPageShell'

const BASE_URL = 'https://www.midnightanime.bond/api/v1'

const endpointGroups = [
  { label: 'Catalogue', description: 'Browse titles, search the library, and retrieve title records.', endpoints: [
    ['GET', '/catalogue?view=trending&limit=20', 'Browse trending, popular, seasonal, or movie collections.'],
    ['GET', '/search?q=Frieren&page=1', 'Search titles with pagination for cards, rails, and autocomplete.'],
    ['GET', '/anime?id=21', 'Retrieve one title with synopsis, artwork, relations, episodes, and release context.'],
  ] },
  { label: 'Artwork', description: 'Resolve editorial artwork and media context for custom interfaces.', endpoints: [
    ['GET', '/artwork?tmdbId=94605&type=tv', 'Return poster, backdrop, ratings, seasons, dates, and supported identifiers.'],
  ] },
  { label: 'Playback', description: 'Request supported episode availability for your own player experience.', endpoints: [
    ['GET', '/playback?malId=21&type=tv&audio=sub&season=1&episode=1', 'Request a sub, dub, or hindi episode source when availability permits.'],
  ] },
]

const requestExample = `const API = 'https://www.midnightanime.bond/api/v1'
const API_KEY = process.env.MIDNIGHT_ANIME_API_KEY

const response = await fetch(
  \`${'${API}'}/search?q=Frieren&limit=10\`,
  {
    headers: {
      'X-API-Key': API_KEY,
      // Browser requests must come from your registered website origin.
    },
  },
)

const { data, meta } = await response.json()`

const sdkExample = `import { createMidnightAnimeClient } from 'midnight-anime-sdk'

const client = createMidnightAnimeClient({
  token: process.env.MIDNIGHT_ANIME_API_KEY,
})

const { data } = await client.search('Frieren', { limit: 10 })`

export default function ApiPage() {
  return <PublicPageShell eyebrow="Developer platform / API v1" title="A dependable API for anime products." intro="Build discovery, title pages, artwork-led interfaces, and supported playback experiences with one consistent public API. An API key is required for every versioned request.">
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <main className="min-w-0">
        <section className="relative overflow-hidden rounded-[2rem] border border-or/25 bg-gradient-to-br from-or/15 via-white/[0.035] to-fuchsia-500/10 p-6 shadow-2xl shadow-black/20 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-or/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Key required / origin protected</span><h2 className="mt-5 max-w-2xl font-display text-3xl font-black tracking-tight sm:text-5xl">Start with a credential you control.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">Create one API key for your account, register the website where it will run, and keep the credential in your server environment. The API rejects requests without a valid key.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/api/keys" className="rounded-full bg-or px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8126]">Get your API key</Link><a href="#quickstart" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/75 transition hover:border-or hover:text-or">Read quick start</a></div></div><div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Base address</p><code className="mt-3 block break-all font-mono text-sm text-white/85">{BASE_URL}</code><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><DocStat value="API key" label="Required access" /><DocStat value="v1" label="Stable path" /></div></div></div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3"><DocStat value="1" label="Key per account" /><DocStat value="Origin" label="Website restriction" /><DocStat value="JSON" label="Response format" /></section>

        <section id="access" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Access model" title="A small setup before your first request." text="The key flow is intentionally simple: sign in, explain where the integration will run, register one website origin, and keep the returned credential private." /><div className="mt-8 grid gap-5 md:grid-cols-3"><Step number="01" title="Sign in" text="Use your Midnight Anime account so the credential has an owner and can be managed without sharing passwords." /><Step number="02" title="Register origin" text="Enter your exact production origin, such as https://yourwebsite.com. Localhost is supported for development." /><Step number="03" title="Send the key" text="Include X-API-Key on every request. Browser requests must come from the registered origin." /></div></section>

        <section id="quickstart" className="mt-20 scroll-mt-24 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/[0.08] bg-[#0d0b12] p-5 sm:p-7"><SectionHeading eyebrow="Quick start" title="Authenticate every request." text="Never put the key in a public repository or expose it in client-side source when a server-side proxy is possible." /><pre className="mt-6 overflow-auto rounded-2xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-[1.8] text-white/70"><code>{requestExample}</code></pre><Link to="/api/keys" className="mt-5 inline-flex rounded-full bg-or px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#ff8126]">Get a key to try this</Link></div><div className="space-y-5"><InfoBlock title="Missing key" text="Requests without X-API-Key receive API_KEY_REQUIRED. Add the credential before retrying." /><InfoBlock title="Wrong website" text="When the request origin does not match the registered origin, the API returns API_KEY_ORIGIN_MISMATCH." /><InfoBlock title="One account, one key" text="A second key is not issued. Keep the original origin stable or contact the service operator if your integration ownership changes." /></div></section>

        <section id="endpoints" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Reference" title="Resources and request shapes" text="Every response is JSON. Successful responses place the useful payload in data and context in meta. Errors use a stable error.code and error.message shape." /><div className="mt-8 space-y-12">{endpointGroups.map((group) => <div key={group.label}><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-display text-2xl font-bold">{group.label}</h3><p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">{group.description}</p></div><span className="font-mono text-[10px] uppercase tracking-widest text-white/30">{group.endpoints.length} resources</span></div><div className="grid gap-4 lg:grid-cols-2">{group.endpoints.map(([method, path, detail], index) => <EndpointCard key={path} method={method} path={path} detail={detail} index={index} />)}</div></div>)}</div></section>

        <section id="sdk" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Official SDK" title="Install once. Ship faster." text="The dependency-free client wraps the documented resources with normalized errors, timeouts, cancellation, and browser-safe defaults. Pass your API key as the client token." /><div className="mt-8 rounded-3xl border border-or/25 bg-or/[0.07] p-5 sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Install</p><code className="mt-4 block rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white">npm install midnight-anime-sdk</code><pre className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/40 p-5 font-mono text-[11px] leading-[1.8] text-white/70"><code>{sdkExample}</code></pre><p className="mt-4 text-xs leading-relaxed text-white/40">Keep the key in an environment variable. For browser-only apps, route requests through your own backend so the credential is not exposed in shipped JavaScript.</p></div></section>

        <section id="cli" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Terminal client" title="Use the same key policy in development." text="The CLI remains useful for endpoint inspection, but API requests now require an API key. Set MIDNIGHT_ANIME_API_KEY in your terminal environment before running a request." /><div className="mt-8 rounded-3xl border border-white/[0.08] bg-[#0d0b12] p-5 sm:p-7"><pre className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-[1.8] text-white/70"><code>{`npm install --global midnight-anime-cli\nmidnight-anime login\nexport MIDNIGHT_ANIME_API_KEY="ma_live_…"\nmidnight-anime search "Frieren"`}</code></pre><Link to="/api/keys" className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/75 transition hover:border-or hover:text-or">Create a developer key</Link></div></section>

        <DocumentationSections />
      </main>
      <aside className="hidden xl:block"><div className="sticky top-24 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="px-3 pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">On this page</p>{[['access', 'Access model'], ['quickstart', 'Quick start'], ['endpoints', 'Reference'], ['sdk', 'SDK client'], ['cli', 'CLI client'], ['implementation', 'Implementation'], ['policy', 'Responsible use']].map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white">{label}</a>)}</div></aside>
    </div>
  </PublicPageShell>
}

function DocumentationSections() { return <section id="implementation" className="mt-20 scroll-mt-24 space-y-5"><SectionHeading eyebrow="Implementation notes" title="Make the integration feel native." text="These conventions keep your integration useful on a small screen, understandable on a large one, and honest when media availability changes." /><div className="grid gap-5 md:grid-cols-2"><InfoBlock title="Build resilient cards" text="Use supplied artwork fields with aspect-ratio containers, lazy loading, readable alt text, and a neutral fallback when media is unavailable." /><InfoBlock title="Treat playback as availability" text="A valid request can return an empty data array. Render loading, unavailable, and retry states rather than promising that every episode will play." /><InfoBlock title="Cache thoughtfully" text="Cache catalogue and artwork responses at your edge, avoid aggressive polling, and refresh episode availability only when your product needs it." /><InfoBlock title="Protect your credential" text="Keep keys server-side where possible, redact them from logs, and never ask your users to paste a developer key into a public form." /></div><div id="policy" className="scroll-mt-24 rounded-3xl border border-or/25 bg-or/[0.07] p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Responsible use & enforcement</p><h2 className="mt-3 font-display text-2xl font-black">Build with permission, restraint, and attribution.</h2><div className="mt-5 space-y-4 text-sm leading-relaxed text-white/65"><p>Midnight Anime provides this public interface for legitimate integrations, personal projects, accessibility tools, discovery experiences, and products that respect the service and its users. You are responsible for the client you build, the traffic it creates, the content you display, and the jurisdictions in which you operate.</p><p>Do not use the API to impersonate Midnight Anime, bypass access controls, harvest personal information, overload endpoints, interfere with playback, redistribute protected material outside permitted use, or create a service that misleads people about its relationship with Midnight Anime. We may rate-limit, suspend, block, or remove access for abuse, malicious traffic, fraud, or other violations of applicable terms.</p><p>By using the API, you agree to keep your integration accurate, maintain a clear privacy notice where you collect user data, provide a way to contact the operator of your client, and handle changing response fields and media availability gracefully.</p></div></div><div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Distribution statement</p><h2 className="mt-3 font-display text-2xl font-black">Midnight Anime Channel</h2><p className="mt-4 text-sm leading-relaxed text-white/60">All episodes and anime are distributed by Midnight Anime. Distributor is Midnight Anime Channel. Independent data, artwork, and playback partners may have their own terms and availability conditions.</p></div></section> }
function EndpointCard({ method, path, detail, index }) { return <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.28, delay: index * 0.04 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-or/30 sm:p-6"><div className="flex items-start gap-3"><span className="rounded-md bg-emerald-400/10 px-2 py-1 font-mono text-[10px] font-black tracking-widest text-emerald-300">{method}</span><h3 className="font-display text-lg font-bold">{path.split('?')[0]}</h3></div><code className="mt-4 block overflow-x-auto rounded-xl bg-black/35 px-3 py-3 font-mono text-[11px] leading-relaxed text-or/90">{path}</code><p className="mt-4 text-sm leading-relaxed text-white/55">{detail}</p></motion.article> }
function SectionHeading({ eyebrow, title, text }) { return <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">{eyebrow}</p><h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>{text && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{text}</p>}</div> }
function DocStat({ value, label }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><p className="font-display text-lg font-black text-white">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div> }
function InfoBlock({ title, text }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p></div> }
function Step({ number, title, text }) { return <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5"><span className="font-mono text-xs font-bold tracking-[0.2em] text-or">{number}</span><h3 className="mt-5 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p></article> }
