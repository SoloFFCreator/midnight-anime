import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AniListApi, TT } from '../api/anilist'
import { buildAbsoluteShareUrl, setDocumentMeta } from '../utils/share'

export default function ShareRedirectPage({ kind }) {
  const { id, episode } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function resolveShare() {
      try {
        const anime = await AniListApi.fetchDetail(Number(id))
        if (!active) return

        const title = TT(anime)
        const episodeNumber = Number(episode || 1)
        const episodeTitle = anime.streamingEpisodes?.[episodeNumber - 1]?.title || `Episode ${episodeNumber}`
        const description = cleanDescription(anime.description) || `Watch ${title}${kind === 'episode' ? ` — ${episodeTitle}` : ''} on Midnight Anime.`
        const image = kind === 'episode'
          ? (anime.streamingEpisodes?.[episodeNumber - 1]?.thumbnail || anime.bannerImage || anime.coverImage?.extraLarge)
          : (anime.bannerImage || anime.coverImage?.extraLarge)
        const path = kind === 'episode' ? `/watch/${id}/${episodeNumber}` : `/anime/${id}`
        const cleanup = setDocumentMeta({
          title: kind === 'episode' ? `${title} — ${episodeTitle} | Midnight Anime` : `${title} | Midnight Anime`,
          description,
          image,
          url: buildAbsoluteShareUrl(window.location.pathname),
        })

        navigate(path, { replace: true })
        return cleanup
      } catch {
        if (active) setError('This share link could not load the anime right now.')
      }
    }

    resolveShare()
    return () => { active = false }
  }, [id, episode, kind, navigate])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
      {error ? (
        <>
          <p className="text-white font-bold">{error}</p>
          <button onClick={() => navigate('/app')} className="rounded-xl bg-or px-4 py-2 text-[12px] font-bold text-white">Open Midnight Anime</button>
        </>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-or border-t-transparent" />
          <p className="text-[12px] text-t2">Loading shared anime…</p>
        </>
      )}
    </div>
  )
}

function cleanDescription(value) {
  return (value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 240)
}
