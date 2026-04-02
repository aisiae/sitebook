import { Link } from 'react-router-dom'
import { useTheme } from '../store/themeContext'

// TODO: 빌드된 인스톨러 파일을 GitHub Releases 또는 Firebase Storage에 업로드 후 URL 교체
const DOWNLOAD_URL = 'https://github.com/aisiae/sitebook/releases/download/v1.0.0/SiteBook.Launcher.Setup.1.0.0.exe'
const VERSION      = '1.0.0'

const FEATURES = [
  { icon: '⚡', title: '빠른 실행',     desc: '단축키 하나로 즐겨찾는 사이트와 앱을 즉시 실행' },
  { icon: '🔖', title: 'SiteBook 동기화', desc: 'Google 계정으로 로그인하면 내 사이트가 자동 동기화' },
  { icon: '🎮', title: '스트림덱 스타일', desc: '그리드 레이아웃으로 한눈에 보이는 런처 UI' },
  { icon: '📌', title: '항상 최상단',   desc: '다른 창 위에 고정되어 언제든지 바로 접근 가능' },
]

export default function DownloadPage() {
  const C = useTheme()

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.textPrimary, background: C.bg, minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: C.navBg,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: C.navBorder,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: C.dark, letterSpacing: '-0.5px' }}>SiteBook</span>
          </Link>
          <Link to="/" style={{ fontSize: 14, color: C.textSub, textDecoration: 'none', fontWeight: 500 }}>← 홈으로</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(83,74,183,0.10) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🖥️</div>
          <span style={{
            display: 'inline-block', background: C.primaryLight, color: C.primary,
            fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '5px 14px',
            marginBottom: 20, letterSpacing: 0.4,
          }}>
            Windows 전용 · 무료
          </span>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1px', margin: '0 0 16px', color: C.dark }}>
            SiteBook Launcher
          </h1>
          <p style={{ fontSize: 16, color: C.textSub, lineHeight: 1.75, margin: '0 auto 40px', maxWidth: 480 }}>
            자주 쓰는 사이트와 앱을 데스크탑에서 바로 실행하는 미니 런처.
            SiteBook 계정과 연동하면 북마크가 자동으로 동기화됩니다.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={DOWNLOAD_URL}
              download
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: C.primary, color: '#fff', border: 'none',
                borderRadius: 10, padding: '16px 32px',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(83,74,183,0.40)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(83,74,183,0.50)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(83,74,183,0.40)' }}
            >
              ⬇ 다운로드 (Windows)
            </a>
          </div>

          <p style={{ fontSize: 12, color: C.textMuted, marginTop: 14 }}>
            버전 {VERSION} · Windows 10/11 · 설치 파일 (.exe)
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: C.cardBg, padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: C.dark, margin: '0 0 40px', letterSpacing: '-0.5px' }}>
            주요 기능
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: C.bg, border: C.cardBorder,
                borderRadius: 14, padding: '28px 22px',
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO INSTALL ── */}
      <section style={{ padding: '60px 24px', background: C.bg }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: C.dark, margin: '0 0 36px', letterSpacing: '-0.5px' }}>
            설치 방법
          </h2>
          {[
            { step: '1', text: '위 다운로드 버튼을 눌러 설치 파일을 받아요.' },
            { step: '2', text: '다운로드된 .exe 파일을 실행하고 설치를 완료해요.' },
            { step: '3', text: 'SiteBook Launcher가 시스템 트레이에 실행돼요.' },
            { step: '4', text: 'Ctrl+Shift+S 단축키로 언제든지 창을 열 수 있어요.' },
            { step: '5', text: '설정에서 Google 로그인하면 SiteBook 북마크가 자동 동기화돼요.' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                background: C.primary, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
              }}>
                {step}
              </div>
              <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, paddingTop: 5 }}>{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: C.footerCta, padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
          지금 바로 시작해보세요
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
          설치 후 30초면 바로 사용할 수 있어요
        </p>
        <a
          href={DOWNLOAD_URL}
          download
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#fff', color: C.primary, border: 'none',
            borderRadius: 10, padding: '14px 28px',
            fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
          }}
        >
          ⬇ 무료 다운로드
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.footerBg, padding: '22px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span>© 2025 SiteBook</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link to="/terms"   style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>이용약관</Link>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>개인정보처리방침</Link>
        </p>
      </footer>

    </div>
  )
}
