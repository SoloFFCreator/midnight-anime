const ANILIST_URL = 'https://graphql.anilist.co'

const F_FRAGMENT = `
  fragment F on Media {
    id idMal title{romaji english} coverImage{large extraLarge color}
    bannerImage episodes status averageScore genres format season seasonYear
    nextAiringEpisode{episode}
  }
`

const Q_HOME = `
  query {
    trending: Page(page:1,perPage:20){media(type:ANIME,sort:TRENDING_DESC,status_not:NOT_YET_RELEASED,isAdult:false){...F}}
    popular:  Page(page:1,perPage:20){media(type:ANIME,sort:POPULARITY_DESC,isAdult:false){...F}}
    latest:   Page(page:1,perPage:20){media(type:ANIME,sort:UPDATED_AT_DESC,status:RELEASING,isAdult:false){...F}}
    seasonal: Page(page:1,perPage:16){media(type:ANIME,sort:SCORE_DESC,season:WINTER,seasonYear:2026,isAdult:false){...F}}
  }
  ${F_FRAGMENT}
`

const Q_DETAIL = `
  query($id:Int){Media(id:$id,type:ANIME){
    id idMal episodes status title{romaji english native}
    nextAiringEpisode{episode}
    streamingEpisodes{title thumbnail}
    externalLinks{url site}
    coverImage{large extraLarge color} bannerImage
    averageScore genres description(asHtml:false)
    season seasonYear format duration
    studios{nodes{name}}
    relations{edges{relationType(version:2) node{
      id idMal title{romaji english} coverImage{large extraLarge}
      format type episodes season seasonYear status averageScore
    }}}
    recommendations(perPage:8){nodes{mediaRecommendation{
      id idMal title{romaji} coverImage{large} averageScore format genres
    }}}
  }}
`

const Q_SEARCH = `
  query($s:String,$page:Int){
    Page(page:$page,perPage:30){
      pageInfo{hasNextPage}
      media(type:ANIME,search:$s,sort:POPULARITY_DESC,isAdult:false){
        id idMal title{romaji english} coverImage{large extraLarge color}
        episodes status averageScore genres format season seasonYear
        nextAiringEpisode{episode}
        relations{edges{relationType(version:2) node{id type format}}}
      }
    }
  }
`

const Q_GENRE = `
  query($genre:String,$page:Int){
    Page(page:$page,perPage:30){
      pageInfo{hasNextPage}
      media(type:ANIME,genre:$genre,sort:POPULARITY_DESC,isAdult:false){
        id idMal title{romaji english} coverImage{large extraLarge color}
        episodes status averageScore genres format season seasonYear
        nextAiringEpisode{episode}
      }
    }
  }
`

async function query(queryStr, variables = {}) {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: queryStr, variables }),
  })
  if (!res.ok) throw new Error(`AniList error ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'AniList query failed')
  return json.data
}

const isAdult = (a) => (a.genres || []).some((g) => /hentai|pornography/i.test(g))

export const AniListApi = {
  async fetchHome() {
    const data = await query(Q_HOME)
    return {
      trending: (data.trending?.media || []).filter((a) => !isAdult(a)),
      popular: (data.popular?.media || []).filter((a) => !isAdult(a)),
      latest: (data.latest?.media || []).filter((a) => !isAdult(a)),
      seasonal: (data.seasonal?.media || []).filter((a) => !isAdult(a)),
    }
  },
  async fetchDetail(id) {
    const data = await query(Q_DETAIL, { id })
    return data.Media
  },
  async search(s, page = 1) {
    const data = await query(Q_SEARCH, { s, page })
    return { results: (data.Page?.media || []).filter((a) => !isAdult(a)), hasNext: !!data.Page?.pageInfo?.hasNextPage }
  },
  async fetchGenre(genre, page = 1) {
    const data = await query(Q_GENRE, { genre, page })
    return { results: (data.Page?.media || []).filter((a) => !isAdult(a)), hasNext: !!data.Page?.pageInfo?.hasNextPage }
  },
}

export function TT(anime) { return anime?.title?.english || anime?.title?.romaji || 'Unknown' }

export function totEps(anime) {
  if (!anime) return 1
  if ((anime.status === 'FINISHED' || anime.status === 'CANCELLED') && anime.episodes > 0) return anime.episodes
  if (anime.nextAiringEpisode?.episode > 0) return Math.max(1, anime.nextAiringEpisode.episode - 1)
  if (anime.episodes > 0) return anime.episodes
  if (anime.streamingEpisodes?.length) return anime.streamingEpisodes.length
  return 1
}
