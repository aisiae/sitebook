import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../store/themeContext'

const SECTIONS = [
  { id: 't1', title: '1. 서비스 소개' },
  { id: 't2', title: '2. 서비스 이용 조건' },
  { id: 't3', title: '3. 금지 행위' },
  { id: 't4', title: '4. 서비스 변경 및 중단' },
  { id: 't5', title: '5. 면책조항' },
  { id: 't6', title: '6. 분쟁 해결' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function TermsPage() {
  const C = useTheme()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const S = {
    page: {
      minHeight: '100vh',
      background: C.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: C.textPrimary,
    },
    topbar: {
      borderBottom: `1px solid ${C.divider}`,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    wrap: {
      maxWidth: 860,
      margin: '0 auto',
      padding: '0 24px 80px',
      display: 'flex',
      gap: 48,
      alignItems: 'flex-start',
    },
    toc: {
      width: 200,
      flexShrink: 0,
      position: 'sticky',
      top: 32,
      paddingTop: 48,
    },
    content: { flex: 1, paddingTop: 48, minWidth: 0 },
    h1: {
      fontSize: 26,
      fontWeight: 800,
      color: C.dark,
      margin: '0 0 6px',
      letterSpacing: '-0.5px',
    },
    meta: { fontSize: 12, color: C.textMuted, margin: '0 0 32px' },
    h2: {
      fontSize: 17,
      fontWeight: 700,
      color: C.dark,
      margin: '40px 0 14px',
      paddingBottom: 8,
      borderBottom: `1px solid ${C.divider}`,
    },
    p: { fontSize: 14, lineHeight: 1.85, color: C.textSub, margin: '0 0 10px' },
    ul: { paddingLeft: 20, margin: '8px 0 10px' },
    li: { fontSize: 14, lineHeight: 1.85, color: C.textSub, marginBottom: 4 },
    mail: { color: C.primary, textDecoration: 'none', fontWeight: 600 },
  }

  return (
    <div style={S.page}>
      {/* 상단 바 */}
      <div style={S.topbar}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>SiteBook</span>
        </Link>
        <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 4 }}>/ 이용약관</span>
      </div>

      <div style={S.wrap}>

        {/* 목차 */}
        <nav style={S.toc}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 12 }}>목차</div>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: C.textMuted, padding: '5px 0',
                lineHeight: 1.5, transition: 'color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            >
              {s.title}
            </button>
          ))}
        </nav>

        {/* 본문 */}
        <article style={S.content}>
          <h1 style={S.h1}>이용약관</h1>
          <p style={S.meta}>
            서비스명: SiteBook &nbsp;·&nbsp; 시행일: 2025년 3월 21일
          </p>

          <p style={S.p}>
            본 약관은 SiteBook(이하 "서비스") 이용에 관한 조건 및 절차를 규정합니다.
            서비스를 이용하면 본 약관에 동의한 것으로 간주합니다.
          </p>

          {/* 1 */}
          <h2 id="t1" style={S.h2}>1. 서비스 소개</h2>
          <p style={S.p}>
            SiteBook은 웹사이트 북마크를 카테고리별로 저장하고 관리할 수 있는 개인 북마크 관리 서비스입니다.
            Google 로그인을 통해 어디서든 내 사이트 목록에 접근할 수 있습니다.
          </p>

          {/* 2 */}
          <h2 id="t2" style={S.h2}>2. 서비스 이용 조건</h2>
          <ul style={S.ul}>
            <li style={S.li}>Google 계정을 보유한 누구나 무료로 이용할 수 있습니다.</li>
            <li style={S.li}>만 14세 미만의 경우 법정대리인의 동의가 필요합니다.</li>
            <li style={S.li}>본 약관에 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</li>
          </ul>

          {/* 3 */}
          <h2 id="t3" style={S.h2}>3. 금지 행위</h2>
          <p style={S.p}>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul style={S.ul}>
            <li style={S.li}>타인의 개인정보를 무단으로 수집하거나 저장하는 행위</li>
            <li style={S.li}>서비스 시스템에 부하를 주거나 정상 작동을 방해하는 행위</li>
            <li style={S.li}>해킹, 크롤링 등 서비스를 악의적으로 이용하는 행위</li>
            <li style={S.li}>불법 콘텐츠, 음란물, 저작권 침해 콘텐츠를 등록하는 행위</li>
            <li style={S.li}>타인을 사칭하거나 허위 정보를 유포하는 행위</li>
          </ul>
          <p style={S.p}>위반 시 사전 고지 없이 서비스 이용이 제한될 수 있습니다.</p>

          {/* 4 */}
          <h2 id="t4" style={S.h2}>4. 서비스 변경 및 중단</h2>
          <ul style={S.ul}>
            <li style={S.li}>운영상 필요에 따라 서비스의 일부 또는 전체를 변경·중단할 수 있습니다.</li>
            <li style={S.li}>중요한 변경 사항은 서비스 내 공지를 통해 사전 안내합니다.</li>
            <li style={S.li}>서비스 중단 시 이용자 데이터는 안전하게 삭제됩니다.</li>
          </ul>

          {/* 5 */}
          <h2 id="t5" style={S.h2}>5. 면책조항</h2>
          <ul style={S.ul}>
            <li style={S.li}>천재지변, 서버 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
            <li style={S.li}>이용자가 등록한 콘텐츠의 정확성·적법성에 대한 책임은 이용자에게 있습니다.</li>
            <li style={S.li}>이용자 간 또는 이용자와 제3자 간의 분쟁에 대해 서비스는 개입하지 않습니다.</li>
          </ul>

          {/* 6 */}
          <h2 id="t6" style={S.h2}>6. 분쟁 해결</h2>
          <ul style={S.ul}>
            <li style={S.li}>본 약관은 대한민국 법률에 따라 해석·적용됩니다.</li>
            <li style={S.li}>서비스 이용 관련 분쟁은 먼저 이메일(<a href="mailto:jjunge1013@gmail.com" style={S.mail}>jjunge1013@gmail.com</a>)로 협의를 요청해 주세요.</li>
            <li style={S.li}>협의가 이루어지지 않을 경우 관련 법령에 따른 절차를 따릅니다.</li>
          </ul>

          {/* 하단 링크 */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.divider}`, display: 'flex', gap: 16 }}>
            <Link to="/" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            >← 홈으로</Link>
            <Link to="/privacy" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            >개인정보처리방침 →</Link>
          </div>
        </article>
      </div>
    </div>
  )
}
