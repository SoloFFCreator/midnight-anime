import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hls from 'hls.js'
import PublicPageShell from '../components/PublicPageShell'

const BASE_URL = 'https://midnightanime.bond/api/v1'

const endpointGroups = [
  {
    label: 'Catalogue',
    description: 'Discover titles, search the library, and retrieve a complete title record.',
    endpoints: [
      { method: 'GET', path: '/catalogue?view=trending&limit=20', title: 'Browse catalogue', detail: 'Use trending, popular, seasonal, or movies as the view value. Responses include identifiers, titles, artwork, scores, status, genres, format, season, and airing signals.' },
      { method: 'GET', path: '/search?q=Frieren&page=1', title: 'Search titles', detail: 'Search by title with page and limit pagination. Search results are shaped for cards, rails, and autocomplete experiences.' },
      { method: 'GET', path: '/anime?id=21', title: 'Title detail', detail: 'Fetch description, studios, relations, recommendations, episode thumbnails, artwork, external links, and release context for one title.' },
    ],
  },
  {
    label: 'Artwork',
    description: 'Resolve polished editorial artwork and title context for custom interfaces.',
    endpoints: [
      { method: 'GET', path: '/artwork?tmdbId=94605&type=tv', title: 'Artwork metadata', detail: 'Returns poster and backdrop imagery, ratings, seasons, episode totals, dates, and external identifiers. The playground renders these visually instead of exposing image URLs.' },
    ],
  },
  {
    label: 'Playback',
    description: 'Request an available episode source and preview it inside the documentation player.',
    endpoints: [
      { method: 'GET', path: '/playback?malId=21&type=tv&audio=sub&season=1&episode=1', title: 'Episode playback', detail: 'Provide exactly one supported title identifier. TV requests require season and episode. Audio tracks support sub, dub, and hindi where available.' },
    ],
  },
]

const playgroundEndpoints = [
  { id: 'search', label: 'Search titles', path: '/search', params: [{ key: 'q', label: 'Query', value: 'Frieren' }, { key: 'page', label: 'Page', value: '1' }, { key: 'limit', label: 'Limit', value: '3' }] },
  { id: 'catalogue', label: 'Browse trending', path: '/catalogue', params: [{ key: 'view', label: 'View', value: 'trending' }, { key: 'limit', label: 'Limit', value: '3' }] },
  { id: 'artwork', label: 'Artwork preview', path: '/artwork', params: [{ key: 'tmdbId', label: 'Artwork ID', value: '94605' }, { key: 'type', label: 'Type', value: 'tv' }] },
  { id: 'anime', label: 'Title detail', path: '/anime', params: [{ key: 'id', label: 'Title ID', value: '21' }] },
  { id: 'playback', label: 'Episode player', path: '/playback', params: [{ key: 'malId', label: 'Title ID', value: '21' }, { key: 'type', label: 'Type', value: 'tv' }, { key: 'audio', label: 'Audio', value: 'sub' }, { key: 'season', label: 'Season', value: '1' }, { key: 'episode', label: 'Episode', value: '1' }] },
]

const example = [
  "const API = 'https://midnightanime.bond/api/v1'",
  '',
  'const response = await fetch(`${API}/search?q=Frieren&limit=10`)',
  'const { data } = await response.json()',
  '',
  'const firstTitle = data[0]',
  'const poster = firstTitle.coverImage.extraLarge',
  '',
  'const episode = await fetch(',
  '  `${API}/playback?malId=21&type=tv&audio=sub&season=1&episode=1`,',
  ')',
  'const { data: sources } = await episode.json()',
].join('\n')

const sdkExample = [
  "import { createMidnightAnimeClient } from 'midnight-anime-sdk'",
  '',
  'const client = createMidnightAnimeClient({ timeout: 20_000 })',
  "const { data } = await client.search('Frieren', { limit: 10 })",
  '',
  'const episode = await client.playback({',
  '  malId: 21, type: \'tv\', audio: \'sub\', season: 1, episode: 1,',
  '})',
  '',
  'try { await client.anime(21) } catch (error) {',
  '  console.log(error.code, error.status)',
  '}',
].join('\n')

const cliExample = [
  'midnight-anime login',
  '',
  'midnight-anime search "Frieren"',
  'midnight-anime catalogue trending --json',
  'midnight-anime playback 21 1 1 sub',
].join('\n')

export default function ApiPage() {
  return <PublicPageShell eyebrow="Developer documentation / v1" title="A calm, capable foundation for anime products." intro="Build discovery, title pages, artwork-led interfaces, and supported playback experiences with one consistent public API. This portal is designed to be read, tested, and implemented—not merely browsed.">
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
      <main className="min-w-0">
        <section className="relative overflow-hidden rounded-[2rem] border border-or/25 bg-gradient-to-br from-or/15 via-white/[0.035] to-fuchsia-500/10 p-6 shadow-2xl shadow-black/20 sm:p-10"><div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-or/20 blur-3xl" /><div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><span className="rounded-full border border-or/30 bg-or/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Public beta / no key required</span><h2 className="mt-5 max-w-2xl font-display text-3xl font-black tracking-tight sm:text-5xl">Documentation that gets out of the way.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">Use the request lab to validate an integration, then follow the implementation notes to build a polished client with clear states, visual media handling, and responsible playback behavior.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#playground" className="rounded-full bg-or px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8126]">Open request lab</a><button type="button" onClick={() => navigator.clipboard?.writeText(BASE_URL)} className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/75 transition hover:border-or hover:text-or">Copy base address</button></div></div><div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Base address</p><code className="mt-3 block break-all font-mono text-sm text-white/85">{BASE_URL}</code><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><DocStat value="JSON" label="Response format" /><DocStat value="v1" label="Stable path" /></div></div></div></section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3"><DocStat value="5" label="Core resources" /><DocStat value="Visual" label="Media previews" /><DocStat value="CORS" label="Browser-ready" /></section>

        <ApiPlayground />

        <section id="endpoints" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Reference" title="Resources and request shapes" text="Every response is JSON. Successful responses place the useful payload in data and context in meta. Errors use a stable error.code and error.message shape." /><div className="mt-8 space-y-12">{endpointGroups.map((group) => <div key={group.label}><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-display text-2xl font-bold">{group.label}</h3><p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/45">{group.description}</p></div><span className="font-mono text-[10px] uppercase tracking-widest text-white/30">{group.endpoints.length} resource{group.endpoints.length > 1 ? 's' : ''}</span></div><div className="grid gap-4 lg:grid-cols-2">{group.endpoints.map((endpoint, index) => <EndpointCard key={endpoint.path} endpoint={endpoint} index={index} />)}</div></div>)}</div></section>

        <section id="quickstart" className="mt-20 scroll-mt-24 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/[0.08] bg-[#0d0b12] p-5 sm:p-7"><SectionHeading eyebrow="Quick start" title="Fetch, render, continue" text="The first integration can be as small as a search request and an image card. Keep the response object intact so you can add richer title context later." /><pre className="mt-6 max-h-[460px] overflow-auto rounded-2xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-[1.8] text-white/65"><code>{example}</code></pre></div><div className="space-y-5"><InfoBlock title="Visual media first" text="Use image fields to render artwork in an image component. The request lab intentionally turns image values into visual previews so developers can evaluate the result without copying dead-looking URLs." /><InfoBlock title="Playback is conditional" text="A request can be valid while an episode has no available source. Treat an empty data array as a normal product state and show a clear retry or availability message." /><InfoBlock title="Cache thoughtfully" text="Cache catalogue and artwork responses at your edge, avoid aggressive polling, and refresh episode availability only when the user asks or when your product needs it." /></div></section>

        <section id="sdk" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Official SDK" title="Install once. Ship faster." text="The dependency-free client wraps the documented resources with typed declarations, normalized errors, timeouts, cancellation, and browser-safe defaults." /><div className="mt-8 grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><div className="rounded-3xl border border-or/25 bg-or/[0.07] p-5 sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Package</p><code className="mt-4 block rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white">npm install midnight-anime-sdk</code><p className="mt-5 text-sm leading-relaxed text-white/55">One small package for modern browsers, Node.js 18+, and server runtimes with fetch. TypeScript declarations are included—no second types package required.</p><div className="mt-5 flex flex-wrap gap-2"><a href="https://www.npmjs.com/package/midnight-anime-sdk" target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-or px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#ff8126]">Open on npm</a><a href="https://github.com/SoloFFCreator/midnight-anime/tree/main/packages/midnight-anime-sdk" target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-or hover:text-or">View source</a></div></div><div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0b12]"><div className="flex border-b border-white/[0.06] px-4 pt-4"><span className="rounded-t-lg bg-white/[0.07] px-3 py-2 font-mono text-[10px] font-bold text-or">JavaScript / TypeScript</span></div><pre className="overflow-x-auto p-5 font-mono text-[11px] leading-[1.8] text-white/70"><code>{sdkExample}</code></pre></div></div><div className="mt-5 grid gap-5 md:grid-cols-3"><InfoBlock title="Typed by default" text="Use autocomplete for title, artwork, playback parameters, response envelopes, and normalized errors." /><InfoBlock title="Own your player" text="The SDK returns availability data so your product can keep its own player, loading state, and visual identity." /><InfoBlock title="Safe requests" text="Use AbortSignal, timeouts, custom headers, and a custom fetch implementation without adding dependencies." /></div></section>

        <section id="cli" className="mt-20 scroll-mt-24"><SectionHeading eyebrow="Official terminal client" title="Test from the command line." text="The Midnight Anime CLI is built for developers who want to validate search, catalogue, title, and playback requests directly from a terminal." /><div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="rounded-3xl border border-white/[0.08] bg-[#0d0b12] p-5 sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Install</p><code className="mt-4 block rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white">npm install --global midnight-anime-cli</code><pre className="mt-5 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-[1.8] text-white/70"><code>{cliExample}</code></pre></div><div className="rounded-3xl border border-or/25 bg-or/[0.07] p-5 sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Dedicated authorization</p><h3 className="mt-3 font-display text-2xl font-black">Sign in once, test securely.</h3><p className="mt-4 text-sm leading-relaxed text-white/60">Run <code className="text-or">midnight-anime login</code>. The CLI opens the official browser login page, uses the existing Midnight Anime account, and sends a short-lived ID token back to a temporary localhost callback. Passwords and tokens are never requested in the terminal.</p><div className="mt-5 flex flex-wrap gap-2"><a href="https://www.npmjs.com/package/midnight-anime-cli" target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-or px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#ff8126]">Open on npm</a><a href="https://github.com/SoloFFCreator/midnight-anime/tree/main/packages/midnight-anime-cli" target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-or hover:text-or">View source</a></div></div></div></section>

        <DocumentationSections />
      </main>
      <aside className="hidden xl:block"><div className="sticky top-24 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="px-3 pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">On this page</p>{[['playground', 'Request lab'], ['endpoints', 'Reference'], ['quickstart', 'Quick start'], ['sdk', 'SDK client'], ['cli', 'CLI client'], ['implementation', 'Implementation'], ['policy', 'Responsible use']].map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white">{label}</a>)}</div></aside>
    </div>
  </PublicPageShell>
}

function ApiPlayground() {
  const [selectedId, setSelectedId] = useState('search')
  const [values, setValues] = useState(() => Object.fromEntries(playgroundEndpoints[0].params.map((param) => [param.key, param.value])))
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [requestUrl, setRequestUrl] = useState('')
  const endpoint = playgroundEndpoints.find((item) => item.id === selectedId) || playgroundEndpoints[0]
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://midnightanime.bond'
  const query = new URLSearchParams(Object.entries(values).filter(([, value]) => String(value).trim() !== ''))
  const url = `${base}/api/v1${endpoint.path}${query.toString() ? `?${query.toString()}` : ''}`

  const changeEndpoint = (event) => {
    const next = playgroundEndpoints.find((item) => item.id === event.target.value) || playgroundEndpoints[0]
    setSelectedId(next.id)
    setValues(Object.fromEntries(next.params.map((param) => [param.key, param.value])))
    setResult(null)
    setRequestUrl('')
  }
  const runRequest = async () => {
    setIsLoading(true)
    setResult(null)
    setRequestUrl(url)
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json', 'X-Midnight-Client': 'docs-playground' } })
      const body = await response.json().catch(() => ({ error: { message: 'The endpoint returned a non-JSON response.' } }))
      setResult({ status: response.status, ok: response.ok, body })
    } catch (error) {
      setResult({ status: 'NETWORK', ok: false, body: { error: { message: error.message || 'Network request failed.' } } })
    } finally { setIsLoading(false) }
  }
  const image = result ? findMediaValue(result.body, ['poster', 'backdrop', 'extraLarge', 'large', 'thumbnail']) : null
  const media = result ? findMediaValue(result.body, ['url']) : null
  const safeBody = result ? sanitizeResponse(result.body) : null

  return <section id="playground" className="mt-16 scroll-mt-24 rounded-[2rem] border border-or/25 bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-or/[0.07] p-5 shadow-2xl shadow-black/20 sm:p-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Interactive request lab</p><h2 className="mt-2 font-display text-3xl font-black tracking-tight">Test the contract, see the result.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">Run a real request against the current deployment. Artwork is rendered as artwork, and playable responses are handed to the branded preview player instead of being presented as raw links.</p></div><span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">Live JSON</span></div><div className="mt-7 grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><div className="rounded-2xl border border-white/[0.08] bg-black/25 p-4 sm:p-5"><label htmlFor="playground-endpoint" className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Resource</label><select id="playground-endpoint" value={selectedId} onChange={changeEndpoint} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17121d] px-3 py-3 text-sm font-bold text-white outline-none focus:border-or"><optgroup label="Midnight Anime API">{playgroundEndpoints.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup></select><div className="mt-5 space-y-3">{endpoint.params.map((param) => <label key={param.key} className="block"><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">{param.label}</span><input value={values[param.key] || ''} onChange={(event) => setValues((current) => ({ ...current, [param.key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-xs text-white outline-none transition focus:border-or" /></label>)}</div><button type="button" onClick={runRequest} disabled={isLoading} className="mt-5 w-full rounded-xl bg-or px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff8126] disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Running request…' : 'Run request'}</button></div><div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#09070d] p-4 sm:p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Request preview</p><code className="mt-2 block max-h-20 overflow-auto break-all text-[11px] leading-relaxed text-or/90">{requestUrl || url}</code>{result && <MediaResult image={image} media={media} />}{result && <div className="mt-5 flex items-center justify-between gap-3"><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">Response</p><span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${result.ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>{result.status}</span></div>}<pre className="mt-3 h-64 overflow-auto rounded-xl border border-white/[0.06] bg-black/35 p-4 font-mono text-[11px] leading-relaxed text-white/65"><code>{safeBody ? JSON.stringify(safeBody, null, 2) : '{\n  "message": "Run a request to inspect the live response."\n}'}</code></pre></div></div></section>
}

function MediaResult({ image, media }) {
  return <div className="mt-5 space-y-4">{image && <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40"><img src={image} alt="Returned artwork preview" className="max-h-56 w-full object-cover object-center" /></div>}{media && <PreviewPlayer source={media} poster={image} />}{!image && !media && <p className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/40">This response has no visual media preview.</p>}</div>
}

function PreviewPlayer({ source, poster }) {
  const videoRef = useRef(null)
  const [state, setState] = useState('ready')
  useEffect(() => {
    const video = videoRef.current
    if (!video || !source) return undefined
    setState('loading')
    let hls
    if (source.includes('.m3u8') && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true })
      hls.loadSource(source)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => setState('ready'))
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setState('unavailable') })
    } else {
      video.src = source
      setState('ready')
    }
    return () => { hls?.destroy(); video.removeAttribute('src'); video.load() }
  }, [source])
  return <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black"><video ref={videoRef} poster={poster || undefined} controls playsInline className="aspect-video w-full bg-black object-contain" onError={() => setState('unavailable')} /><div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1.5 backdrop-blur-md"><img src="/midnight-anime-logo.svg" alt="Midnight Anime" className="h-5 w-5 opacity-75 grayscale brightness-0 invert" /><span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/70">{state === 'unavailable' ? 'Preview unavailable' : state === 'loading' ? 'Loading preview' : 'Midnight player'}</span></div></div>
}

function sanitizeResponse(value, key = '') {
  if (typeof value === 'string') {
    if (/^(url|poster|backdrop|thumbnail|extraLarge|large)$/i.test(key) || /^https?:\/\//.test(value)) return '[visual preview shown above]'
    return value
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeResponse(item, key))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, sanitizeResponse(childValue, childKey)]))
  return value
}

function findMediaValue(value, keys) {
  if (!value || typeof value !== 'object') return null
  if (Array.isArray(value)) { for (const item of value) { const found = findMediaValue(item, keys); if (found) return found } return null }
  for (const [key, child] of Object.entries(value)) {
    if (keys.includes(key) && typeof child === 'string' && /^https?:\/\//.test(child)) return child
    const found = findMediaValue(child, keys)
    if (found) return found
  }
  return null
}

function DocumentationSections() {
  return <div id="implementation" className="mt-20 scroll-mt-24 space-y-5"><SectionHeading eyebrow="Implementation notes" title="From first request to production client" text="These conventions keep your integration useful on a small screen, understandable on a large one, and honest when a media source changes." /><div className="grid gap-5 md:grid-cols-2"><InfoBlock title="1. Start with discovery" text="Begin with catalogue or search. Store the title identifier returned by the response; use that identifier when opening a detail view or requesting an episode. Keep the title object in local state so the interface can render instantly while deeper context loads." /><InfoBlock title="2. Build resilient cards" text="Use the supplied cover and backdrop fields as media sources for image components, with a neutral fallback when an image is unavailable. Prefer aspect-ratio containers, object-cover, lazy loading, and readable alt text." /><InfoBlock title="3. Treat playback as availability" text="Playback is an availability request, not a promise that every title has a playable result. Render a loading state, an unavailable state, and a retry action. Do not display raw source links as the primary user experience." /><InfoBlock title="4. Keep responsive boundaries" text="Use a single-column mobile layout, a two-column tablet layout, and a wider desktop shell. Avoid fixed-width response panes: long JSON, titles, and errors should wrap or scroll inside their own regions." /></div><div id="policy" className="scroll-mt-24 rounded-3xl border border-or/25 bg-or/[0.07] p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Responsible use & enforcement</p><h2 className="mt-3 font-display text-2xl font-black">Build with permission, restraint, and attribution.</h2><div className="mt-5 space-y-4 text-sm leading-relaxed text-white/65"><p>Midnight Anime provides this public interface for legitimate integrations, personal projects, accessibility tools, discovery experiences, and products that respect the service and its users. You are responsible for the client you build, the traffic it creates, the content you display, and the jurisdictions in which you operate. Do not use the API to impersonate Midnight Anime, bypass access controls, harvest personal information, overload endpoints, interfere with playback, redistribute protected material outside permitted use, or create a service that misleads people about its relationship with Midnight Anime.</p><p>We may rate-limit, suspend, block, or remove access for abuse, automated scraping at unreasonable volume, malicious traffic, security testing without permission, copyright-infringing use, fraud, or other violations of applicable terms. Where appropriate, reports may be made to hosting providers, registrars, platforms, rights holders, or competent authorities under applicable law. We do not promise or claim automatic action by any particular government agency; official requests are handled through lawful channels and are evaluated according to the facts and the applicable process.</p><p>By using the API, you agree to keep your integration accurate, maintain a clear privacy notice where you collect user data, provide a way to contact the operator of your client, and remove or correct content when you receive a valid notice. Midnight Anime may change response fields, media availability, limits, or access policies as the service evolves. Pin your client to a documented version, handle unknown fields gracefully, and never make access to a particular title or language a contractual promise to your users.</p></div></div><div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Distribution statement</p><h2 className="mt-3 font-display text-2xl font-black">Midnight Anime Channel</h2><p className="mt-4 text-sm leading-relaxed text-white/60">All episodes and anime are distributed by Midnight Anime. Distributor is Midnight Anime Channel. Independent data, artwork, and playback partners may have their own terms and availability conditions. Your integration should preserve accurate attribution, avoid implying endorsement, and provide a clear path back to the official Midnight Anime experience.</p></div></div>
}

function EndpointCard({ endpoint, index }) {
  const [copied, setCopied] = useState(false)
  const href = `${BASE_URL}${endpoint.path}`
  const copy = async () => { try { await navigator.clipboard.writeText(href); setCopied(true); window.setTimeout(() => setCopied(false), 1600) } catch { /* clipboard may be unavailable */ } }
  return <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.28, delay: index * 0.04 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-or/30 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="rounded-md bg-emerald-400/10 px-2 py-1 font-mono text-[10px] font-black tracking-widest text-emerald-300">{endpoint.method}</span><h3 className="font-display text-lg font-bold">{endpoint.title}</h3></div><button type="button" onClick={copy} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/55 transition hover:border-or hover:text-or">{copied ? 'Copied' : 'Copy'}</button></div><code className="mt-4 block overflow-x-auto rounded-xl bg-black/35 px-3 py-3 font-mono text-[11px] leading-relaxed text-or/90">{endpoint.path}</code><p className="mt-4 text-sm leading-relaxed text-white/55">{endpoint.detail}</p></motion.article>
}

function SectionHeading({ eyebrow, title, text }) { return <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">{eyebrow}</p><h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>{text && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{text}</p>}</div> }
function DocStat({ value, label }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><p className="font-display text-lg font-black text-white">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div> }
function InfoBlock({ title, text }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p></div> }
