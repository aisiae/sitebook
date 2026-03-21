import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../common/Navbar'
import AddSiteModal from '../common/AddSiteModal'
import CreateCollectionModal from '../collections/CreateCollectionModal'
import { FaviconImg } from '../../utils/favicon'
import { useAuth } from '../../hooks/useAuth'
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

// ─────────────────────────────────────────────
// Site Card (compact, 160px min)
// ─────────────────────────────────────────────
function SiteCard({ site, onOpen, onEdit, onDelete }) {
  const [hov, setHov]               = useState(false)
  const [confirmDelete, setConfirm] = useState(false)
  const status = site.status ?? 'active'

  const stopProp = (fn) => (e) => { e.stopPropagation(); fn() }

  return (
    <div
      onClick={() => !confirmDelete && onOpen(site)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false) }}
      style={{
        background: '#fff', border: C.cardBorder, borderRadius: C.cardRadius,
        padding: '14px', cursor: 'pointer', position: 'relative',
        transition: 'all 0.18s',
        transform:  hov ? 'translateY(-2px)' : 'none',
        boxShadow:  hov ? '0 6px 20px rgba(83,74,183,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0,
      }}
    >
      {/* 수정 / 삭제 버튼 — hover 시만 표시 */}
      {hov && !confirmDelete && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 3, zIndex: 1 }}>
          <button
            onClick={stopProp(() => onEdit(site))}
            style={{ width: 22, height: 22, borderRadius: 5, border: 'none', background: 'rgba(83,74,183,0.12)', color: C.primary, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✎</button>
          <button
            onClick={stopProp(() => setConfirm(true))}
            style={{ width: 22, height: 22, borderRadius: 5, border: 'none', background: 'rgba(229,57,53,0.1)', color: '#e53935', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>
      )}

      {/* 삭제 확인 오버레이 */}
      {confirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.97)', borderRadius: C.cardRadius, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 2 }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>삭제할까요?</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConfirm(false)}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e0dff8', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#666' }}
            >
              취소
            </button>
            <button
              onClick={() => onDelete(site.id)}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#e53935', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 파비콘 + 이름 + 카테고리 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingRight: hov ? 52 : 0 }}>
        <FaviconImg
          url={site.url}
          style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', background: '#f5f4ff', flexShrink: 0 }}
          fallback={
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🌐</div>
          }
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, background: C.primaryLight, color: C.primary, borderRadius: 999, padding: '2px 7px', display: 'inline-block', marginTop: 3 }}>
            {site.category}
          </span>
        </div>
      </div>

      {/* 마지막 접속일 + 상태 배지 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: 10, color: '#bbb' }}>{relativeDate(site.lastVisitedAt)}</span>
        <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 999, padding: '2px 7px', ...STATUS_STYLE[status] }}>
          {STATUS_LABEL[status]}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Layout A — 미니멀 카드 그리드
// ─────────────────────────────────────────────
export default function LayoutA({ sites, loading, addSite, updateSite, updateLastVisited, deleteSite, layoutType, setLayoutType, createCollection }) {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const { categories } = useCategories()
  const [activeCat, setActiveCat]     = useState(null)   // null = 전체
  const [activeSubcat, setActiveSubcat] = useState(null) // null = 전체
  const [search, setSearch]           = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [editingSite, setEditingSite] = useState(null)
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  // 통계
  const total   = sites.length
  const active  = sites.filter(s => (s.status ?? 'active') === 'active').length
  const dormant = sites.filter(s => s.status === 'dormant').length

  // 선택된 카테고리의 서브카테고리
  const activeCatObj = categories.find(c => c.name === activeCat)
  const subcats = activeCatObj?.subcategories ?? []

  // 카테고리 변경 시 서브카테고리 리셋
  const handleCatChange = (catName) => { setActiveCat(catName); setActiveSubcat(null) }

  // 필터링
  const q        = search.trim().toLowerCase()
  const filtered = sites
    .filter(s => !activeCat    || s.category    === activeCat)
    .filter(s => !activeSubcat || s.subcategory === activeSubcat)
    .filter(s => !q  || s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))

  const handleOpen = async (site) => {
    const url = site.url.startsWith('http') ? site.url : `https://${site.url}`
    window.open(url, '_blank', 'noopener,noreferrer')
    await updateLastVisited(site.id)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── 헤더: 인사말 + 레이아웃 토글 + 추가 버튼 ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.dark, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              안녕하세요, {user?.displayName}님
            </h2>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>내 사이트를 관리하고 유용한 사이트를 탐색해보세요.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                      fontSize: 13, fontWeight: on ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.15s',
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
                title="레이아웃 상세 선택"
                style={{ padding: '5px 8px', borderRadius: 7, border: 'none', background: 'transparent', color: '#aaa', fontSize: 13, cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.primary}
                onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
              >···</button>
            </div>

            {/* 컬렉션 만들기 */}
            <button
              onClick={() => setShowCreateCollection(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: C.primary, border: `1px solid ${C.primary}`, borderRadius: C.btnRadius, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              ⊞ 컬렉션 만들기
            </button>
            {/* 사이트 추가 */}
            <button
              onClick={() => setShowAdd(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(83,74,183,0.3)' }}
            >
              + 사이트 추가
            </button>
          </div>
        </div>

        {/* ── 통계 카드 3개 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: '전체 등록 사이트', value: total,   emoji: '📌' },
            { label: '활성 사이트',      value: active,  emoji: '✅' },
            { label: '휴면 사이트',      value: dormant, emoji: '😴' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: C.cardBorder, borderRadius: C.cardRadius, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>{s.emoji}</span>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── 탭 + 검색 ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {/* 전체 탭 */}
              <button
                onClick={() => handleCatChange(null)}
                style={{
                  padding: '6px 14px', borderRadius: 999, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: !activeCat ? C.primary : '#fff',
                  color:      !activeCat ? '#fff'    : '#666',
                  boxShadow:  !activeCat ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                전체
              </button>
              {/* 동적 카테고리 탭 */}
              {categories.map(cat => {
                const on = activeCat === cat.name
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCatChange(cat.name)}
                    style={{
                      padding: '6px 14px', borderRadius: 999, border: 'none',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: on ? C.primary : '#fff',
                      color:      on ? '#fff'    : '#666',
                      boxShadow:  on ? 'none' : '0 1px 4px rgba(0,0,0,0.07)',
                    }}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                )
              })}
            </div>
            {/* 검색창 */}
            <input
              type="text"
              placeholder="사이트 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 13,
                border: '1px solid #e0dff8', outline: 'none',
                background: '#fff', width: 160, boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 서브카테고리 탭 (해당 카테고리에 서브카테고리가 있을 때) */}
          {subcats.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, paddingLeft: 2 }}>
              <button
                onClick={() => setActiveSubcat(null)}
                style={{
                  padding: '4px 12px', borderRadius: 999,
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
                      padding: '4px 12px', borderRadius: 999,
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

        {/* ── 카드 그리드 ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {filtered.map(site => (
              <SiteCard
                key={site.id}
                site={site}
                onOpen={handleOpen}
                onEdit={setEditingSite}
                onDelete={deleteSite}
              />
            ))}
          </div>
        ) : (
          <div style={{ background: '#fff', border: C.cardBorder, borderRadius: C.cardRadius, padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{search ? '🔍' : '📂'}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#555', margin: '0 0 6px' }}>
              {search ? `'${search}' 검색 결과가 없어요.` : activeCat ? `'${activeCat}' 카테고리에 등록된 사이트가 없어요.` : '아직 등록된 사이트가 없어요.'}
            </p>
            {!search && !activeCat && (
              <>
                <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 20px' }}>사이트를 추가해서 시작해보세요.</p>
                <button
                  onClick={() => setShowAdd(true)}
                  style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  + 사이트 추가
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {showAdd && (
        <AddSiteModal onClose={() => setShowAdd(false)} onSave={addSite} />
      )}
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
