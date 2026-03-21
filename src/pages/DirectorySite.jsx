import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import { useDirectorySite, incrementViewCount, fetchSitesByIds } from '../hooks/useDirectory'
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

// \n 을 <br>로 렌더링
function TextContent({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
      ))}
    </>
  )
}

// 관련 사이트 미니 카드
function RelatedCard({ site }) {
  return (
    <div style={{
      background: '#fff', border: C.cardBorder, borderRadius: 12,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      transition: 'box-shadow 0.15s',
    }}>
      <FaviconImg
        url={site.url}
        style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', flexShrink: 0 }}
        fallback={<span style={{ fontSize: 24, flexShrink: 0 }}>{site.icon || '🌐'}</span>}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {site.name}
        </div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
          {site.shortDesc || site.description || site.category}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main detail page
// ─────────────────────────────────────────────
export default function DirectorySite() {
  const { siteId }              = useParams()
  const navigate                = useNavigate()
  const { site, loading }       = useDirectorySite(siteId)
  const [related, setRelated]   = useState([])

  // 조회수 +1 (마운트 시 1회)
  useEffect(() => {
    if (siteId) incrementViewCount(siteId)
  }, [siteId])

  // 관련 사이트 fetch
  useEffect(() => {
    const ids = site?.relatedSites
    if (ids?.length) {
      fetchSitesByIds(ids).then(setRelated)
    } else {
      setRelated([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?.relatedSites?.join(',')])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa', fontSize: 14 }}>불러오는 중...</div>
      </div>
    )
  }

  if (!site) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
          <p style={{ fontSize: 16, color: '#666', margin: '0 0 20px' }}>사이트를 찾을 수 없어요.</p>
          <button onClick={() => navigate('/directory')} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            디렉토리로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const isPremium = site.adType === 'premium'
  const tags      = Array.isArray(site.tags) ? site.tags : []
  const desc      = site.shortDesc || site.description || ''
  const howToUseLines = site.howToUse
    ? site.howToUse.split('\n').filter(l => l.trim())
    : []

  const sectionCard = {
    background: '#fff', border: C.cardBorder, borderRadius: C.cardRadius,
    padding: '28px 32px', marginBottom: 16,
  }
  const sectionTitle = {
    fontSize: 18, fontWeight: 800, color: C.dark, margin: '0 0 18px',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/directory')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, fontWeight: 500, padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← 디렉토리로
        </button>

        {/* ── 헤더 카드 ─────────────────────── */}
        <div style={{
          ...sectionCard,
          border: isPremium ? `1.5px solid ${C.primary}` : C.cardBorder,
          boxShadow: isPremium ? '0 4px 24px rgba(83,74,183,0.15)' : 'none',
          display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
        }}>
          {/* 파비콘 */}
          <div style={{ width: 64, height: 64, borderRadius: 14, background: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            <FaviconImg
              url={site.url}
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              fallback={<span style={{ fontSize: 32 }}>{site.icon || '🌐'}</span>}
            />
          </div>

          {/* 텍스트 */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.dark, margin: 0 }}>{site.name}</h1>
              {isPremium && (
                <span style={{ fontSize: 10, fontWeight: 800, background: C.primary, color: '#fff', borderRadius: 4, padding: '2px 8px', letterSpacing: 0.8 }}>PREMIUM</span>
              )}
              {!isPremium && site.isAd && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#f0f0f0', color: '#999', borderRadius: 4, padding: '2px 6px' }}>AD</span>
              )}
            </div>

            {/* 카테고리 + 태그 */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, background: C.primaryLight, color: C.primary, borderRadius: 999, padding: '3px 10px' }}>
                {site.category}
              </span>
              {tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, color: '#888', background: '#f8f7ff', borderRadius: 999, padding: '3px 10px' }}>
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 14, color: '#666', margin: '0 0 18px', lineHeight: 1.6 }}>{desc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: C.primary, color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: C.btnRadius, fontSize: 14, fontWeight: 700 }}
              >
                바로가기 →
              </a>
              <span style={{ fontSize: 12, color: '#ccc' }}>👁 {site.viewCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* ── 광고 배너 ─────────────────────── */}
        {site.isAd && site.adBannerUrl && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{
              position: 'absolute', top: 8, right: 8, zIndex: 1,
              fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.92)',
              padding: '2px 8px', borderRadius: 4, fontWeight: 600,
            }}>광고</span>
            <a href={site.adBannerLink || site.url} target="_blank" rel="noopener noreferrer">
              <img
                src={site.adBannerUrl}
                alt="광고 배너"
                style={{ width: '100%', borderRadius: C.cardRadius, display: 'block', objectFit: 'cover' }}
              />
            </a>
          </div>
        )}

        {/* ── 서비스 소개 ───────────────────── */}
        {site.fullDesc && (
          <div style={sectionCard}>
            <h2 style={sectionTitle}>서비스 소개</h2>
            <div style={{ fontSize: 14, color: '#555', lineHeight: 1.85 }}>
              <TextContent text={site.fullDesc} />
            </div>
          </div>
        )}

        {/* ── 이용 방법 ─────────────────────── */}
        {howToUseLines.length > 0 && (
          <div style={sectionCard}>
            <h2 style={sectionTitle}>이용 방법</h2>
            <ol style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {howToUseLines.map((line, i) => (
                <li key={i} style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>
                  {line.replace(/^\d+[.)]\s*/, '')}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── 스크린샷 ──────────────────────── */}
        {site.screenshots?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>스크린샷</h2>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {site.screenshots.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`스크린샷 ${i + 1}`}
                  style={{ height: 220, borderRadius: 10, objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 14px rgba(0,0,0,0.1)' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 관련 사이트 ───────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>관련 사이트</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {related.map(s => (
                <Link key={s.id} to={`/directory/${s.id}`} style={{ textDecoration: 'none' }}>
                  <RelatedCard site={s} />
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── 하단 고정 바 ──────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: '0.5px solid rgba(83,74,183,0.1)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {site.name}
          </div>
          <div style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {desc}
          </div>
        </div>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: C.primary, color: '#fff', textDecoration: 'none', padding: '11px 26px', borderRadius: C.btnRadius, fontSize: 14, fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 12px rgba(83,74,183,0.3)' }}
        >
          바로가기 →
        </a>
      </div>
    </div>
  )
}
