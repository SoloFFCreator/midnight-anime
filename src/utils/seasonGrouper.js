import { TT } from '../api/anilist'

/**
 * Groups related seasons/parts/cours of the same franchise into a single
 * representative entry — same three-pass algorithm used in the web/Android
 * builds: AniList relations graph, root-title normalization, shared
 * 3-word prefix matching.
 */
function normalizeTitle(raw) {
  let t = (raw || '').toLowerCase()
  t = t.replace(/\s*[-–—:]\s*(memory snow|frozen bond|director\.?s? cut|bond of ice|the sanctuary[^,]*|since then\s*arc|cloverfield[^,]*)\s*$/i, '')
  t = t.replace(/\s+(season|part|cour|s)\s*\d+.*/i, '')
  t = t.replace(/\s+(2nd|3rd|4th|5th|\d+(?:st|nd|rd|th))\s*(season|cour).*/i, '')
  t = t.replace(/\s+(?:ii+|iii+|iv|vi*x?|vii+|viii+)$/i, '')
  t = t.replace(/\s+\d+$/, '')
  t = t.replace(/^the\s+/, '')
  t = t.replace(/\s+the\s+(frozen bond|movie|film|ova|special).*$/i, '')
  t = t.replace(/[-–—:!()[\]]/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

export function groupSeasons(results) {
  if (!results?.length) return results || []

  const parent = new Map()
  const find = (x) => {
    if (!parent.has(x)) parent.set(x, x)
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)))
    return parent.get(x)
  }
  const union = (x, y) => {
    const px = find(x)
    const py = find(y)
    if (px !== py) parent.set(px, py)
  }

  const idSet = new Set(results.map((a) => a.id))
  const groupableRelations = new Set(['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY', 'ALTERNATIVE_VERSION'])
  const groupableFormats = new Set(['TV', 'OVA', 'ONA', 'TV_SHORT', 'SPECIAL'])

  // Pass 1: AniList relations
  results.forEach((a) => {
    ;(a.relations?.edges || []).forEach((edge) => {
      const nodeId = edge.node?.id
      const nodeFormat = edge.node?.format
      const keep = !nodeFormat || groupableFormats.has(nodeFormat)
      if (keep && idSet.has(nodeId) && groupableRelations.has(edge.relationType)) {
        union(a.id, nodeId)
      }
    })
  })

  // Pass 2: root-title normalization
  const titleMap = new Map()
  results.forEach((a) => {
    const root = normalizeTitle(TT(a))
    if (!root) return
    if (!titleMap.has(root)) titleMap.set(root, [])
    titleMap.get(root).push(a.id)
  })
  titleMap.forEach((ids) => {
    for (let k = 1; k < ids.length; k++) union(ids[0], ids[k])
  })

  // Pass 3: shared 3-word prefix (skip movies)
  const prefixMap = new Map()
  results.forEach((a) => {
    if (a.format === 'MOVIE') return
    const words = normalizeTitle(TT(a)).split(' ').filter(Boolean)
    if (words.length < 3) return
    const prefix = words.slice(0, 3).join(' ')
    if (!prefixMap.has(prefix)) prefixMap.set(prefix, [])
    prefixMap.get(prefix).push(a.id)
  })
  prefixMap.forEach((ids) => {
    for (let k = 1; k < ids.length; k++) union(ids[0], ids[k])
  })

  // Build groups
  const groups = new Map()
  results.forEach((a) => {
    const root = find(a.id)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root).push(a)
  })

  const statusRank = (a) => (a.status === 'RELEASING' ? 3 : a.status === 'FINISHED' ? 2 : 1)

  const output = []
  groups.forEach((group) => {
    const rep = [...group].sort((a, b) => {
      const sd = statusRank(b) - statusRank(a)
      if (sd) return sd
      const scd = (b.averageScore || 0) - (a.averageScore || 0)
      if (scd) return scd
      return (b.seasonYear || 0) - (a.seasonYear || 0)
    })[0]
    rep._seasonCount = group.length > 1 ? group.length : 0
    rep._seasonGroup = group
    output.push(rep)
  })

  return output.sort((a, b) => {
    const sa = a.status === 'RELEASING' ? 1 : 0
    const sb = b.status === 'RELEASING' ? 1 : 0
    if (sb !== sa) return sb - sa
    return (b.averageScore || 0) - (a.averageScore || 0)
  })
}
