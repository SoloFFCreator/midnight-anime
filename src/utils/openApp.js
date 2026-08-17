export const ANDROID_PACKAGE = 'com.midnight.anime'
export const APK_DOWNLOAD_URL = 'https://github.com/SoloFFCreator/midnight-anime/releases/download/Midnight-Anime/MidnightAnime-v5.apk'

const ANDROID_INTENT = `intent://launch/#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${ANDROID_PACKAGE};end`

function isAndroidBrowser() {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}

export function openMidnightAnimeApp(navigate) {
  if (typeof window === 'undefined' || !isAndroidBrowser()) {
    navigate('/download')
    return
  }

  let appOpened = false
  let fallbackTimer

  const cleanup = () => {
    window.clearTimeout(fallbackTimer)
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
    // Android browsers usually blur the page while handing the intent to the app.
    window.setTimeout(() => {
      if (document.hidden) markAppOpened()
    }, 100)
  }

  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('pagehide', handlePageHide, { once: true })
  window.addEventListener('blur', handleBlur, { once: true })

  // Android will launch the installed package when its launcher activity is available.
  window.location.href = ANDROID_INTENT

  // Browsers do not expose a reliable “package installed” API. If the intent did not
  // hide the page, send the user to the APK download page after a short grace period.
  fallbackTimer = window.setTimeout(() => {
    if (!appOpened && !document.hidden) {
      cleanup()
      navigate('/download', { state: { fromAppIntent: true } })
    }
  }, 1800)
}
