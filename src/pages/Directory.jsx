import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { useDirectory } from '../hooks/useDirectory'
import { useCategories } from '../hooks/useCategories'
import { FaviconImg } from '../utils/favicon'

const C = {
  primary:      '#534AB7',
  primaryLight: '#EEEDFE',
  bg:           '#f5f4ff',
  dark:         '#2d2a6e',
  cardBorder:   '0.5px solid rgba(83,74,183,0.12)',
  cardRadius:   '14px',
  btnRadius:    '10px',
}


// ─────────────────────────────────────────────
// Site card
// ─────────────────────────────────────────────
function SiteCard({ site }) {
  const navigate  = useNavigate()
  const [hov, setHov] = useState(false)
  const isPremium = site.adType === 'premium'
  const desc      = site.shortDesc || site.description || ''
  const tags      = Array.isArray(site.tags) ? site.tags.slice(0, 3) : []

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: isPremium ? `1.5px solid ${C.primary}` : C.cardBorder,
        borderRadius: C.cardRadius,
        padding: '18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'all 0.18s', position: 'relative',
        transform:  hov ? 'translateY(-3px)' : 'none',
        boxShadow:  isPremium
          ? (hov ? '0 10px 32px rgba(83,74,183,0.28)' : '0 4px 20px rgba(83,74,183,0.18)')
          : (hov ? '0 8px 24px rgba(83,74,183,0.13)' : '0 1px 6px rgba(0,0,0,0.04)'),
      }}
    >
      {/* 뱃지 */}
      {isPremium && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
          background: C.primary, color: '#fff',
          borderRadius: 4, padding: '2px 7px',
        }}>PREMIUM</span>
      )}
      {!isPremium && site.isAd && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 9, fontWeight: 700, color: '#999',
          background: '#f0f0f0', borderRadius: 4, padding: '1px 5px',
        }}>AD</span>
      )}

      {/* 헤더: 파비콘 + 이름 + 카테고리 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FaviconImg
          url={site.url}
          style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: '#f5f4ff', flexShrink: 0 }}
          fallback={<span style={{ fontSize: 26, flexShrink: 0 }}>{site.icon || '🌐'}</span>}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, borderRadius: 999, padding: '1px 7px',
            background: C.primaryLight, color: C.primary,
          }}>
            {Array.isArray(site.category) ? site.category.join(', ') : site.category}
          </span>
        </div>
      </div>

      {/* 한줄 소개 */}
      {desc && (
        <div style={{ fontSize: 12, color: '#777', lineHeight: 1.55, flex: 1 }}>{desc}</div>
      )}

      {/* 태그 */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: '#aaa',
              background: '#f8f7ff', borderRadius: 4, padding: '2px 6px',
            }}>
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* 버튼 2개 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button
          onClick={() => navigate(`/directory/${site.id}`)}
          style={{
            flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600,
            borderRadius: 8, border: `1px solid ${C.primary}`,
            background: '#fff', color: C.primary, cursor: 'pointer',
          }}
        >
          상세보기
        </button>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600,
            borderRadius: 8, border: 'none',
            background: C.primary, color: '#fff',
            textDecoration: 'none', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          바로가기 →
        </a>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Directory page
// ─────────────────────────────────────────────
export default function Directory() {
  const { sites, loading }    = useDirectory()
  const { categories }        = useCategories()
  const [activeCat, setActiveCat] = useState(null) // null = 전체

  const filtered = activeCat
    ? sites.filter(s => Array.isArray(s.category) ? s.category.includes(activeCat) : s.category === activeCat)
    : sites

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>DIRECTORY</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: C.dark, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            오늘 발견할 유용한 사이트
          </h1>
          <p style={{ fontSize: 15, color: '#888', margin: 0 }}>로그인 없이도 누구나 탐색할 수 있어요</p>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          {/* 전체 탭 */}
          <button
            onClick={() => setActiveCat(null)}
            style={{
              padding: '8px 18px', borderRadius: 999, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: !activeCat ? C.primary : '#fff',
              color:      !activeCat ? '#fff'    : '#666',
              boxShadow:  !activeCat ? 'none' : '0 1px 5px rgba(0,0,0,0.07)',
            }}
          >
            전체
          </button>
          {/* 동적 카테고리 탭 */}
          {categories.map(cat => {
            const on = activeCat === cat.name
            return (
              <button key={cat.id} onClick={() => setActiveCat(cat.name)} style={{
                padding: '8px 18px', borderRadius: 999, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: on ? C.primary : '#fff',
                color:      on ? '#fff'    : '#666',
                boxShadow:  on ? 'none' : '0 1px 5px rgba(0,0,0,0.07)',
              }}>
                {cat.emoji} {cat.name}
              </button>
            )
          })}
        </div>

        {/* 카드 그리드 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filtered.map(site => <SiteCard key={site.id} site={site} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#666', margin: '0 0 4px' }}>
              {activeCat ? `'${activeCat}' 카테고리의 사이트가 없어요.` : '아직 등록된 사이트가 없어요.'}
            </p>
            {!activeCat && <p style={{ fontSize: 13, margin: 0 }}>관리자가 사이트를 준비 중입니다.</p>}
          </div>
        )}
      </main>
    </div>
  )
}
