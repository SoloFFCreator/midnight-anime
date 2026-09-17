import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicPageShell from '../components/PublicPageShell'
import { AniListApi, TT, largeCover, totEps } from '../api/anilist'

function cleanText(value) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function label(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function NewsAnimeDetailPage() {
  const { id } = useParams()
  const [anime, setAnime] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    setStatus('loading')
    AniListApi.fetchDetail(Number(id)).then((data) => {
      if (!active) return
      setAnime(data)
      setStatus(data ? 'ready' : 'error')
    }).catch(() => active && setStatus('error'))
    return () => { active = false }
  }, [id])

  if (status === 'loading') return <PublicPageShell eyebrow="Anime update" title="Loading feature…" intro="Fetching the latest available title details from AniList."><div className="h-80 animate-pulse rounded-[2rem] bg-white/[0.08]" /></PublicPageShell>
  if (status === 'error' || !anime) return <PublicPageShell eyebrow="Anime update" title="This feature is unavailable." intro="The selected title could not be loaded right now. Return to Anime Updates and choose another title."><Link to="/news" className="inline-flex rounded-full bg-or px-5 py-3 text-sm font-bold">Back to Anime Updates</Link></PublicPageShell>

  const title = TT(anime)
  const image = anime.bannerImage || largeCover(anime)
  const synopsis = cleanText(anime.description) || 'AniList has not provided a synopsis for this title.'
  const airedEpisodes = totEps(anime)

  return <PublicPageShell eyebrow="Midnight signal / Featured title" title={title} intro="A dedicated Anime Updates feature view powered by AniList metadata. This page is for discovery context; use the catalogue detail button below for seasons, episode rows, watchlist controls, and playback actions.">
    <article className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.035]">
      <div className="relative aspect-[16/8] min-h-[260px] bg-[#17121d] sm:min-h-[390px]">
        {image && <img src={image} alt={`${title} banner artwork`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = largeCover(anime) || '/midnight-anime-logo.svg' }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0910] via-[#0b0910]/25 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2 sm:bottom-8 sm:left-8"><span className="rounded-full bg-or/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">AniList feature</span>{anime.status && <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/75">{label(anime.status)}</span>}</div>
      </div>
      <div className="p-6 sm:p-9">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/50">{anime.format && <span>{label(anime.format)}</span>}{anime.season && anime.seasonYear && <span>{label(anime.season)} {anime.seasonYear}</span>}{anime.averageScore > 0 && <span>Score {anime.averageScore}%</span>}<span>{airedEpisodes} aired episode{airedEpisodes === 1 ? '' : 's'} tracked</span></div>
        {anime.genres?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{anime.genres.map((genre) => <span key={genre} className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-white/60">{genre}</span>)}</div>}
        <h2 className="mt-8 font-display text-2xl font-bold">Why it is in Updates</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">{synopsis}</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link to={`/anime/${anime.id}`} className="rounded-full bg-or px-5 py-3 text-sm font-bold text-white">Open full anime details</Link><Link to="/news" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/75 hover:border-or hover:text-or">Back to Updates</Link></div>
      </div>
    </article>
  </PublicPageShell>
}
