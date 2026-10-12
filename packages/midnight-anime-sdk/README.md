# midnight-anime-sdk

A small, dependency-free JavaScript and TypeScript client for the Midnight Anime API.

## Install

```bash
npm install midnight-anime-sdk
```

The package works in modern browsers, Node.js 18+, Deno-compatible environments, and server runtimes that provide `fetch`.

## JavaScript

```js
import { createMidnightAnimeClient } from 'midnight-anime-sdk'

const anime = createMidnightAnimeClient()
const { data } = await anime.search('Frieren', { limit: 10 })

console.log(data[0].title.english || data[0].title.romaji)
```

## TypeScript

Type declarations are included in the package.

```ts
import { MidnightAnimeClient, type PlaybackParams } from 'midnight-anime-sdk'

const client = new MidnightAnimeClient({ timeout: 20_000 })
const result = await client.catalogue({ view: 'trending', limit: 12 })

const request: PlaybackParams = {
  malId: 21,
  type: 'tv',
  audio: 'sub',
  season: 1,
  episode: 1,
}
const streams = await client.playback(request)
```

## Resources

```js
await client.search('One Piece', { page: 1, limit: 20 })
await client.catalogue({ view: 'popular', limit: 20 })
await client.anime(21)
await client.artwork({ tmdbId: 94605, type: 'tv' })
await client.playback({ malId: 21, type: 'tv', audio: 'sub', season: 1, episode: 1 })
```

The same methods are available through grouped helpers:

```js
await client.titles.search('Frieren')
await client.titles.get(21)
await client.media.artwork({ tmdbId: 94605 })
```

## Custom API address or fetch

```js
const client = createMidnightAnimeClient({
  baseUrl: 'https://www.midnightanime.bond/api/v1',
  token: process.env.MIDNIGHT_ANIME_TOKEN,
  timeout: 10_000,
  headers: { 'X-My-App': 'nightly-dashboard' },
  fetch: fetch,
})
```

For authenticated developer tooling, pass a Firebase ID token as `token` or `accessToken`. Never commit tokens or expose them in browser source. The official terminal client handles account login and secure local storage for you.

Every request also accepts an `AbortSignal` and a per-request timeout:

```js
const controller = new AbortController()
const request = client.search('Naruto', {}, { signal: controller.signal })
controller.abort()
```

## Errors

Failed HTTP, network, timeout, and cancellation cases throw `MidnightAnimeError`:

```js
import { MidnightAnimeError } from 'midnight-anime-sdk'

try {
  await client.playback({ type: 'tv', audio: 'sub', season: 1, episode: 1 })
} catch (error) {
  if (error instanceof MidnightAnimeError) {
    console.log(error.code, error.status, error.message)
  }
}
```

## Playback guidance

Playback responses are availability data. A valid request can still return no sources for a particular title, episode, or language. Render loading, unavailable, retry, and success states. Do not expose provider URLs as your primary product interface; pass a supported source to your own player and follow the usage rules of the service.

## API versioning

The default base address is:

```text
https://www.midnightanime.bond/api/v1
```

Pin the SDK version in production and handle unknown response fields gracefully. The API can change media availability, limits, and response fields as the service evolves.

All episodes and anime are distributed by Midnight Anime. Distributor is Midnight Anime Channel. Use the SDK only for respectful, lawful integrations and review the full documentation at https://midnightanime.bond/api.
