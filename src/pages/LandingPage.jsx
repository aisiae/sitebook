import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDirectory } from '../hooks/useDirectory'
import { useCategories } from '../hooks/useCategories'
import { useTheme, useThemeControl } from '../store/themeContext'
import './LandingPage.css'

const FLOATING_CARDS = [
  { icon: '🛒', name: '쿠팡',       category: '쇼핑', lastVisit: '3일 전', status: 'active'  },
  { icon: '🐱', name: 'GitHub',     category: '개발', lastVisit: '오늘',   status: 'active'  },
  { icon: '🏦', name: '카카오뱅크', category: '금융', lastVisit: '2주 전', status: 'dormant' },
  { icon: '📝', name: 'Notion',     category: '업무', lastVisit: '오늘',   status: 'active'  },
  { icon: '📸', name: 'Instagram',  category: 'SNS',  lastVisit: '어제',   status: 'active'  },
]

const CARD_POSITIONS = [
  { top: '4%',   left: '2%',   rotate: '-8deg' },
  { top: '0%',   right: '1%',  rotate:  '6deg' },
  { top: '37%',  left: '-3%',  rotate: '-4deg' },
  { bottom: '6%', right: '2%', rotate:  '7deg' },
  { bottom: '14%', left: '26%', rotate: '-5deg' },
]

const FEATURES = [
  { icon: '📌', title: '사이트 등록',    desc: '가입한 사이트를 카테고리별로 깔끔하게 정리해요' },
  { icon: '🕐', title: '접속일 관리',    desc: '마지막 방문일을 자동으로 기록해 오래된 사이트를 파악해요' },
  { icon: '🔍', title: '사이트 큐레이션', desc: '엄선된 유용한 사이트를 카테고리별로 발견해요' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.01 17.64 11.702 17.64 9.2z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function FloatingCard({ card }) {
  const C      = useTheme()
  const active = card.status === 'active'
  return (
    <div style={{
      background: C.cardBg,
      border: C.cardBorder,
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 170,
      boxShadow: C.isDark ? '0 6px 24px rgba(0,0,0,0.4)' : '0 6px 24px rgba(83,74,183,0.12)',
      userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{card.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{card.name}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{card.category} · {card.lastVisit}</div>
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 600, borderRadius: 999, padding: '3px 10px',
        background: active ? '#EAF3DE' : '#FAEEDA',
        color:      active ? '#3B6D11' : '#854F0B',
      }}>
        {active ? '활성' : '휴면'}
      </span>
    </div>
  )
}

function StatItem({ emoji, num, label }) {
  const C = useTheme()
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 5 }}>{label}</div>
    </div>
  )
}

export default function LandingPage() {
  const { signInWithGoogle }                = useAuth()
  const { sites, loading: sitesLoading }    = useDirectory()
  const { categories }                      = useCategories()
  const C                                   = useTheme()
  const { isDark, toggleTheme }             = useThemeControl()
  const [activeTab, setActiveTab]           = useState(null)
  const [hoveredCard, setHoveredCard]       = useState(null)

  const filteredSites = sites.filter(s => {
    if (activeTab === null) return true
    return Array.isArray(s.category) ? s.category.includes(activeTab) : s.category === activeTab
  })

  const scrollToDirectory = () =>
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.textPrimary, background: C.bg, minHeight: '100vh' }}>

      {/* ── 1. NAVBAR ─────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: C.navBg,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: C.navBorder,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: C.dark, letterSpacing: '-0.5px' }}>SiteBook</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['내 사이트', '사이트 디렉토리'].map(m => (
              <a key={m} href="#" style={{ fontSize: 14, color: C.textSub, textDecoration: 'none', fontWeight: 500 }}>{m}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 다크모드 토글 */}
            <button
              onClick={toggleTheme}
              title={isDark ? '라이트 모드' : '다크 모드'}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.08)',
                color: C.primary, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isDark ? '☀' : '🌙'}
            </button>
            <button
              onClick={signInWithGoogle}
              style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: C.btnRadius, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              로그인
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO ───────────────────────────────── */}
      <section style={{ background: C.bg, position: 'relative', overflow: 'hidden', minHeight: 640, display: 'flex', alignItems: 'center', padding: '80px 24px' }}>
        <div style={{ position: 'absolute', top: -130, left: -130, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(123,116,224,0.12)' : 'rgba(83,74,183,0.13)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -150, right: -110, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(123,116,224,0.08)' : 'rgba(83,74,183,0.10)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 60, position: 'relative', zIndex: 1 }}>

          <div className="sitebook-hero-text" style={{ flex: '1 1 460px' }}>
            <span style={{
              display: 'inline-block', background: C.primaryLight, color: C.primary,
              fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '6px 16px',
              marginBottom: 22, letterSpacing: 0.4,
            }}>
              북마크 탈출 · 사이트 관리 솔루션
            </span>

            <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1px', margin: '0 0 18px', color: C.dark }}>
              내 사이트를{' '}
              <span style={{ color: C.primary }}>스마트하게</span>{' '}
              관리.
            </h1>

            <p style={{ fontSize: 16, color: C.textSub, lineHeight: 1.75, margin: '0 0 36px', maxWidth: 440 }}>
              가입한 모든 웹사이트를 카테고리별로 정리하고 마지막 접속일과 상태를 한눈에 파악하세요.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={signInWithGoogle}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: C.primary, color: '#fff', border: 'none',
                  borderRadius: C.btnRadius, padding: '14px 26px',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(83,74,183,0.38)',
                }}
              >
                <GoogleIcon /> Google로 무료 시작하기
              </button>
              <button
                onClick={scrollToDirectory}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: C.cardBg, color: C.primary,
                  border: `1.5px solid ${C.primary}`,
                  borderRadius: C.btnRadius, padding: '14px 26px',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ▶ 둘러보기
              </button>
            </div>
          </div>

          <div className="sitebook-hero-cards" style={{ flex: '0 0 420px', position: 'relative', height: 500 }}>
            {FLOATING_CARDS.map((card, i) => {
              const pos = CARD_POSITIONS[i]
              return (
                <div
                  key={card.name}
                  className="sitebook-float"
                  style={{ position: 'absolute', ...pos, transform: `rotate(${pos.rotate})` }}
                >
                  <FloatingCard card={card} />
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── 3. STATS BAR ─────────────────────────── */}
      <section style={{ background: C.cardBg, padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
        <div
          className="sitebook-stats"
          style={{
            border: C.cardBorder, borderRadius: C.cardRadius,
            maxWidth: 520, width: '100%', padding: '24px 32px',
            display: 'flex', alignItems: 'center',
            boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.3)' : '0 2px 20px rgba(83,74,183,0.07)',
            background: C.cardBg,
          }}
        >
          <StatItem emoji="🔍" num={sites.length} label="큐레이션 사이트" />
          <div className="sitebook-stats-divider" style={{ width: 1, height: 44, background: isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.10)', margin: '0 20px' }} />
          <StatItem emoji="📂" num={categories.length} label="카테고리" />
          <div className="sitebook-stats-divider" style={{ width: 1, height: 44, background: isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.10)', margin: '0 20px' }} />
          <StatItem emoji="🆓" num="0원" label="이용 요금" />
        </div>
      </section>

      {/* ── 4. FEATURES ──────────────────────────── */}
      <section style={{ background: C.cardBg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>FEATURES</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.dark, margin: '0 0 8px', letterSpacing: '-0.5px' }}>이런 기능을 제공해요</h2>
          <p style={{ fontSize: 15, color: C.textMuted, marginBottom: 48 }}>복잡한 즐겨찾기는 이제 그만</p>

          <div
            className="sitebook-features-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
          >
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: C.bg, border: C.cardBorder,
                borderRadius: C.cardRadius, padding: '32px 28px', textAlign: 'left',
              }}>
                <div style={{ fontSize: 34, marginBottom: 18 }}>{f.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. DIRECTORY ─────────────────────────── */}
      <section id="directory" style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>DIRECTORY</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.dark, margin: '0 0 8px', letterSpacing: '-0.5px' }}>오늘 발견할 유용한 사이트</h2>
            <p style={{ fontSize: 15, color: C.textMuted }}>로그인 없이도 누구나 탐색할 수 있어요</p>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <button
              onClick={() => setActiveTab(null)}
              style={{
                padding: '8px 18px', borderRadius: 999, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === null ? C.primary : C.cardBg,
                color:      activeTab === null ? '#fff'    : C.textSub,
                boxShadow:  activeTab === null ? 'none' : '0 1px 5px rgba(0,0,0,0.07)',
              }}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.name)}
                style={{
                  padding: '8px 18px', borderRadius: 999, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: activeTab === cat.name ? C.primary : C.cardBg,
                  color:      activeTab === cat.name ? '#fff'    : C.textSub,
                  boxShadow:  activeTab === cat.name ? 'none' : '0 1px 5px rgba(0,0,0,0.07)',
                }}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>

          {/* Site cards */}
          {sitesLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontSize: 14 }}>불러오는 중...</div>
          ) : filteredSites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontSize: 14 }}>등록된 사이트가 없어요</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {filteredSites.map((site, i) => {
                const catLabel = Array.isArray(site.category) ? site.category[0] : site.category
                const tagLabel = site.tags?.[0] ? `#${site.tags[0]}` : ''
                return (
                  <div
                    key={site.id}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => site.url && window.open(site.url, '_blank', 'noopener')}
                    style={{
                      background: C.cardBg, border: C.cardBorder, borderRadius: C.cardRadius,
                      padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 8,
                      cursor: site.url ? 'pointer' : 'default', transition: 'all 0.18s',
                      transform:  hoveredCard === i ? 'translateY(-2px)' : 'none',
                      boxShadow:  hoveredCard === i
                        ? (isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(83,74,183,0.14)')
                        : '0 1px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 28 }}>{site.icon || '🌐'}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, borderRadius: 999, padding: '2px 8px',
                        background: C.primaryLight, color: C.primary,
                      }}>
                        {catLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{site.name}</div>
                    <div style={{ fontSize: 12, color: C.textSub, lineHeight: 1.55, flex: 1 }}>{site.shortDesc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: C.textMuted }}>{tagLabel}</span>
                      {site.url && <span style={{ fontSize: 12, color: C.primary, fontWeight: 600 }}>바로가기 →</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button style={{
              background: C.cardBg, color: C.primary, border: `1.5px solid ${C.primary}`,
              borderRadius: C.btnRadius, padding: '12px 28px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              더 많은 사이트 보기 →
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. CTA ───────────────────────────────── */}
      <section style={{ background: C.footerCta, padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          지금 바로 정리 시작해요
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 32 }}>
          무료로 시작하고, 언제든지 사용하세요
        </p>
        <button
          onClick={signInWithGoogle}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#fff', color: C.primary, border: 'none',
            borderRadius: C.btnRadius, padding: '14px 28px',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <GoogleIcon /> Google로 무료 시작하기
        </button>
      </section>

      {/* ── 7. FOOTER ────────────────────────────── */}
      <footer style={{ background: C.footerBg, padding: '22px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
          © 2025 SiteBook · 이용약관 · 개인정보처리방침
        </p>
      </footer>

    </div>
  )
}
