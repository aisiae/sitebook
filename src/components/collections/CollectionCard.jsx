import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaviconImg } from '../../utils/favicon'
import { useTheme } from '../../store/themeContext'

function FaviconPreview({ sites }) {
  const C   = useTheme()
  const slots   = sites.slice(0, 3)
  const extra   = sites.length - 3
  const isEmpty = sites.length === 0

  if (isEmpty) {
    return (
      <div style={{ height: 68, background: C.rowHoverBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, opacity: 0.3 }}>📂</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: 52 }}>
      {slots.map((site, i) => (
        <FaviconImg
          key={site.id ?? i}
          url={site.url}
          style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain', background: C.bg, flexShrink: 0 }}
          fallback={
            <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🌐</div>
          }
        />
      ))}
      {extra > 0 && (
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: C.rowHoverBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: C.primary,
        }}>
          +{extra}
        </div>
      )}
    </div>
  )
}

export default function CollectionCard({ collection }) {
  const navigate = useNavigate()
  const C        = useTheme()
  const [hov, setHov] = useState(false)

  const sites = collection.siteSnapshots ?? []

  return (
    <div
      onClick={() => navigate(`/c/${collection.shareSlug}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.cardBg,
        border: hov ? `1.5px solid ${C.primary}` : C.cardBorder,
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        transform:  hov ? 'translateY(-3px)' : 'none',
        boxShadow:  hov
          ? (C.isDark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 8px 28px rgba(83,74,183,0.14)')
          : (C.isDark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.05)'),
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      <FaviconPreview sites={sites} />

      <div>
        <div style={{
          fontSize: 15, fontWeight: 800, color: C.dark,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: 1.4, marginBottom: 5,
        }}>
          {collection.title}
        </div>
        {collection.description && (
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {collection.description}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {collection.authorPhoto ? (
          <img src={collection.authorPhoto} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>👤</div>
        )}
        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {collection.authorName || '익명'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `0.5px solid ${C.divider}`, paddingTop: 12 }}>
        {[
          { icon: '🔗', val: sites.length,              label: '사이트' },
          { icon: '❤',  val: collection.likeCount ?? 0, label: '좋아요' },
          { icon: '📥', val: collection.saveCount ?? 0, label: '저장'   },
        ].map(({ icon, val, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{val}</span>
            <span style={{ fontSize: 11, color: C.textMuted }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
