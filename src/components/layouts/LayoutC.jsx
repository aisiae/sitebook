import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../common/Navbar'
import AddSiteModal from '../common/AddSiteModal'
import CreateCollectionModal from '../collections/CreateCollectionModal'
import { FaviconImg } from '../../utils/favicon'
import { STATUS_STYLE } from '../../lib/constants'
import { useTheme } from '../../store/themeContext'
import { useCategories } from '../../hooks/useCategories'

const LAYOUT_OPTIONS = [
  { type: 'A', icon: '⊞', label: '카드' },
  { type: 'B', icon: '≡', label: '리스트' },
  { type: 'C', icon: '⊡', label: '폴더' },
]

const DOT_COLOR = { active: '#4CAF50', dormant: '#FFC107' }

function relativeDate(ts) {
  if (!ts) return '-'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7)  return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}개월 전`
}

function MiniCard({ site, onOpen }) {
  const C              = useTheme()
  const [hov, setHov]  = useState(false)
  const status         = site.status ?? 'active'
  const dotColor       = DOT_COLOR[status] ?? DOT_COLOR.active

  return (
    <div
      onClick={() => onOpen(site)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.cardBg,
        border: hov ? `1.5px solid ${C.primary}` : C.cardBorder,
        borderRadius: 10, padding: '10px 8px',
        cursor: 'pointer', transition: 'all 0.15s',
        transform:  hov ? 'translateY(-2px)' : 'none',
        boxShadow:  hov ? '0 4px 14px rgba(83,74,183,0.14)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        minWidth: 0,
      }}
    >
      <FaviconImg
        url={site.url}
        style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', background: C.bg }}
        fallback={
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌐</div>
        }
      />
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {site.name}
        </div>
        <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
          {relativeDate(site.lastVisitedAt)}
        </div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
    </div>
  )
}

function CategorySection({ label, emoji, sites, onOpen, collapsed, onToggle }) {
  const C             = useTheme()
  const [hov, setHov] = useState(false)

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 18px',
          background: hov ? C.rowHoverBg : C.cardBg,
          border: C.cardBorder,
          borderRadius: collapsed ? C.cardRadius : `${C.cardRadius} ${C.cardRadius} 0 0`,
          cursor: 'pointer', userSelect: 'none', transition: 'background 0.12s',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{label}</span>
        <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>· {sites.length}개</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.textMuted, display: 'inline-block', transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'none' }}>▼</span>
      </div>

      {!collapsed && (
        <div style={{
          background: C.cardBg,
          border: C.cardBorder, borderTop: 'none',
          borderRadius: `0 0 ${C.cardRadius} ${C.cardRadius}`,
          padding: '14px 16px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
            {sites.map(site => (
              <MiniCard key={site.id} site={site} onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LayoutC({ sites, loading, addSite, updateLastVisited, layoutType, setLayoutType, createCollection }) {
  const C                 = useTheme()
  const navigate          = useNavigate()
  const { categories }    = useCategories()
  const [activeCat, setActiveCat]   = useState(null)
  const [search, setSearch]         = useState('')
  const [collapsed, setCollapsed]   = useState(new Set())
  const [showAdd, setShowAdd]       = useState(false)
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  const q             = search.trim().toLowerCase()
  const filteredSites = sites
    .filter(s => !activeCat || (Array.isArray(s.category) ? s.category.includes(activeCat) : s.category === activeCat))
    .filter(s => !q || s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))

  const catCount = (cat) => cat
    ? sites.filter(s => Array.isArray(s.category) ? s.category.includes(cat) : s.category === cat).length
    : sites.length

  // Build dynamic sections from Firestore categories
  const allSectionDefs = activeCat
    ? categories.filter(c => c.name === activeCat)
    : categories

  const sections = allSectionDefs
    .map(cat => ({
      label: cat.name,
      emoji: cat.emoji,
      cat:   cat.name,
      sites: filteredSites.filter(s => Array.isArray(s.category) ? s.category.includes(cat.name) : s.category === cat.name),
    }))
    .filter(s => s.sites.length > 0)

  const handleOpen = async (site) => {
    const url = site.url.startsWith('http') ? site.url : `https://${site.url}`
    window.open(url, '_blank', 'noopener,noreferrer')
    await updateLastVisited(site.id)
  }

  const toggleSection = (label) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const allCollapsed = sections.length > 0 && sections.every(s => collapsed.has(s.label))
  const toggleAll    = () => setCollapsed(allCollapsed ? new Set() : new Set(sections.map(s => s.label)))

  const activeLabel = activeCat ? categories.find(c => c.name === activeCat)?.name ?? activeCat : '전체'
  const totalShown  = filteredSites.length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex' }}>

        {/* ── 사이드바 ── */}
        <aside style={{
          width: 160, flexShrink: 0,
          background: C.sidebarBg,
          borderRight: `0.5px solid ${C.divider}`,
          position: 'sticky', top: 60,
          alignSelf: 'flex-start',
          height: 'calc(100vh - 60px)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: `0.5px solid ${C.divider}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1.5 }}>내 사이트</div>
          </div>

          <div style={{ flex: 1, padding: '8px' }}>
            {/* 전체 */}
            <div
              onClick={() => { setActiveCat(null); setCollapsed(new Set()) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                background: !activeCat ? C.primaryLight : 'transparent', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (activeCat !== null) e.currentTarget.style.background = C.rowHoverBg }}
              onMouseLeave={e => { if (activeCat !== null) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>📋</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: !activeCat ? 700 : 500, color: !activeCat ? C.primary : C.textSub }}>전체</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: !activeCat ? C.primary : C.textMuted }}>{sites.length}</span>
            </div>
            {/* 동적 카테고리 */}
            {categories.map(cat => {
              const on    = activeCat === cat.name
              const count = catCount(cat.name)
              if (count === 0) return null
              return (
                <div
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.name); setCollapsed(new Set()) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                    background: on ? C.primaryLight : 'transparent', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = C.rowHoverBg }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: on ? 700 : 500, color: on ? C.primary : C.textSub }}>{cat.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: on ? C.primary : C.textMuted }}>{count}</span>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: 'dashed 1px rgba(83,74,183,0.3)', background: 'transparent', color: C.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.borderStyle = 'solid' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed' }}
            >
              + 사이트 추가
            </button>
            <button
              onClick={() => setShowCreateCollection(true)}
              style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: `1px solid rgba(83,74,183,0.25)`, background: 'transparent', color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ⊞ 컬렉션
            </button>
          </div>
        </aside>

        {/* ── 메인 ── */}
        <main style={{ flex: 1, minWidth: 0, minHeight: 'calc(100vh - 60px)' }}>

          <div style={{
            padding: '20px 28px 16px', background: C.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{activeLabel}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{totalShown}개 사이트</div>
              </div>
              {sections.length > 1 && (
                <button
                  onClick={toggleAll}
                  style={{ padding: '5px 12px', borderRadius: 7, border: C.cardBorder, background: C.cardBg, color: C.textSub, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                >
                  {allCollapsed ? '모두 펼치기' : '모두 접기'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="text"
                placeholder="사이트 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, border: C.inputBorder, outline: 'none', background: C.inputBg, color: C.textPrimary, width: 160, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: C.cardBg, border: C.cardBorder, borderRadius: 10, padding: '3px' }}>
                {LAYOUT_OPTIONS.map(({ type, icon, label }) => {
                  const on = layoutType === type
                  return (
                    <button key={type} onClick={() => setLayoutType(type)} title={`레이아웃 ${label}`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: 'none', background: on ? C.primary : 'transparent', color: on ? '#fff' : C.textMuted, fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: 12 }}>{icon}</span>
                      <span style={{ fontSize: 11 }}>{label}</span>
                    </button>
                  )
                })}
                <div style={{ width: '0.5px', height: 20, background: C.divider, margin: '0 2px' }} />
                <button onClick={() => navigate('/settings/layout')} style={{ padding: '5px 8px', borderRadius: 7, border: 'none', background: 'transparent', color: C.textMuted, fontSize: 13, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = C.primary} onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>···</button>
              </div>
            </div>
          </div>

          <div style={{ padding: '4px 24px 32px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>불러오는 중...</div>
            ) : sections.length > 0 ? (
              sections.map(section => (
                <CategorySection
                  key={section.label}
                  label={section.label}
                  emoji={section.emoji}
                  sites={section.sites}
                  onOpen={handleOpen}
                  collapsed={collapsed.has(section.label)}
                  onToggle={() => toggleSection(section.label)}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{search ? '🔍' : '📂'}</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: C.textSub, margin: '0 0 6px' }}>
                  {search ? `'${search}' 검색 결과가 없어요.` : '아직 등록된 사이트가 없어요.'}
                </p>
                {!search && (
                  <button onClick={() => setShowAdd(true)} style={{ marginTop: 10, background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    + 사이트 추가
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showAdd && <AddSiteModal onClose={() => setShowAdd(false)} onSave={addSite} />}
      {showCreateCollection && (
        <CreateCollectionModal onClose={() => setShowCreateCollection(false)} onSave={createCollection} sites={sites} />
      )}
    </div>
  )
}
