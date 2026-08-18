export function buildSeriesSharePath(animeId) {
  return `/share/series/${encodeURIComponent(animeId)}`
}

export function buildEpisodeSharePath(animeId, episode) {
  return `/share/episode/${encodeURIComponent(animeId)}/${encodeURIComponent(episode)}`
}

export function buildAbsoluteShareUrl(path) {
  if (typeof window === 'undefined') return path
  return new URL(path, window.location.origin).toString()
}

export async function shareLink({ title, text, path }) {
  const url = buildAbsoluteShareUrl(path)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return { ok: true, method: 'native' }
    } catch (error) {
      if (error?.name === 'AbortError') return { ok: false, cancelled: true }
    }
  }

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      return { ok: true, method: 'clipboard', url }
    }
  } catch {
    // Fall through to the legacy copy method below.
  }

  try {
    const input = document.createElement('input')
    input.value = url
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    input.remove()
    return copied ? { ok: true, method: 'clipboard', url } : { ok: false, url }
  } catch {
    return { ok: false, url }
  }
}

export function setDocumentMeta({ title, description, image, url }) {
  if (typeof document === 'undefined') return () => {}

  const previousTitle = document.title
  const previous = []
  const values = {
    'meta[name="description"]': description,
    'meta[property="og:title"]': title,
    'meta[property="og:description"]': description,
    'meta[property="og:image"]': image,
    'meta[property="og:url"]': url,
    'meta[name="twitter:title"]': title,
    'meta[name="twitter:description"]': description,
    'meta[name="twitter:image"]': image,
  }

  document.title = title
  for (const [selector, content] of Object.entries(values)) {
    if (!content) continue
    let element = document.head.querySelector(selector)
    if (!element) {
      element = document.createElement('meta')
      const [attribute, value] = selector.match(/\[(.+?)="(.+?)"\]/).slice(1)
      element.setAttribute(attribute, value)
      document.head.appendChild(element)
      previous.push({ element, created: true })
    } else {
      previous.push({ element, content: element.getAttribute('content') })
    }
    element.setAttribute('content', content)
  }

  return () => {
    document.title = previousTitle
    previous.forEach(({ element, created, content }) => {
      if (created) element.remove()
      else element.setAttribute('content', content || '')
    })
  }
}
