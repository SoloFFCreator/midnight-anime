const DEFAULT_BASE_URL = 'https://www.midnightanime.bond/api/v1'

export class MidnightAnimeError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'MidnightAnimeError'
    this.code = details.code || 'REQUEST_FAILED'
    this.status = details.status ?? null
    this.details = details.details ?? null
  }
}

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function encodePath(path) {
  return path.split('/').map((part) => encodeURIComponent(part)).join('/')
}

export class MidnightAnimeClient {
  constructor(options = {}) {
    this.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')
    this.fetch = options.fetch || globalThis.fetch
    this.headers = { Accept: 'application/json', ...(options.headers || {}) }
    this.token = options.token || options.accessToken || null
    this.clientHeader = options.clientHeader || 'javascript-sdk/1.0.0'
    this.timeout = options.timeout ?? 15000
    if (typeof this.fetch !== 'function') throw new MidnightAnimeError('This environment does not provide fetch. Pass a fetch implementation in the constructor.', { code: 'FETCH_UNAVAILABLE' })
  }

  async request(path, options = {}) {
    const { query, signal, timeout = this.timeout, headers, ...init } = options
    const url = new URL(`${this.baseUrl}/${String(path).replace(/^\//, '')}`)
    Object.entries(cleanParams(query)).forEach(([key, value]) => url.searchParams.set(key, String(value)))
    const controller = new AbortController()
    const timer = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null
    const onAbort = () => controller.abort()
    signal?.addEventListener?.('abort', onAbort, { once: true })
    try {
      const authorization = this.token ? { Authorization: `Bearer ${this.token}` } : {}
      const response = await this.fetch(url.toString(), { ...init, signal: controller.signal, headers: { ...this.headers, ...authorization, ...headers, 'X-Midnight-Client': this.clientHeader } })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new MidnightAnimeError(body?.error?.message || `Midnight Anime API returned HTTP ${response.status}.`, { code: body?.error?.code || 'HTTP_ERROR', status: response.status, details: body?.error || body })
      }
      return body
    } catch (error) {
      if (error instanceof MidnightAnimeError) throw error
      if (error?.name === 'AbortError') throw new MidnightAnimeError('The Midnight Anime request timed out or was cancelled.', { code: 'REQUEST_ABORTED' })
      throw new MidnightAnimeError(error?.message || 'Unable to reach the Midnight Anime API.', { code: 'NETWORK_ERROR', details: error })
    } finally {
      if (timer) clearTimeout(timer)
      signal?.removeEventListener?.('abort', onAbort)
    }
  }

  catalogue(params = {}, options = {}) { return this.request('/catalogue', { ...options, query: { view: 'trending', limit: 20, ...params, ...(options.query || {}) } }) }
  search(query, params = {}, options = {}) { return this.request('/search', { ...options, query: { q: query, ...params, ...(options.query || {}) } }) }
  anime(id, options = {}) { return this.request('/anime', { ...options, query: { id, ...(options.query || {}) } }) }
  artwork(params = {}, options = {}) { return this.request('/artwork', { ...options, query: { type: 'tv', ...params, ...(options.query || {}) } }) }
  playback(params = {}, options = {}) { return this.request('/playback', { ...options, query: params }) }

  titles = {
    search: (query, params, options) => this.search(query, params, options),
    catalogue: (params, options) => this.catalogue(params, options),
    get: (id, options) => this.anime(id, options),
  }

  media = {
    artwork: (params, options) => this.artwork(params, options),
    playback: (params, options) => this.playback(params, options),
  }
}

export function createMidnightAnimeClient(options) {
  return new MidnightAnimeClient(options)
}

export const midnightAnime = createMidnightAnimeClient()
export { DEFAULT_BASE_URL }
export default MidnightAnimeClient
