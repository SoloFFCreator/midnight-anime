# AnimeStream — React Native (Android)

Built against the AnimeStream PRD. Catalog/metadata comes from AniList's
public API; video playback is deliberately source-agnostic — see
`src/api/streaming.js`.

## Setup

```bash
npm install
npx react-native run-android
```

## Before you run this

1. **Streaming API** — open `src/api/streaming.js` and point `BASE_URL`
   at your own streaming API. The fetch/parsing logic assumes a
   `{ sources: [...], subtitles: [...] }` response shape — adjust
   `fetchStreamSources()` to match whatever your actual API returns.
   Nothing else in the player needs to change once that's wired up.

2. **Firebase** — this project uses `@react-native-firebase`, which reads
   config from `android/app/google-services.json` at build time (not an
   inline config object like the web version). Download that file from
   your Firebase Console → Project Settings → your Android app, and drop
   it into `android/app/`. Confirm Email/Password sign-in is enabled
   under Authentication → Sign-in method.

3. **Android permissions** — downloads need storage access and
   notifications need `POST_NOTIFICATIONS` (Android 13+). Neither is
   wired into `AndroidManifest.xml` yet in this pass — see "Known gaps"
   below.

## Project structure

```
src/
  api/          AniList client, pluggable streaming interface, Firebase
  components/   AnimeCard, HeroBanner, ContentRow, SkeletonLoader
  navigation/   Stack + bottom tabs (RootNavigator)
  screens/      One file per screen, matches the PRD's screen list
  store/        Zustand: auth, watchlist/progress, downloads, settings
  theme/        Original color/spacing/typography system
  utils/        Season grouping (same three-pass algorithm as prior builds)
```

## Design notes

Per the PRD's own requirement — *"it must use its own visual identity
and not copy any proprietary branding or assets"* — this UI is
structurally inspired by the streaming-app category (hero banner,
horizontal poster rows, bottom tabs, episode-list layout — patterns
shared across the whole genre) but uses an original color palette,
wordmark, and iconography. No competitor's logo, exact brand colors, or
trade dress are reproduced anywhere in this project.

## What's implemented (Phase 1 / MVP, per PRD)

- Auth: email/password, guest browsing, password reset
- Home: hero carousel, trending/latest/popular/seasonal rows, continue watching
- Search: debounced, genre browse, season grouping (Re:Zero-style franchises collapse to one card)
- Detail: poster, metadata, genres, episode list, related titles, watchlist toggle
- Player: play/pause/seek/skip-intro/next-prev episode, subtitle tracks,
  auto-save progress every 10s, resume from last position
- Watchlist: add/remove, synced via Firebase
- Downloads: local file storage (react-native-fs) + Firebase metadata only,
  per the PRD's storage split; progress bar, delete
- Settings: subtitle/audio language, playback quality, data saver,
  download quality, auto-play, notification toggle — matches the PRD's
  Preferences data model exactly
- Firebase data model matches the PRD's spec: user docs, watch data,
  watchlist, preferences, downloads (metadata only)

## Known gaps vs. the full PRD

Being upfront about what's *not* done, same as prior builds in this project:

- **Android manifest permissions** (storage, notifications) not yet added
- **Push notifications** — settings toggle exists; actual FCM wiring +
  the "check on app open" logic (like the earlier web/RN builds) isn't
  ported here yet
- **Google Sign-In** — PRD marks this "later," not included in this pass
- **Casting to TV, multi-profile, parental controls, subscriptions** —
  all explicitly Post-MVP / Phase 2-3 in the PRD, not built
- **Analytics** (app opens, search queries, episode starts/completions,
  etc.) — event list is in the PRD but no analytics SDK is wired up
- **Autocomplete suggestions while typing** — search is debounced-search,
  not true type-ahead suggestions yet

All straightforward to add on request — flagging them rather than
leaving them silently missing.
