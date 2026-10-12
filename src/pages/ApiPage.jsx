import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicPageShell from '../components/PublicPageShell'

const BASE_URL = 'https://midnightanime.bond/api/v1'

const endpointGroups = [
  {
    label: 'Catalogue',
    description: 'Discover titles and build browse experiences from the Midnight Anime catalogue layer.',
    endpoints: [
      { method: 'GET', path: '/catalogue?view=trending&limit=20', title: 'Trending and catalogue views', detail: 'Use trending, popular, seasonal, or movies as the view value. Responses include AniList IDs, MAL IDs, title data, artwork, score, status, genres, format, season, and airing signals.' },
      { method: 'GET', path: '/search?q=Frieren&page=1', title: 'Search anime', detail: 'Search the catalogue by title. Pagination is supported with page and limit parameters.' },
      { method: 'GET', path: '/anime/:anilistId', title: 'Anime detail', detail: 'Fetch expanded title context including descriptions, studios, relations, recommendations, streaming episode thumbnails, artwork, and external IDs.' },
    ],
  },
  {
    label: 'Playback',
    description: 'Resolve a supported episode into the available language tracks returned by the stream service.',
    endpoints: [
      { method: 'GET', path: '/playback?malId=21&type=tv&audio=sub&season=1&episode=1', title: 'Episode streams', detail: 'Provide exactly one identifier: malId, tmdbId, imdbId, or anilistId. TV requests require season and episode. Audio supports sub, dub, and hindi.' },
    ],
  },
  {
    label: 'Artwork & metadata',
    description: 'Resolve TMDB artwork and editorial metadata for richer title pages and cards.',
    endpoints: [
      { method: 'GET', path: '/tmdb?tmdbId=94605&type=tv', title: 'TMDB metadata', detail: 'Resolve a TMDB record from a TMDB ID. Returns poster and backdrop URLs, ratings, seasons, episode totals, dates, and IMDb/TVDB identifiers.' },
    ],
  },
]

const example = [
  "const BASE = 'https://midnightanime.bond/api/v1'",
  '',
  'const response = await fetch(`${BASE}/search?q=Frieren&limit=10`)',
  'const { data, meta } = await response.json()',
  'console.log(data[0].title.english || data[0].title.romaji)',
  '',
  'const stream = await fetch(`${BASE}/playback?malId=21&type=tv&audio=sub&season=1&episode=1`)',
  'const { data: sources } = await stream.json()',
  '',
  'function Poster({ anime }) {',
  '  return <img src={anime.coverImage.extraLarge} alt={anime.title.romaji} />',
  '}',
].join('\n')

const playgroundEndpoints = [
  { id: 'search', label: 'Search anime', path: '/search', params: [{ key: 'q', label: 'Query', value: 'Frieren' }, { key: 'page', label: 'Page', value: '1' }, { key: 'limit', label: 'Limit', value: '3' }] },
  { id: 'catalogue', label: 'Trending catalogue', path: '/catalogue', params: [{ key: 'view', label: 'View', value: 'trending' }, { key: 'limit', label: 'Limit', value: '3' }] },
  { id: 'metadata', label: 'TMDB metadata', path: '/tmdb', params: [{ key: 'tmdbId', label: 'TMDB ID', value: '94605' }, { key: 'type', label: 'Type', value: 'tv' }] },
  { id: 'anime', label: 'Anime detail', path: '/anime/21', params: [] },
  { id: 'stream', label: 'Episode stream', path: '/playback', params: [{ key: 'malId', label: 'MAL ID', value: '21' }, { key: 'type', label: 'Type', value: 'tv' }, { key: 'audio', label: 'Audio', value: 'sub' }, { key: 'season', label: 'Season', value: '1' }, { key: 'episode', label: 'Episode', value: '1' }] },
]

function EndpointCard({ endpoint, index }) {
  const [copied, setCopied] = useState(false)
  const href = `${BASE_URL}${endpoint.path.replace(':anilistId', '21')}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch { /* Clipboard can be unavailable in embedded browsers. */ }
  }
  return <motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.28, delay: index * 0.04 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-or/30 sm:p-6">
    <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="rounded-md bg-emerald-400/10 px-2 py-1 font-mono text-[10px] font-black tracking-widest text-emerald-300">{endpoint.method}</span><h3 className="font-display text-lg font-bold">{endpoint.title}</h3></div><button type="button" onClick={copy} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/55 transition hover:border-or hover:text-or">{copied ? 'Copied' : 'Copy URL'}</button></div>
    <code className="mt-4 block overflow-x-auto rounded-xl bg-black/35 px-3 py-3 font-mono text-[11px] leading-relaxed text-or/90">{endpoint.path}</code>
    <p className="mt-4 text-sm leading-relaxed text-white/55">{endpoint.detail}</p>
  </motion.article>
}

export default function ApiPage() {
  return <PublicPageShell eyebrow="Midnight Anime API / v1" title="Build your own anime interface." intro="A single developer-friendly surface for catalogue discovery, artwork, metadata, episode context, and supported playback sources. Use it for a custom website, mobile client, media dashboard, or personal anime companion.">
    <section className="relative overflow-hidden rounded-[2rem] border border-or/25 bg-gradient-to-br from-or/15 via-white/[0.035] to-fuchsia-500/10 p-6 shadow-2xl shadow-black/20 sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-or/20 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><span className="rounded-full border border-or/30 bg-or/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Public beta</span><h2 className="mt-5 max-w-2xl font-display text-3xl font-black tracking-tight sm:text-5xl">One endpoint family. Your front end.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">Bring Midnight Anime data into your own UI without rebuilding title search, artwork mapping, episode context, or language-track selection from scratch.</p><div className="mt-7 flex flex-wrap gap-3"><a href="#endpoints" className="rounded-full bg-or px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8126]">Explore endpoints</a><button type="button" onClick={() => navigator.clipboard?.writeText(BASE_URL)} className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/75 transition hover:border-or hover:text-or">Copy base URL</button></div></div><div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Base URL</p><code className="mt-3 block break-all font-mono text-sm text-white/85">{BASE_URL}</code><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-white/[0.05] p-3"><p className="text-white/40">Format</p><p className="mt-1 font-bold text-white">JSON</p></div><div className="rounded-xl bg-white/[0.05] p-3"><p className="text-white/40">Version</p><p className="mt-1 font-bold text-white">v1</p></div></div></div></div>
    </section>

    <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat value="AniList" label="Catalogue source" /><Stat value="TMDB" label="Artwork + metadata" /><Stat value="Sub · Dub · Hindi" label="Audio tracks" /><Stat value="CORS on" label="Browser-friendly" /></section>

    <ApiPlayground />

    <section id="endpoints" className="mt-16 scroll-mt-24"><div className="mb-8 max-w-2xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Endpoint map</p><h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">Everything your client needs to start.</h2><p className="mt-3 text-sm leading-relaxed text-white/55">All endpoints return JSON with a consistent <code className="text-or">data</code> and <code className="text-or">meta</code> shape. Use the AniList ID for catalogue details and the MAL, TMDB, IMDb, or AniList ID accepted by the stream endpoint.</p></div><div className="space-y-12">{endpointGroups.map((group) => <div key={group.label}><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-display text-2xl font-bold">{group.label}</h3><p className="mt-1 text-sm text-white/45">{group.description}</p></div><span className="font-mono text-[10px] uppercase tracking-widest text-white/30">{group.endpoints.length} endpoint{group.endpoints.length > 1 ? 's' : ''}</span></div><div className="grid gap-4 lg:grid-cols-2">{group.endpoints.map((endpoint, index) => <EndpointCard key={endpoint.path} endpoint={endpoint} index={index} />)}</div></div>)}</div></section>

    <section className="mt-16 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/[0.08] bg-[#0d0b12] p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-or">Quick start</p><h2 className="mt-2 font-display text-2xl font-bold">Fetch, render, play.</h2></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 font-mono text-[10px] font-bold text-emerald-300">JavaScript</span></div><pre className="mt-6 max-h-[430px] overflow-auto rounded-2xl border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-[1.8] text-white/65"><code>{example}</code></pre></div><div className="space-y-5"><InfoBlock title="Artwork included" text="Catalogue and detail responses expose AniList cover and banner URLs, plus title, score, status, genres, season, and episode signals for building responsive cards." /><InfoBlock title="Source-aware playback" text="The stream endpoint passes through the available source response. A title or language may be unavailable, and provider headers or playback rules can vary by episode." /><InfoBlock title="Keep your client respectful" text="Cache catalogue responses, avoid aggressive polling, show source availability honestly, and link users back to Midnight Anime when appropriate." /></div></section>

    <section className="mt-12 rounded-3xl border border-or/25 bg-or/[0.07] p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Distribution notice</p><h2 className="mt-3 font-display text-2xl font-black">Midnight Anime Channel</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/65">All episodes and anime are distributed by Midnight Anime. <strong className="text-white">Distributor is Midnight Anime Channel.</strong> This API is intended for integrations that respect the availability, attribution, and usage rules of the upstream catalogue and streaming sources.</p><p className="mt-4 text-xs leading-relaxed text-white/40">AniList, TMDB, and upstream stream services are independent services. Their names and data are presented for integration context and do not imply sponsorship or endorsement.</p></section>

    <section className="mt-12 flex flex-col gap-5 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="font-display text-xl font-bold">Ready to make something?</p><p className="mt-2 text-sm text-white/50">Start with the catalogue, then add detail and playback only where your experience needs them.</p></div><Link to="/app" className="rounded-full bg-white px-5 py-3 text-center text-sm font-bold text-black transition hover:bg-or hover:text-white">Open Midnight Anime</Link></section>
  </PublicPageShell>
}

function Stat({ value, label }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><p className="font-display text-lg font-black text-white">{value}</p><p className="mt-1 text-xs text-white/40">{label}</p></div>
}

function InfoBlock({ title, text }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p></div>
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
    } finally {
      setIsLoading(false)
    }
  }

  return <section className="mt-16 rounded-[2rem] border border-or/25 bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-or/[0.07] p-5 shadow-2xl shadow-black/20 sm:p-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">Live request lab</p><h2 className="mt-2 font-display text-3xl font-black tracking-tight">Try the API in your browser.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">Choose an endpoint, adjust its query parameters, and run a real request against this deployment. No API key is required for the public beta.</p></div><span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">Live JSON</span></div><div className="mt-7 grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><div className="rounded-2xl border border-white/[0.08] bg-black/25 p-4 sm:p-5"><label htmlFor="playground-endpoint" className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Endpoint</label><select id="playground-endpoint" value={selectedId} onChange={changeEndpoint} className="mt-2 w-full rounded-xl border border-white/10 bg-[#17121d] px-3 py-3 text-sm font-bold text-white outline-none focus:border-or"><optgroup label="Midnight Anime API">{playgroundEndpoints.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup></select><div className="mt-5 space-y-3">{endpoint.params.length > 0 ? endpoint.params.map((param) => <label key={param.key} className="block"><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">{param.label}</span><input value={values[param.key] || ''} onChange={(event) => setValues((current) => ({ ...current, [param.key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-xs text-white outline-none transition focus:border-or" /></label>) : <p className="rounded-xl bg-white/[0.04] p-3 text-xs leading-relaxed text-white/45">This endpoint uses the path shown in the request preview.</p>}</div><button type="button" onClick={runRequest} disabled={isLoading} className="mt-5 w-full rounded-xl bg-or px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff8126] disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Running request…' : 'Run request'}</button></div><div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#09070d] p-4 sm:p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Request preview</p><code className="mt-2 block max-h-20 overflow-auto break-all text-[11px] leading-relaxed text-or/90">{requestUrl || url}</code><div className="mt-5 flex items-center justify-between gap-3"><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">Response</p>{result && <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${result.ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>{result.status}</span>}</div><pre className="mt-3 h-64 overflow-auto rounded-xl border border-white/[0.06] bg-black/35 p-4 font-mono text-[11px] leading-relaxed text-white/65"><code>{result ? JSON.stringify(result.body, null, 2) : '{\n  "message": "Run a request to inspect the live JSON response."\n}'}</code></pre></div></div></section>
}
