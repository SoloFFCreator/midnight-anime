import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PublicPageShell from '../components/PublicPageShell'
import { AniListApi, TT, largeCover } from '../api/anilist'

function formatLabel(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function UpdateCard({ anime }) {
  const navigate = useNavigate()
  const title = TT(anime)
  const image = anime.bannerImage || largeCover(anime)
  const description = String(anime.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  const detailPath = `/news/anime/${anime.id}`
  return <Link to={detailPath} onClick={(event) => { event.preventDefault(); navigate(detailPath) }} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition-transform duration-200 hover:-translate-y-1 hover:border-or/40 focus:outline-none focus:ring-2 focus:ring-or/70">
    <div className="relative aspect-[16/9] overflow-hidden bg-[#17121d]">
      {image ? <img src={image} alt={`${title} artwork`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = largeCover(anime) || '/midnight-anime-logo.svg' }} /> : <div className="flex h-full items-center justify-center"><img src="/midnight-anime-logo.svg" alt="Midnight Anime" className="h-14 w-14 rounded-2xl opacity-60" /></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09070d] via-transparent to-transparent" />
      <div className="absolute bottom-3 left-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
        {anime.format && <span className="rounded-full bg-black/60 px-2.5 py-1 text-white/75">{formatLabel(anime.format)}</span>}
        {anime.status && <span className="rounded-full bg-or/85 px-2.5 py-1 text-white">{formatLabel(anime.status)}</span>}
      </div>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <h2 className="font-display text-lg font-bold leading-tight group-hover:text-or">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/45">
        {anime.season && anime.seasonYear && <span>{formatLabel(anime.season)} {anime.seasonYear}</span>}
        {anime.averageScore > 0 && <span>• Score {anime.averageScore}%</span>}
        {anime.nextAiringEpisode?.episode && <span>• Next episode {anime.nextAiringEpisode.episode}</span>}
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/50">{description || 'Explore title details, available episodes, and related viewing information.'}</p>
      <span className="mt-5 text-xs font-bold uppercase tracking-wider text-or">Open title →</span>
    </div>
  </Link>
}

function Skeleton() {
  return <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03]"><div className="aspect-[16/9] animate-pulse bg-white/[0.08]" /><div className="space-y-3 p-5"><div className="h-5 w-3/4 animate-pulse rounded bg-white/[0.08]" /><div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" /><div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" /></div></div>
}

function SpotlightBanner({ anime }) {
  const navigate = useNavigate()
  const title = TT(anime)
  const image = anime.bannerImage || largeCover(anime)
  const detailPath = `/news/anime/${anime.id}`
  return <Link to={detailPath} onClick={(event) => { event.preventDefault(); navigate(detailPath) }} className="group relative block min-h-[260px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#17121d] focus:outline-none focus:ring-2 focus:ring-or/70 sm:min-h-[340px]">
    {image && <img src={image} alt={`${title} banner artwork`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(event) => { event.currentTarget.src = largeCover(anime) || '/midnight-anime-logo.svg' }} />}
    <div className="absolute inset-0 bg-gradient-to-r from-[#09070d] via-[#09070d]/75 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#09070d] via-transparent to-transparent" />
    <div className="relative flex min-h-[260px] max-w-xl flex-col justify-end p-6 sm:min-h-[340px] sm:p-9">
      <span className="mb-3 w-fit rounded-full bg-or/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">AniList spotlight</span>
      <h2 className="font-display text-3xl font-black leading-tight sm:text-5xl">{title}</h2>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/65">{String(anime.description || 'Explore the full title page for artwork, metadata, episodes, and related anime.').replace(/<[^>]*>/g, '')}</p>
      <span className="mt-5 inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition-colors group-hover:bg-or group-hover:text-white">View full details →</span>
    </div>
  </Link>
}

export default function NewsPage() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = async () => {
    setStatus('loading'); setError('')
    try { setItems(await AniListApi.fetchNews()); setStatus('ready') } catch (err) { setError(err.message || 'The update feed is temporarily unavailable.'); setStatus('error') }
  }
  useEffect(() => { load() }, [])

  return <PublicPageShell eyebrow="Midnight signal / Anime updates" title="What is moving in anime right now?" intro="A living snapshot of trending and recently released titles from AniList. This is an anime update feed—not a breaking-news publisher—and every card opens a dedicated feature page for that anime.">
    <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-or/20 bg-or/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div><p className="font-display font-bold">Fresh from the catalogue</p><p className="mt-1 text-sm text-white/50">Artwork, scores, genres, status, and airing signals are sourced from AniList.</p></div>
      <button onClick={load} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition-colors hover:border-or hover:text-or">Refresh updates</button>
    </div>
    {status === 'loading' && <div className="space-y-8"><div className="aspect-[16/8] animate-pulse rounded-[2rem] bg-white/[0.08]" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} />)}</div></div>}
    {status === 'error' && <div className="rounded-3xl border border-red-300/20 bg-red-300/[0.06] p-8 text-center"><h2 className="font-display text-xl font-bold">The feed needs a moment</h2><p className="mx-auto mt-3 max-w-lg text-sm text-white/55">{error} You can still browse the catalogue while we reconnect.</p><button onClick={load} className="mt-6 rounded-full bg-or px-5 py-2.5 text-sm font-bold">Try again</button></div>}
    {status === 'ready' && !items.length && <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/55">No updates are available right now. Try refreshing in a little while.</div>}
    {status === 'ready' && items.length > 0 && <div className="space-y-10"><div className="grid gap-5">{items.slice(0, 3).map((anime) => <SpotlightBanner anime={anime} key={`spotlight-${anime.id}`} />)}</div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((anime) => <UpdateCard anime={anime} key={anime.id} />)}</div></div>}
  </PublicPageShell>
}
