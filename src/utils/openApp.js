export const ANDROID_PACKAGE = 'com.midnight.anime'
export const APK_DOWNLOAD_URL = 'https://github.com/SoloFFCreator/midnight-anime/releases/download/Midnight-Anime/Midnight.Anime.apk'

function isAndroidBrowser() {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}

export function openWebApp(navigate) {
  navigate('/app')
}

export function openMidnightAnimeApp(navigate) {
  if (typeof window === 'undefined' || !isAndroidBrowser()) {
    navigate('/app')
    return
  }

  let appOpened = false
  let fallbackTimer
  let secondaryIntentTimer
  const fallbackUrl = new URL('/download', window.location.origin).toString()
  // Use an explicit launcher intent. The APK exposes IntroActivity as the
  // exported MAIN/LAUNCHER activity; the old `intent://launch/` URI could be
  // treated as an arbitrary deep link by some Android browsers and fail to resolve.
  const primaryIntent = `intent://${ANDROID_PACKAGE}/#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`

  const cleanup = () => {
    window.clearTimeout(fallbackTimer)
    window.clearTimeout(secondaryIntentTimer)
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('pagehide', handlePageHide)
    window.removeEventListener('blur', handleBlur)
  }

  const markAppOpened = () => {
    appOpened = true
    cleanup()
  }

  const handleVisibility = () => {
    if (document.hidden) markAppOpened()
  }

  const handlePageHide = () => markAppOpened()
  const handleBlur = () => {
    window.setTimeout(() => {
      if (document.hidden) markAppOpened()
    }, 120)
  }

  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('pagehide', handlePageHide, { once: true })
  window.addEventListener('blur', handleBlur, { once: true })

  window.location.href = primaryIntent

  // Give Android a short window to hand the intent to the installed package.
  secondaryIntentTimer = window.setTimeout(() => {
    if (!appOpened && !document.hidden) window.location.assign(primaryIntent)
  }, 900)

  fallbackTimer = window.setTimeout(() => {
    if (!appOpened && !document.hidden) {
      cleanup()
      navigate('/download', { state: { fromAppIntent: true } })
    }
  }, 2400)
}
