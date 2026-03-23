import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { FaviconImg } from '../utils/favicon'
import { useAuthContext } from '../store/authContext'
import { useSites } from '../hooks/useSites'
import { useTheme } from '../store/themeContext'
import {
  fetchCollectionBySlug,
  incrementViewCount,
  incrementSaveCount,
  toggleLike,
  checkLiked,
} from '../hooks/useCollections'

function hostname(url) {
  try {
    const href = url?.startsWith('http') ? url : `https://${url}`
    return new URL(href).hostname.replace('www.', '')
  } catch { return url ?? '' }
}

function SiteCard({ site, isAdded, onAdd, onOpen, user }) {
  const C = useTheme()
  const [hov, setHov] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e) => {
    e.stopPropagation()
    setAdding(true)
    await onAdd(site)
    setAdding(false)
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.cardBg,
        border: hov ? `1.5px solid ${C.primary}` : C.cardBorder,
        borderRadius: C.cardRadius,
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        transition: 'all 0.15s',
        boxShadow: hov
          ? (C.isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(83,74,183,0.12)')
          : (C.isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)'),
      }}
    >
      <FaviconImg
        url={site.url}
        style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain', background: C.bg, flexShrink: 0 }}
        fallback={
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🌐</div>
        }
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, background: C.primaryLight, color: C.primary, borderRadius: 999, padding: '2px 7px', flexShrink: 0 }}>
            {site.category}
          </span>
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hostname(site.url)}{site.memo ? ` · ${site.memo}` : ''}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => onOpen(site.url)}
          style={{
            padding: '7px 14px', borderRadius: 8,
            border: C.cardBorder, background: C.cardBg,
            color: C.textSub, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = C.textSub }}
        >
          바로가기 →
        </button>

        {user ? (
          <button
            onClick={handleAdd}
            disabled={isAdded || adding}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: isAdded ? (C.isDark ? '#1a3a0a' : '#EAF3DE') : C.primary,
              color:      isAdded ? (C.isDark ? '#6dbf40' : '#3B6D11') : '#fff',
              fontSize: 12, fontWeight: 600,
              cursor: isAdded ? 'default' : 'pointer',
              opacity: adding ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
          >
            {adding ? '추가 중...' : isAdded ? '✓ 추가됨' : '+ 내 목록에 추가'}
          </button>
        ) : (
          <button
            onClick={() => onAdd(null)}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: `1px solid ${C.primary}`, background: C.cardBg,
              color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            로그인 후 추가
          </button>
        )}
      </div>
    </div>
  )
}

export default function CollectionShare() {
  const C             = useTheme()
  const { shareSlug } = useParams()
  const navigate      = useNavigate()
  const { user }      = useAuthContext()
  const { addSite }   = useSites()

  const [col, setCol]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [addedIds, setAddedIds]   = useState(new Set())
  const [copied, setCopied]       = useState(false)
  const viewCounted = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setNotFound(false)
      const data = await fetchCollectionBySlug(shareSlug)
      if (cancelled) return
      if (!data) { setNotFound(true); setLoading(false); return }
      setCol(data)
      setLikeCount(data.likeCount ?? 0)
      setLoading(false)

      if (!viewCounted.current) {
        viewCounted.current = true
        incrementViewCount(data.id)
      }

      if (user) {
        const isLiked = await checkLiked(data.id, user.uid)
        if (!cancelled) setLiked(isLiked)
      }
    }
    load()
    return () => { cancelled = true }
  }, [shareSlug, user?.uid])

  const handleLike = async () => {
    if (!user) { navigate('/'); return }
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(c => newLiked ? c + 1 : c - 1)
    await toggleLike(col.id, user.uid, liked)
  }

  const handleAddSite = async (site) => {
    if (!user) { navigate('/'); return }
    await addSite({ name: site.name, url: site.url, category: site.category, memo: site.memo ?? '' })
    setAddedIds(prev => new Set([...prev, site.id]))
    incrementSaveCount(col.id, 1)
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/c/${shareSlug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleTwitter = () => {
    const text = encodeURIComponent(`${col.title} 🔗`)
    const url  = encodeURIComponent(`${window.location.origin}/c/${shareSlug}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
          <div style={{ fontSize: 14, color: C.textMuted }}>불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Navbar />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: '0 0 10px' }}>컬렉션을 찾을 수 없어요</h2>
          <p style={{ fontSize: 14, color: C.textMuted, margin: '0 0 28px' }}>링크가 잘못되었거나 삭제된 컬렉션이에요.</p>
          <button
            onClick={() => navigate('/collections')}
            style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: C.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            다른 컬렉션 탐색하기
          </button>
        </div>
      </div>
    )
  }

  const sites       = col.siteSnapshots ?? []
  const siteCount   = sites.length
  const viewCount   = (col.viewCount ?? 0) + 1

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{ background: C.cardBg, borderRadius: 20, padding: '36px 36px 32px', marginBottom: 24, boxShadow: C.isDark ? '0 2px 20px rgba(0,0,0,0.4)' : '0 2px 20px rgba(83,74,183,0.08)', border: C.cardBorder }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            {col.authorPhoto ? (
              <img src={col.authorPhoto} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>{col.authorName || '익명'}</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.dark, margin: '0 0 10px', letterSpacing: '-0.5px', lineHeight: 1.25 }}>
            {col.title}
          </h1>

          {col.description && (
            <p style={{ fontSize: 15, color: C.textSub, margin: '0 0 20px', lineHeight: 1.6 }}>
              {col.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🔗', val: siteCount,  label: '사이트' },
              { icon: '👁', val: viewCount,  label: '조회'   },
              { icon: '❤',  val: likeCount,  label: '좋아요' },
              { icon: '📥', val: col.saveCount ?? 0, label: '저장' },
            ].map(({ icon, val, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{val}</span>
                <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9,
                border: `1.5px solid ${liked ? '#e53935' : C.subBorder}`,
                background: liked ? (C.isDark ? 'rgba(229,57,53,0.15)' : '#fff0f0') : C.cardBg,
                color: liked ? '#e53935' : C.textMuted,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {liked ? '❤' : '🤍'} {likeCount}
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9,
                border: `1.5px solid ${C.subBorder}`,
                background: copied ? C.primaryLight : C.cardBg,
                color: copied ? C.primary : C.textMuted,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {copied ? '✓ 복사됨' : '🔗 링크 복사'}
            </button>

            <button
              onClick={handleTwitter}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 9,
                border: `1.5px solid ${C.subBorder}`, background: C.cardBg,
                color: '#1DA1F2',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.isDark ? 'rgba(29,161,242,0.1)' : '#e8f5fe'; e.currentTarget.style.borderColor = '#1DA1F2' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.cardBg; e.currentTarget.style.borderColor = C.subBorder }}
            >
              𝕏 트위터 공유
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {sites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted, fontSize: 14 }}>
              사이트가 없어요.
            </div>
          ) : sites.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              user={user}
              isAdded={addedIds.has(site.id)}
              onAdd={handleAddSite}
              onOpen={(url) => {
                const href = url.startsWith('http') ? url : `https://${url}`
                window.open(href, '_blank', 'noopener,noreferrer')
              }}
            />
          ))}
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, #7B6FD4 100%)`,
          borderRadius: 20, padding: '36px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(83,74,183,0.25)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>✨</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            나만의 사이트 컬렉션을 만들어보세요
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 24px' }}>
            즐겨 쓰는 사이트들을 모아 친구들과 공유하세요.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            style={{
              padding: '12px 32px', borderRadius: 12, border: 'none',
              background: '#fff', color: C.primary,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            {user ? '⊞ 컬렉션 만들기' : '로그인하고 시작하기'}
          </button>
        </div>

      </main>
    </div>
  )
}
