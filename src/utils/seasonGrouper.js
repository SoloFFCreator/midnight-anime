import { TT } from '../api/anilist'

function normalizeTitle(raw) {
  let t = (raw || '').toLowerCase()
  t = t.replace(/\s*[-–—:]\s*(memory snow|frozen bond|director\.?s? cut|ova|special)\s*$/i, '')
  t = t.replace(/\s+(season|part|cour|s)\s*\d+.*/i, '')
  t = t.replace(/\s+(2nd|3rd|4th|5th|\d+(?:st|nd|rd|th))\s*(season|cour).*/i, '')
  t = t.replace(/\s+(?:ii+|iii+|iv|vi*x?|vii+|viii+)$/i, '')
  t = t.replace(/\s+\d+$/, '')
  t = t.replace(/^the\s+/, '')
  t = t.replace(/[-–—:!()[\]]/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

export function groupSeasons(results) {
  if (!results?.length) return results || []
  const parent = new Map()
  const find = (x) => { if (!parent.has(x)) parent.set(x, x); if (parent.get(x) !== x) parent.set(x, find(parent.get(x))); return parent.get(x) }
  const union = (x, y) => { const px = find(x), py = find(y); if (px !== py) parent.set(px, py) }

  const idSet = new Set(results.map((a) => a.id))
  const groupableRel = new Set(['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY', 'ALTERNATIVE_VERSION'])
  const groupableFmt = new Set(['TV', 'OVA', 'ONA', 'TV_SHORT', 'SPECIAL'])

  results.forEach((a) => {
    ;(a.relations?.edges || []).forEach((e) => {
      const nId = e.node?.id, nFmt = e.node?.format
      if ((!nFmt || groupableFmt.has(nFmt)) && idSet.has(nId) && groupableRel.has(e.relationType)) union(a.id, nId)
    })
  })

  const titleMap = new Map()
  results.forEach((a) => {
    const root = normalizeTitle(TT(a))
    if (!root) return
    if (!titleMap.has(root)) titleMap.set(root, [])
    titleMap.get(root).push(a.id)
  })
  titleMap.forEach((ids) => { for (let k = 1; k < ids.length; k++) union(ids[0], ids[k]) })

  const groups = new Map()
  results.forEach((a) => { const r = find(a.id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(a) })

  const statusRank = (a) => (a.status === 'RELEASING' ? 3 : a.status === 'FINISHED' ? 2 : 1)
  const output = []
  groups.forEach((group) => {
    const rep = [...group].sort((a, b) => statusRank(b) - statusRank(a) || (b.averageScore || 0) - (a.averageScore || 0))[0]
    rep._seasonCount = group.length > 1 ? group.length : 0
    output.push(rep)
  })
  return output.sort((a, b) => (b.status === 'RELEASING' ? 1 : 0) - (a.status === 'RELEASING' ? 1 : 0) || (b.averageScore || 0) - (a.averageScore || 0))
}
