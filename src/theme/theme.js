/**
 * AnimeStream theme — dark, poster-forward, premium streaming identity.
 * Structurally inspired by the streaming-app category (hero banner, horizontal
 * rows, bottom nav — patterns shared across the whole genre, not owned by any
 * single app). Colors, wordmark treatment, and iconography below are original
 * to this app, per the PRD's own requirement to avoid proprietary branding.
 */

export const colors = {
  bg: '#0A0A0F',
  bg1: '#111118',
  bg2: '#18181F',
  bg3: '#222230',
  card: '#1A1A22',

  // Primary accent — a warm coral-orange, distinct from any single
  // competitor's brand color while staying in the "premium dark UI" family
  accent: '#FF6B4A',
  accentAlt: '#FF8F6B',
  accentDim: 'rgba(255,107,74,0.12)',

  text1: '#FFFFFF',
  text2: 'rgba(255,255,255,0.72)',
  text3: 'rgba(255,255,255,0.48)',
  text4: 'rgba(255,255,255,0.28)',

  line: 'rgba(255,255,255,0.08)',
  line2: 'rgba(255,255,255,0.14)',

  success: '#3DD68C',
  error: '#FF5C6C',
  warning: '#FFB03D',
}

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28,
}

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, pill: 999,
}

export const typography = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
}

export const shadow = {
  card: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  glow: {
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
}
