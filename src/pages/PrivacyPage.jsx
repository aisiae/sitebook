import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../store/themeContext'

const SECTIONS = [
  { id: 's1', title: '1. 수집하는 개인정보 항목' },
  { id: 's2', title: '2. 개인정보 수집 및 이용 목적' },
  { id: 's3', title: '3. 개인정보 보유 및 이용 기간' },
  { id: 's4', title: '4. 개인정보 제3자 제공' },
  { id: 's5', title: '5. 개인정보 처리 위탁' },
  { id: 's6', title: '6. 이용자의 권리' },
  { id: 's7', title: '7. 쿠키 사용' },
  { id: 's8', title: '8. 개인정보 보호책임자' },
  { id: 's9', title: '9. 개인정보처리방침 변경' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function PrivacyPage() {
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
    chip: {
      display: 'inline-block',
      background: C.primaryLight,
      color: C.primary,
      fontSize: 11,
      fontWeight: 600,
      borderRadius: 5,
      padding: '2px 7px',
      marginRight: 6,
    },
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
        <span style={{ fontSize: 13, color: C.textMuted, marginLeft: 4 }}>/ 개인정보처리방침</span>
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
          <h1 style={S.h1}>개인정보처리방침</h1>
          <p style={S.meta}>
            서비스명: SiteBook &nbsp;·&nbsp; 운영자: 개인 서비스 &nbsp;·&nbsp; 시행일: 2025년 3월 21일
          </p>

          <p style={S.p}>
            SiteBook(이하 "서비스")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
            본 방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 및 이용자의 권리에 대해 안내합니다.
          </p>

          {/* 1 */}
          <h2 id="s1" style={S.h2}>1. 수집하는 개인정보 항목</h2>
          <p style={S.p}><span style={S.chip}>Google 로그인 시</span></p>
          <ul style={S.ul}>
            <li style={S.li}>이름, 이메일 주소, 프로필 사진 (Google OAuth 제공)</li>
            <li style={S.li}>Google 계정 고유 식별자(UID)</li>
          </ul>
          <p style={S.p}><span style={S.chip}>서비스 이용 시</span></p>
          <ul style={S.ul}>
            <li style={S.li}>이용자가 등록한 웹사이트 URL, 사이트 이름, 카테고리, 메모</li>
            <li style={S.li}>컬렉션 제목 및 설명</li>
          </ul>
          <p style={S.p}><span style={S.chip}>자동 수집</span></p>
          <ul style={S.ul}>
            <li style={S.li}>사이트별 마지막 접속일, 서비스 최초 가입일</li>
            <li style={S.li}>서비스 이용 기록 (통계용)</li>
          </ul>

          {/* 2 */}
          <h2 id="s2" style={S.h2}>2. 개인정보 수집 및 이용 목적</h2>
          <ul style={S.ul}>
            <li style={S.li}>회원 식별 및 서비스 접근 권한 관리</li>
            <li style={S.li}>웹사이트 북마크 등록·조회·수정·삭제 기능 제공</li>
            <li style={S.li}>컬렉션 공유 기능 제공</li>
            <li style={S.li}>서비스 품질 개선 및 이용 통계 분석</li>
          </ul>

          {/* 3 */}
          <h2 id="s3" style={S.h2}>3. 개인정보 보유 및 이용 기간</h2>
          <ul style={S.ul}>
            <li style={S.li}>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 모든 개인정보를 삭제합니다.</li>
            <li style={S.li}>단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.</li>
          </ul>

          {/* 4 */}
          <h2 id="s4" style={S.h2}>4. 개인정보 제3자 제공</h2>
          <p style={S.p}>
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 서비스 운영을 위해 아래 플랫폼에 처리를 위탁합니다.
          </p>
          <ul style={S.ul}>
            <li style={S.li}><strong>Google Firebase</strong> — 데이터 저장 및 인증</li>
            <li style={S.li}><strong>Google Analytics</strong> — 서비스 접속 통계 분석</li>
          </ul>

          {/* 5 */}
          <h2 id="s5" style={S.h2}>5. 개인정보 처리 위탁</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong>Google Firebase (미국)</strong> — 회원 인증 및 데이터베이스 저장. Google의 개인정보처리방침에 따라 관리됩니다.</li>
            <li style={S.li}><strong>Vercel (미국)</strong> — 웹 서비스 호스팅. Vercel의 개인정보처리방침에 따라 관리됩니다.</li>
          </ul>

          {/* 6 */}
          <h2 id="s6" style={S.h2}>6. 이용자의 권리</h2>
          <p style={S.p}>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul style={S.ul}>
            <li style={S.li}>개인정보 열람 요청</li>
            <li style={S.li}>개인정보 수정 또는 삭제 요청</li>
            <li style={S.li}>개인정보 처리 정지 요청</li>
          </ul>
          <p style={S.p}>
            요청은 이메일로 보내주세요: <a href="mailto:jjunge1013@gmail.com" style={S.mail}>jjunge1013@gmail.com</a>
            <br />접수 후 10일 이내에 처리 결과를 안내드립니다.
          </p>

          {/* 7 */}
          <h2 id="s7" style={S.h2}>7. 쿠키 사용</h2>
          <ul style={S.ul}>
            <li style={S.li}>Firebase 인증 유지를 위해 브라우저 쿠키 및 로컬 스토리지를 사용합니다.</li>
            <li style={S.li}>브라우저 설정에서 쿠키를 거부할 수 있으나, 로그인 기능이 제한될 수 있습니다.</li>
          </ul>

          {/* 8 */}
          <h2 id="s8" style={S.h2}>8. 개인정보 보호책임자</h2>
          <ul style={S.ul}>
            <li style={S.li}>이메일: <a href="mailto:jjunge1013@gmail.com" style={S.mail}>jjunge1013@gmail.com</a></li>
          </ul>

          {/* 9 */}
          <h2 id="s9" style={S.h2}>9. 개인정보처리방침 변경</h2>
          <p style={S.p}>
            본 방침이 변경될 경우 서비스 웹사이트를 통해 사전 공지합니다.
            변경된 방침은 공지일로부터 7일 후 효력이 발생합니다.
          </p>

          {/* 하단 링크 */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.divider}`, display: 'flex', gap: 16 }}>
            <Link to="/" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            >← 홈으로</Link>
            <Link to="/terms" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted }}
            >이용약관 →</Link>
          </div>
        </article>
      </div>
    </div>
  )
}
