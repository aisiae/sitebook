import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import CollectionCard from '../components/collections/CollectionCard'
import { useAuthContext } from '../store/authContext'
import { fetchPublicCollections } from '../hooks/useCollections'

const C = {
  primary:      '#534AB7',
  primaryLight: '#EEEDFE',
  dark:         '#2d2a6e',
  bg:           '#f5f4ff',
  cardBorder:   '0.5px solid rgba(83,74,183,0.12)',
}

const SORT_OPTIONS = [
  { key: 'newest',   label: '최신순'      },
  { key: 'popular',  label: '인기순'      },
  { key: 'saved',    label: '저장 많은순' },
]

function sortCollections(list, key) {
  return [...list].sort((a, b) => {
    if (key === 'newest') {
      return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    }
    if (key === 'popular') return (b.likeCount ?? 0) - (a.likeCount ?? 0)
    if (key === 'saved')   return (b.saveCount ?? 0) - (a.saveCount ?? 0)
    return 0
  })
}

export default function CollectionsExplore() {
  const navigate      = useNavigate()
  const { user }      = useAuthContext()

  const [collections, setCollections] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [sort, setSort]               = useState('newest')

  useEffect(() => {
    fetchPublicCollections()
      .then(data => { setCollections(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? collections.filter(c =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.authorName?.toLowerCase().includes(q)
        )
      : collections
    return sortCollections(base, sort)
  }, [collections, search, sort])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── 헤더 ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 10 }}>COLLECTIONS</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: C.dark, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                컬렉션 탐색
              </h1>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
                사람들이 공유한 사이트 컬렉션을 발견해보세요.
              </p>
            </div>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/')}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: C.primary, color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(83,74,183,0.28)',
              }}
            >
              ⊞ 내 컬렉션 만들기
            </button>
          </div>
        </div>

        {/* ── 검색 + 정렬 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {/* 검색 */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#bbb' }}>🔍</span>
            <input
              type="text"
              placeholder="컬렉션 제목, 설명, 작성자 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                borderRadius: 9, fontSize: 13,
                border: '1px solid #e0dff8', outline: 'none',
                background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 정렬 탭 */}
          <div style={{ display: 'flex', gap: 4, background: '#fff', border: C.cardBorder, borderRadius: 10, padding: '3px' }}>
            {SORT_OPTIONS.map(({ key, label }) => {
              const on = sort === key
              return (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  style={{
                    padding: '6px 14px', borderRadius: 7, border: 'none',
                    background: on ? C.primary : 'transparent',
                    color:      on ? '#fff'    : '#888',
                    fontSize: 12, fontWeight: on ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {!loading && (
            <span style={{ fontSize: 12, color: '#bbb', marginLeft: 'auto' }}>
              {filtered.length}개
            </span>
          )}
        </div>

        {/* ── 카드 그리드 ── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, height: 220, border: C.cardBorder, opacity: 0.5 + i * 0.05 }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {filtered.map(col => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>{search ? '🔍' : '📭'}</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#555', margin: '0 0 8px' }}>
              {search ? `'${search}' 검색 결과가 없어요.` : '아직 공개 컬렉션이 없어요.'}
            </p>
            <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 24px' }}>
              첫 번째 컬렉션을 만들어보세요!
            </p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/')}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              컬렉션 만들기
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
