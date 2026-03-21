import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../common/Navbar'
import AddSiteModal from '../common/AddSiteModal'
import CreateCollectionModal from '../collections/CreateCollectionModal'
import { FaviconImg } from '../../utils/favicon'
import { STATUS_STYLE } from '../../lib/constants'

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

const SIDEBAR_CATS = [
  { label: '전체',  emoji: '📋', cat: null             },
  { label: '업무',  emoji: '💼', cat: '업무'           },
  { label: 'SNS',  emoji: '📱', cat: 'SNS'            },
  { label: '쇼핑',  emoji: '🛍',  cat: '쇼핑'          },
  { label: '금융',  emoji: '💳',  cat: '금융'          },
  { label: '개발',  emoji: '💻',  cat: '개발'          },
  { label: '엔터',  emoji: '🎬',  cat: '엔터테인먼트'  },
  { label: '기타',  emoji: '📁',  cat: '기타'          },
]

// 활성/휴면 상태 점 색상
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

// ─────────────────────────────────────────────
// Mini Card (120px min)
// ─────────────────────────────────────────────
function MiniCard({ site, onOpen }) {
  const [hov, setHov]  = useState(false)
  const status         = site.status ?? 'active'
  const dotColor       = DOT_COLOR[status] ?? DOT_COLOR.active

  return (
    <div
      onClick={() => onOpen(site)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
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
        style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', background: '#f5f4ff' }}
        fallback={
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌐</div>
        }
      />
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {site.name}
        </div>
        <div style={{ fontSize: 9, color: '#ccc', marginTop: 2 }}>
          {relativeDate(site.lastVisitedAt)}
        </div>
      </div>
      {/* 상태 점 */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Category Section (접기/펼치기)
// ─────────────────────────────────────────────
function CategorySection({ label, emoji, sites, onOpen, collapsed, onToggle }) {
  const [hov, setHov] = useState(false)

  return (
    <div style={{ marginBottom: 12 }}>
      {/* 섹션 헤더 */}
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 18px',
          background: hov ? '#f8f7ff' : '#fff',
          border: C.cardBorder,
          borderRadius: collapsed ? C.cardRadius : `${C.cardRadius} ${C.cardRadius} 0 0`,
          cursor: 'pointer', userSelect: 'none', transition: 'background 0.12s',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{label}</span>
        <span style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>· {sites.length}개</span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 11, color: '#bbb',
          display: 'inline-block',
          transition: 'transform 0.2s',
          transform: collapsed ? 'rotate(-90deg)' : 'none',
        }}>▼</span>
      </div>

      {/* 미니 카드 그리드 */}
      {!collapsed && (
        <div style={{
          background: '#fff',
          border: C.cardBorder, borderTop: 'none',
          borderRadius: `0 0 ${C.cardRadius} ${C.cardRadius}`,
          padding: '14px 16px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: 10,
          }}>
            {sites.map(site => (
              <MiniCard key={site.id} site={site} onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Layout C — 사이드바 + 폴더 뷰
// ─────────────────────────────────────────────
export default function LayoutC({ sites, loading, addSite, updateLastVisited, layoutType, setLayoutType, createCollection }) {
  const navigate = useNavigate()
  const [activeCat, setActiveCat]   = useState(null)
  const [search, setSearch]         = useState('')
  const [collapsed, setCollapsed]   = useState(new Set())
  const [showAdd, setShowAdd]       = useState(false)
  const [showCreateCollection, setShowCreateCollection] = useState(false)

  // 필터
  const q            = search.trim().toLowerCase()
  const filteredSites = sites
    .filter(s => !activeCat || s.category === activeCat)
    .filter(s => !q || s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))

  // 보여줄 섹션 결정
  const rawSections = activeCat
    ? [SIDEBAR_CATS.find(c => c.cat === activeCat)].filter(Boolean)
    : SIDEBAR_CATS.filter(c => c.cat !== null)

  const sections = rawSections
    .map(({ label, emoji, cat }) => ({
      label, emoji, cat,
      sites: filteredSites.filter(s => s.category === cat),
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
  const toggleAll    = () => {
    setCollapsed(allCollapsed ? new Set() : new Set(sections.map(s => s.label)))
  }

  const catCount   = (cat) => cat ? sites.filter(s => s.category === cat).length : sites.length
  const activeLabel = SIDEBAR_CATS.find(c => c.cat === activeCat)?.label ?? '전체'
  const totalShown  = filteredSites.length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex' }}>

        {/* ── 사이드바 (LayoutB와 동일 구조) ── */}
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
          <div style={{ padding: '20px 16px 12px', borderBottom: '0.5px solid rgba(83,74,183,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: 1.5 }}>내 사이트</div>
          </div>

          <div style={{ flex: 1, padding: '8px' }}>
            {SIDEBAR_CATS.map(({ label, emoji, cat }) => {
              const on    = activeCat === cat
              const count = catCount(cat)
              if (count === 0 && cat !== null) return null
              return (
                <div
                  key={label}
                  onClick={() => { setActiveCat(cat); setCollapsed(new Set()) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 1,
                    background: on ? C.primaryLight : 'transparent', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#f8f7ff' }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: on ? 700 : 500, color: on ? C.primary : '#555' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: on ? C.primary : '#ccc' }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
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
            <button
              onClick={() => setShowCreateCollection(true)}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 8,
                border: `1px solid rgba(83,74,183,0.25)`,
                background: 'transparent', color: C.primary,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              ⊞ 컬렉션
            </button>
          </div>
        </aside>

        {/* ── 메인 콘텐츠 ── */}
        <main style={{ flex: 1, minWidth: 0, minHeight: 'calc(100vh - 60px)' }}>

          {/* 헤더 */}
          <div style={{
            padding: '20px 28px 16px', background: C.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{activeLabel}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{totalShown}개 사이트</div>
              </div>
              {/* 모두 접기 / 펼치기 */}
              {sections.length > 1 && (
                <button
                  onClick={toggleAll}
                  style={{
                    padding: '5px 12px', borderRadius: 7, border: C.cardBorder,
                    background: '#fff', color: '#888', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {allCollapsed ? '모두 펼치기' : '모두 접기'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

          {/* 폴더 섹션 */}
          <div style={{ padding: '4px 24px 32px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
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
                <p style={{ fontSize: 15, fontWeight: 600, color: '#555', margin: '0 0 6px' }}>
                  {search ? `'${search}' 검색 결과가 없어요.` : '아직 등록된 사이트가 없어요.'}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowAdd(true)}
                    style={{ marginTop: 10, background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
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
