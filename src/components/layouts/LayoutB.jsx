import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../common/Navbar'
import AddSiteModal from '../common/AddSiteModal'
import CreateCollectionModal from '../collections/CreateCollectionModal'
import { FaviconImg } from '../../utils/favicon'
import { useCategories } from '../../hooks/useCategories'
import { STATUS_LABEL, STATUS_STYLE } from '../../lib/constants'

const C = {
  primary:      '#534AB7',
  primaryLight: '#EEEDFE',
  bg:           '#f5f4ff',
  dark:         '#2d2a6e',
  cardBorder:   '0.5px solid rgba(83,74,183,0.12)',
  cardRadius:   '12px',
  btnRadius:    '10px',
}

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

// ─────────────────────────────────────────────
// 정렬 컬럼 헤더
// ─────────────────────────────────────────────
function SortHeader({ label, field, sortField, sortDir, onSort, style }) {
  const active = sortField === field
  return (
    <div
      onClick={() => onSort(field)}
      style={{
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
        fontSize: 11, fontWeight: 600, userSelect: 'none',
        color: active ? C.primary : '#999',
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

// ─────────────────────────────────────────────
// List row
// ─────────────────────────────────────────────
function ListRow({ site, onOpen, onEdit, isDeleting, onDeleteStart, onDeleteCancel, onDeleteConfirm }) {
  const [hov, setHov] = useState(false)
  const status = site.status ?? 'active'

  return (
    <div
      onClick={() => !isDeleting && onOpen(site)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 20px',
        background: hov ? '#f8f7ff' : '#fff',
        borderBottom: '0.5px solid rgba(83,74,183,0.06)',
        cursor: 'pointer', transition: 'background 0.1s',
      }}
    >
      {/* 파비콘 */}
      <FaviconImg
        url={site.url}
        style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', background: '#f5f4ff', flexShrink: 0 }}
        fallback={
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🌐</div>
        }
      />

      {/* 이름 + 도메인 */}
      <div style={{ flex: 3, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {site.name}
        </div>
        <div style={{ fontSize: 11, color: '#bbb', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hostname(site.url)}
        </div>
      </div>

      {/* 카테고리 */}
      <div style={{ width: 100, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, background: C.primaryLight, color: C.primary, borderRadius: 999, padding: '2px 8px' }}>
          {site.category}
        </span>
      </div>

      {/* 마지막 방문 */}
      <div style={{ width: 80, flexShrink: 0, fontSize: 12, color: '#bbb' }}>
        {relativeDate(site.lastVisitedAt)}
      </div>

      {/* 상태 */}
      <div style={{ width: 60, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '2px 8px', ...STATUS_STYLE[status] }}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* 수정 / 삭제 */}
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
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #e0dff8', background: '#fff', cursor: 'pointer', color: '#888' }}
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

// ─────────────────────────────────────────────
// Layout B — 사이드바 + 리스트
// ─────────────────────────────────────────────
export default function LayoutB({ sites, loading, addSite, updateSite, updateLastVisited, deleteSite, layoutType, setLayoutType, createCollection }) {
  const navigate = useNavigate()
  const { categories } = useCategories()
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
  const subcats = activeCatObj?.subcategories ?? []

  const handleCatChange = (catName) => { setActiveCat(catName); setActiveSubcat(null) }

  // 필터
  const q        = search.trim().toLowerCase()
  const filtered = sites
    .filter(s => !activeCat    || s.category    === activeCat)
    .filter(s => !activeSubcat || s.subcategory === activeSubcat)
    .filter(s => !q || s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))

  // 정렬
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
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleOpen = async (site) => {
    const url = site.url.startsWith('http') ? site.url : `https://${site.url}`
    window.open(url, '_blank', 'noopener,noreferrer')
    await updateLastVisited(site.id)
  }

  const catCount  = (cat) => cat ? sites.filter(s => s.category === cat).length : sites.length
  const activeLabel = activeCat ? (categories.find(c => c.name === activeCat)?.name ?? activeCat) : '전체'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex' }}>

        {/* ── 사이드바 ── */}
        <aside style={{
          width: 160, flexShrink: 0,
          background: '#fff',
          borderRight: '0.5px solid rgba(83,74,183,0.08)',
          position: 'sticky', top: 60,
          alignSelf: 'flex-start',
          height: 'calc(100vh - 60px)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* 섹션 제목 */}
          <div style={{ padding: '20px 16px 12px', borderBottom: '0.5px solid rgba(83,74,183,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: 1.5 }}>내 사이트</div>
          </div>

          {/* 카테고리 목록 */}
          <div style={{ flex: 1, padding: '8px' }}>
            {/* 전체 */}
            <div
              onClick={() => handleCatChange(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                background: !activeCat ? C.primaryLight : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (activeCat) e.currentTarget.style.background = '#f8f7ff' }}
              onMouseLeave={e => { if (activeCat) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>📋</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: !activeCat ? 700 : 500, color: !activeCat ? C.primary : '#555' }}>전체</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: !activeCat ? C.primary : '#ccc' }}>{sites.length}</span>
            </div>
            {/* 동적 카테고리 */}
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
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#f8f7ff' }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: on ? 700 : 500, color: on ? C.primary : '#555' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: on ? C.primary : '#ccc' }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>

          {/* 하단: 사이트 추가 버튼 */}
          <div style={{ padding: '12px' }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 8,
                border: `1px dashed rgba(83,74,183,0.3)`,
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

        {/* ── 메인 콘텐츠 ── */}
        <main style={{ flex: 1, minWidth: 0, minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>

          {/* 헤더 */}
          <div style={{
            padding: '20px 28px 16px', background: C.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>
                {activeLabel}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {sorted.length}개 사이트
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 컬렉션 만들기 */}
              <button
                onClick={() => setShowCreateCollection(true)}
                style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.primary}`, background: '#fff', color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                ⊞ 컬렉션
              </button>
              {/* 검색 */}
              <input
                type="text"
                placeholder="사이트 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, border: '1px solid #e0dff8', outline: 'none', background: '#fff', width: 160, boxSizing: 'border-box' }}
              />

              {/* 레이아웃 토글 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', border: C.cardBorder, borderRadius: 10, padding: '3px' }}>
                {LAYOUT_OPTIONS.map(({ type, icon, label }) => {
                  const on = layoutType === type
                  return (
                    <button
                      key={type}
                      onClick={() => setLayoutType(type)}
                      title={`레이아웃 ${label}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 10px', borderRadius: 7, border: 'none',
                        background: on ? C.primary : 'transparent',
                        color: on ? '#fff' : '#888',
                        fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 12 }}>{icon}</span>
                      <span style={{ fontSize: 11 }}>{label}</span>
                    </button>
                  )
                })}
                <div style={{ width: '0.5px', height: 20, background: 'rgba(83,74,183,0.12)', margin: '0 2px' }} />
                <button
                  onClick={() => navigate('/settings/layout')}
                  style={{ padding: '5px 8px', borderRadius: 7, border: 'none', background: 'transparent', color: '#aaa', fontSize: 13, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = C.primary}
                  onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
                >···</button>
              </div>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {/* 전체 탭 */}
              <button
                onClick={() => handleCatChange(null)}
                style={{
                  padding: '5px 14px', borderRadius: 999, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: !activeCat ? C.primary : '#fff',
                  color:      !activeCat ? '#fff'    : '#666',
                  boxShadow:  !activeCat ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                전체 <span style={{ marginLeft: 4, opacity: 0.7, fontWeight: 500 }}>{sites.length}</span>
              </button>
              {/* 동적 카테고리 탭 */}
              {categories.map(cat => {
                const on    = activeCat === cat.name
                const count = sites.filter(s => s.category === cat.name).length
                if (count === 0) return null
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCatChange(cat.name)}
                    style={{
                      padding: '5px 14px', borderRadius: 999, border: 'none',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: on ? C.primary : '#fff',
                      color:      on ? '#fff'    : '#666',
                      boxShadow:  on ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                    }}
                  >
                    {cat.name} <span style={{ marginLeft: 4, opacity: 0.7, fontWeight: 500 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* 서브카테고리 탭 */}
            {subcats.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                <button
                  onClick={() => setActiveSubcat(null)}
                  style={{
                    padding: '3px 12px', borderRadius: 999,
                    border: `1px solid ${!activeSubcat ? C.primary : '#e0dff8'}`,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: !activeSubcat ? C.primaryLight : '#fff',
                    color:      !activeSubcat ? C.primary       : '#888',
                  }}
                >
                  전체
                </button>
                {subcats.map(sub => {
                  const on = activeSubcat === sub.name
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubcat(sub.name)}
                      style={{
                        padding: '3px 12px', borderRadius: 999,
                        border: `1px solid ${on ? C.primary : '#e0dff8'}`,
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        background: on ? C.primaryLight : '#fff',
                        color:      on ? C.primary      : '#888',
                      }}
                    >
                      {sub.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 테이블 */}
          <div style={{ margin: '0 24px 24px', background: '#fff', borderRadius: C.cardRadius, border: C.cardBorder, overflow: 'hidden', flex: 1 }}>

            {/* 컬럼 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 20px',
              background: '#faf9ff',
              borderBottom: '0.5px solid rgba(83,74,183,0.08)',
            }}>
              <div style={{ width: 28, flexShrink: 0 }} />
              <SortHeader label="사이트명"    field="name"          sortField={sortField} sortDir={sortDir} onSort={toggleSort} style={{ flex: 3 }} />
              <div style={{ width: 100, flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#999' }}>카테고리</div>
              <SortHeader label="마지막 방문" field="lastVisitedAt" sortField={sortField} sortDir={sortDir} onSort={toggleSort} style={{ width: 80, flexShrink: 0 }} />
              <SortHeader label="상태"        field="status"        sortField={sortField} sortDir={sortDir} onSort={toggleSort} style={{ width: 60, flexShrink: 0 }} />
              <div style={{ width: 90, flexShrink: 0 }} />
            </div>

            {/* 행 */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
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
                <p style={{ fontSize: 14, color: '#666', margin: '0 0 4px' }}>
                  {search ? `'${search}' 검색 결과가 없어요.` : activeCat ? `'${activeCat}' 카테고리에 사이트가 없어요.` : '아직 등록된 사이트가 없어요.'}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowAdd(true)}
                    style={{ marginTop: 16, background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
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
        <AddSiteModal
          initial={editingSite}
          onClose={() => setEditingSite(null)}
          onSave={(data) => updateSite(editingSite.id, data)}
        />
      )}
      {showCreateCollection && (
        <CreateCollectionModal
          onClose={() => setShowCreateCollection(false)}
          onSave={createCollection}
          sites={sites}
        />
      )}
    </div>
  )
}
