# Midnight Anime — React + Vite

React + Vite rewrite of the Midnight Anime web app, with Framer Motion
animations and Zustand state management.

## Setup

```bash
npm install
npm run dev       # local dev server, http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Before you deploy

1. **TMDB API key** — open `src/api/tmdb.js` and replace
   `YOUR_TMDB_API_KEY_HERE` with your own key from
   [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
   Without it, title logos / episode stills / backdrops silently fall
   back to AniList's own images — no errors, just fewer visuals.

2. **Firebase** — `src/api/firebase.js` already has the project's real
   client config (safe to ship, these are public identifiers by design).
   Confirm your Firebase Console has Email/Password and Google sign-in
   enabled under Authentication → Sign-in method, and that your deployed
   domain is in Authentication → Settings → Authorized domains.

3. **Production hardening (optional but recommended)** — the TMDB key
   currently ships in the client bundle, same tradeoff as the original
   single-file HTML app. For a hardened deploy, route TMDB calls through
   a small serverless function (Vercel/Cloudflare Worker) that holds the
   real key server-side instead. See the comment at the bottom of
   `src/api/tmdb.js`.

## Project structure

```
src/
  api/          AniList, TMDB, Hindi dub, Firebase clients
  components/   Reusable UI (cards, nav, animated background)
  pages/        One file per route (Home, Detail, Watch, Search, ...)
  store/        Zustand stores (auth, watchlist, player)
  utils/        Season grouping, shared constants/models
  styles/       Tailwind entrypoint
```

## What's included

- Full feature parity with the HTML app: season grouping, Hindi dub
  pipeline with graceful fallback, TMDB title logos/backdrops/episode
  images, original avatar picker (not third-party character art),
  password reset + email verification, real-time public episode
  ratings, client-side new-episode notifications*, post-series
  recommendation screen.
- Framer Motion page transitions, animated ambient background, staggered
  card entrances, spring-based toggles and buttons throughout.
- Zustand stores replace the original's global mutable JS state, with
  the same Firebase read/write patterns.

\* Browser push notifications need a service worker + permission UI,
  which is more involved in a Vite SPA than a static HTML file. Not
  wired up in this pass — ask if you want it added.

## Known gaps vs. the HTML version

- Notifications UI/service-worker registration not yet ported (see above)
- Theme song (OP/ED) YouTube search-in-new-tab feature not yet ported
- Legal pages (Privacy/Terms) and the marketing landing page are separate
  static HTML files in the original project — not part of this SPA
