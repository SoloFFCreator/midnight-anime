import { metadataLinks } from '../../api/metadata'

export default function ExternalIds({ metadata, compact = false }) {
  const links = metadataLinks(metadata)
  if (!links.length) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'mt-3'}`}>
      {!compact && <span className="text-[10px] uppercase tracking-[0.14em] font-black text-t3">Streaming IDs</span>}
      {links.map((link) => (
        <a
          key={`${link.label}-${link.value}`}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-bold text-t2 transition hover:border-or/60 hover:text-white"
          title={`Open ${link.label} record`}
        >
          <span className="text-or">{link.label}</span>
          <span className="max-w-[126px] truncate">{link.value}</span>
        </a>
      ))}
    </div>
  )
}
