import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../common/Navbar'
import AddSiteModal from '../common/AddSiteModal'
import CreateCollectionModal from '../collections/CreateCollectionModal'
import { FaviconImg } from '../../utils/favicon'
import { useCategories } from '../../hooks/useCategories'
import { STATUS_LABEL, STATUS_STYLE } from '../../lib/constants'
import { useTheme } from '../../store/themeContext'

const LAYOUT_OPTIONS = [
  { type: 'A', icon: '⊞', label: '카드' },
  { type: 'B', icon: '≡', label: '리스트' },
  { type: 'C', icon: '⊡', label: '폴더' },
]

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

function hostname(url) {
  try {
    const href = url?.startsWith('http') ? url : `https://${url}`
    return new URL(href).hostname.replace('www.', '')
  } catch { return url }
}

function SortHeader({ label, field, sortField, sortDir, onSort, style }) {
  const C      = useTheme()
  const active = sortField === field
  return (
    <div
      onClick={() => onSort(field)}
      style={{
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
        fontSize: 11, fontWeight: 600, userSelect: 'none',
        color: active ? C.primary : C.textMuted,
        ...style,
      }}
    >
      {label}
      <span style={{ fontSize: 9 }}>
        {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇕'}
      </span>
    </div>
  )
}

function ListRow({ site, onOpen, onEdit, isDeleting, onDeleteStart, onDeleteCancel, onDeleteConfirm }) {
  const C             = useTheme()
  const [hov, setHov] = useState(false)
  const status        = site.status ?? 'active'

  return (
    <div
      onClick={() => !isDeleting && onOpen(site)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 20px',
        background: hov ? C.rowHoverBg : C.cardBg,
        borderBottom: `0.5px solid ${C.divider}`,
        cursor: 'pointer', transition: 'background 0.1s',
      }}
    >
      <FaviconImg
        url={site.url}
        style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', background: C.bg, flexShrink: 0 }}
        fallback={
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌐</div>
        }
      />

      <div style={{ flex: 3, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {site.name}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hostname(site.url)}
        </div>
      </div>

      <div style={{ width: 100, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, background: C.primaryLight, color: C.primary, borderRadius: 999, padding: '2px 8px' }}>
          {Array.isArray(site.category) ? site.category.join(', ') : site.category}
        </span>
      </div>

      <div style={{ width: 80, flexShrink: 0, fontSize: 12, color: C.textMuted }}>
        {relativeDate(site.lastVisitedAt)}
      </div>

      <div style={{ width: 60, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '2px 8px', ...STATUS_STYLE[status] }}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div
        style={{ width: 90, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}
        onClick={e => e.stopPropagation()}
      >
        {isDeleting ? (
          <>
            <button
              onClick={() => onDeleteConfirm(site.id)}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: 'none', background: '#e53935', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >삭제</button>
            <button
              onClick={onDeleteCancel}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: `1px solid ${C.subBorder}`, background: C.cardBg, cursor: 'pointer', color: C.textMuted }}
            >취소</button>
          </>
        ) : hov ? (
          <>
            <button
              onClick={() => onEdit(site)}
              style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'rgba(83,74,183,0.1)', color: C.primary, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✎</button>
            <button
              onClick={onDeleteStart}
              style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'rgba(229,57,53,0.08)', color: '#e53935', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function LayoutB({ sites, loading, addSite, updateSite, updateLastVisited, deleteSite, layoutType, setLayoutType, createCollection }) {
  const C                                 = useTheme()
  const navigate                          = useNavigate()
  const { categories }                    = useCategories()
  const [activeCat, setActiveCat]         = useState(null)
  const [activeSubcat, setActiveSubcat]   = useState(null)
  const [search, setSearch]               = useState('')
  const [sortField, setSortField]         = useState('lastVisitedAt')
  const [sortDir, setSortDir]             = useState('desc')
  const [showAdd, setShowAdd]             = useState(false)
  const [editingSite, setEditingSite]     = useState(null)
  const [deletingId, setDeletingId]       = useState(null)
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  const activeCatObj = categories.find(c => c.name === activeCat)
  const subcats      = activeCatObj?.subcategories ?? []

  const handleCatChange = (catName) => { setActiveCat(catName); setActiveSubcat(null) }

  const q        = search.trim().toLowerCase()
  const filtered = sites
    .filter(s => !activeCat    || (Array.isArray(s.category) ? s.category.includes(activeCat) : s.category === activeCat))
    .filter(s => !activeSubcat || s.subcategory === activeSubcat)
    .filter(s => !q || s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortField === 'name') {
      cmp = (a.name ?? '').localeCompare(b.name ?? '', 'ko')
    } else if (sortField === 'lastVisitedAt') {
      const ta = a.lastVisitedAt?.toMillis?.() ?? 0
      const tb = b.lastVisitedAt?.toMillis?.() ?? 0
      cmp = ta - tb
    } else if (sortField === 'status') {
      cmp = (a.status ?? 'active').localeCompare(b.status ?? 'active')
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleOpen = async (site) => {
    const url = site.url.startsWith('http') ? site.url : `https://${site.url}`
    window.open(url, '_blank', 'noopener,noreferrer')
    await updateLastVisited(site.id)
  }

  const catCount    = (cat) => cat ? sites.filter(s => Array.isArray(s.category) ? s.category.includes(cat) : s.category === cat).length : sites.length
  const activeLabel = activeCat ? (categories.find(c => c.name === activeCat)?.name ?? activeCat) : '전체'

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
            <div
              onClick={() => handleCatChange(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                background: !activeCat ? C.primaryLight : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (activeCat) e.currentTarget.style.background = C.rowHoverBg }}
              onMouseLeave={e => { if (activeCat) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>📋</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: !activeCat ? 700 : 500, color: !activeCat ? C.primary : C.textSub }}>전체</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: !activeCat ? C.primary : C.textMuted }}>{sites.length}</span>
            </div>
            {categories.map(cat => {
              const on    = activeCat === cat.name
              const count = catCount(cat.name)
              if (count === 0) return null
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCatChange(cat.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                    background: on ? C.primaryLight : 'transparent',
                    transition: 'background 0.15s',
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

          <div style={{ padding: '12px' }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 8,
                border: 'dashed 1px rgba(83,74,183,0.3)',
                background: 'transparent', color: C.primary,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.borderStyle = 'solid' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed' }}
            >
              + 사이트 추가
            </button>
          </div>
        </aside>

        {/* ── 메인 ── */}
        <main style={{ flex: 1, minWidth: 0, minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>

          <div style={{
            padding: '20px 28px 16px', background: C.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{activeLabel}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{sorted.length}개 사이트</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setShowCreateCollection(true)}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.primary}`, background: C.cardBg, color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >⊞ 컬렉션</button>
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

          {/* 탭 */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => handleCatChange(null)} style={{ padding: '5px 14px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: !activeCat ? C.primary : C.cardBg, color: !activeCat ? '#fff' : C.textSub, boxShadow: !activeCat ? 'none' : '0 1px 4px rgba(0,0,0,0.07)' }}>
                전체 <span style={{ marginLeft: 4, opacity: 0.7, fontWeight: 500 }}>{sites.length}</span>
              </button>
              {categories.map(cat => {
                const on    = activeCat === cat.name
                const count = sites.filter(s => s.category === cat.name).length
                if (count === 0) return null
                return (
                  <button key={cat.id} onClick={() => handleCatChange(cat.name)} style={{ padding: '5px 14px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: on ? C.primary : C.cardBg, color: on ? '#fff' : C.textSub, boxShadow: on ? 'none' : '0 1px 4px rgba(0,0,0,0.07)' }}>
                    {cat.name} <span style={{ marginLeft: 4, opacity: 0.7, fontWeight: 500 }}>{count}</span>
                  </button>
                )
              })}
            </div>
            {subcats.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                <button onClick={() => setActiveSubcat(null)} style={{ padding: '3px 12px', borderRadius: 999, border: `1px solid ${!activeSubcat ? C.primary : C.subBorder}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: !activeSubcat ? C.primaryLight : C.cardBg, color: !activeSubcat ? C.primary : C.textMuted }}>전체</button>
                {subcats.map(sub => {
                  const on = activeSubcat === sub.name
                  return <button key={sub.id} onClick={() => setActiveSubcat(sub.name)} style={{ padding: '3px 12px', borderRadius: 999, border: `1px solid ${on ? C.primary : C.subBorder}`, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: on ? C.primaryLight : C.cardBg, color: on ? C.primary : C.textMuted }}>{sub.name}</button>
                })}
              </div>
            )}
          </div>

          {/* 테이블 */}
          <div style={{ margin: '0 24px 24px', background: C.cardBg, borderRadius: C.cardRadius, border: C.cardBorder, overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: C.tableHeaderBg, borderBottom: `0.5px solid ${C.divider}` }}>
              <div style={{ width: 28, flexShrink: 0 }} />
              <SortHeader label="사이트명"    field="name"          sortField={sortField} sortDir={sortDir} onSort={toggleSort} style={{ flex: 3 }} />
              <div style={{ width: 100, flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.textMuted }}>카테고리</div>
              <SortHeader label="마지막 방문" field="lastVisitedAt" sortField={sortField} sortDir={sortDir} onSort={toggleSort} style={{ width: 80, flexShrink: 0 }} />
              <SortHeader label="상태"        field="status"        sortField={sortField} sortDir={sortDir} onSort={toggleSort} style={{ width: 60, flexShrink: 0 }} />
              <div style={{ width: 90, flexShrink: 0 }} />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>불러오는 중...</div>
            ) : sorted.length > 0 ? (
              sorted.map(site => (
                <ListRow
                  key={site.id}
                  site={site}
                  onOpen={handleOpen}
                  onEdit={setEditingSite}
                  isDeleting={deletingId === site.id}
                  onDeleteStart={() => setDeletingId(site.id)}
                  onDeleteCancel={() => setDeletingId(null)}
                  onDeleteConfirm={(id) => { deleteSite(id); setDeletingId(null) }}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{search ? '🔍' : '📂'}</div>
                <p style={{ fontSize: 14, color: C.textSub, margin: '0 0 4px' }}>
                  {search ? `'${search}' 검색 결과가 없어요.` : activeCat ? `'${activeCat}' 카테고리에 사이트가 없어요.` : '아직 등록된 사이트가 없어요.'}
                </p>
                {!search && (
                  <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    + 사이트 추가
                  </button>
                )}
              </div>
            )}
          </div>

        </main>
      </div>

      {showAdd && <AddSiteModal onClose={() => setShowAdd(false)} onSave={addSite} />}
      {editingSite && (
        <AddSiteModal initial={editingSite} onClose={() => setEditingSite(null)} onSave={(data) => updateSite(editingSite.id, data)} />
      )}
      {showCreateCollection && (
        <CreateCollectionModal onClose={() => setShowCreateCollection(false)} onSave={createCollection} sites={sites} />
      )}
    </div>
  )
}
