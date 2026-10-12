export interface ClientOptions {
  baseUrl?: string
  token?: string
  accessToken?: string
  clientHeader?: string
  fetch?: typeof globalThis.fetch
  headers?: Record<string, string>
  timeout?: number
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | null | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
  timeout?: number
  method?: string
  body?: BodyInit | null
}

export interface ApiMeta {
  source?: string
  [key: string]: unknown
}

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface Title {
  id: number
  idMal?: number | null
  title: { romaji?: string | null; english?: string | null; native?: string | null }
  coverImage?: { large?: string | null; extraLarge?: string | null; color?: string | null }
  bannerImage?: string | null
  episodes?: number | null
  status?: string | null
  averageScore?: number | null
  genres?: string[]
  format?: string | null
  season?: string | null
  seasonYear?: number | null
  [key: string]: unknown
}

export interface CatalogueParams { view?: 'trending' | 'popular' | 'seasonal' | 'movies'; page?: number; limit?: number }
export interface SearchParams { page?: number; limit?: number }
export interface ArtworkParams { tmdbId?: string | number; anilistId?: string | number; type?: 'tv' | 'movie' }
export interface PlaybackParams { malId?: string | number; tmdbId?: string | number; imdbId?: string; anilistId?: string | number; type: 'tv' | 'movie'; audio?: 'sub' | 'dub' | 'hindi'; season?: number; episode?: number }

export interface StreamSource { name?: string; title?: string; url?: string; format?: string; mimeType?: string; quality?: string; headers?: Record<string, string>; subtitles?: Array<Record<string, unknown>>; [key: string]: unknown }
export interface ArtworkResult { tmdbId: string; title?: string | null; type: 'tv' | 'movie'; overview?: string; poster?: string | null; backdrop?: string | null; voteAverage?: number | null; numberOfSeasons?: number | null; numberOfEpisodes?: number | null; seasons?: unknown[]; externalIds?: Record<string, string | null>; [key: string]: unknown }

export class MidnightAnimeError extends Error {
  code: string
  status: number | null
  details: unknown
  constructor(message: string, details?: { code?: string; status?: number | null; details?: unknown })
}

export class MidnightAnimeClient {
  constructor(options?: ClientOptions)
  readonly baseUrl: string
  request<T = unknown>(path: string, options?: RequestOptions): Promise<T>
  catalogue(params?: CatalogueParams, options?: RequestOptions): Promise<ApiResponse<Title[]>>
  search(query: string, params?: SearchParams, options?: RequestOptions): Promise<ApiResponse<Title[]>>
  anime(id: number | string, options?: RequestOptions): Promise<ApiResponse<Title>>
  artwork(params?: ArtworkParams, options?: RequestOptions): Promise<ApiResponse<ArtworkResult>>
  playback(params: PlaybackParams, options?: RequestOptions): Promise<ApiResponse<StreamSource[]>>
  titles: { search: MidnightAnimeClient['search']; catalogue: MidnightAnimeClient['catalogue']; get: MidnightAnimeClient['anime'] }
  media: { artwork: MidnightAnimeClient['artwork']; playback: MidnightAnimeClient['playback'] }
}

export function createMidnightAnimeClient(options?: ClientOptions): MidnightAnimeClient
export const midnightAnime: MidnightAnimeClient
export const DEFAULT_BASE_URL: string
export default MidnightAnimeClient
