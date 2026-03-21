import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const C = { primary: '#534AB7', dark: '#2d2a6e' }

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { pathname }              = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { label: '내 사이트',      to: '/dashboard'   },
    { label: '컬렉션',         to: '/collections' },
    { label: '사이트 디렉토리', to: '/directory'   },
    ...(isAdmin ? [{ label: '관리자', to: '/admin', admin: true }] : []),
  ]

  // 드롭다운 메뉴 아이템 공통 스타일 (동적 hover는 onMouseEnter/Leave로)
  const itemBase = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 16px', fontSize: 13, cursor: 'pointer',
    background: 'none', border: 'none', width: '100%', textAlign: 'left',
    fontFamily: 'inherit', color: '#333', textDecoration: 'none',
    transition: 'background 0.1s',
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '0.5px solid rgba(83,74,183,0.10)',
      padding: '0 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>

        {/* 로고 */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: C.dark, letterSpacing: '-0.5px' }}>SiteBook</span>
        </Link>

        {/* 중앙 메뉴 */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {navLinks.map(({ label, to, admin }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                style={{
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  color: admin
                    ? (active ? '#fff' : C.primary)
                    : (active ? C.primary : '#555'),
                  textDecoration: 'none',
                  padding: '6px 14px', borderRadius: 8,
                  background: admin
                    ? (active ? C.primary : 'rgba(83,74,183,0.08)')
                    : (active ? 'rgba(83,74,183,0.08)' : 'transparent'),
                  transition: 'all 0.15s',
                  border: admin && !active ? `1px solid rgba(83,74,183,0.25)` : 'none',
                }}
              >
                {admin && '⚙ '}{label}
              </Link>
            )
          })}
        </nav>

        {/* 유저 영역 */}
        {user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>

            {/* 프로필 버튼 */}
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: dropdownOpen ? 'rgba(83,74,183,0.08)' : 'none',
                border: `1px solid ${dropdownOpen ? 'rgba(83,74,183,0.25)' : 'rgba(83,74,183,0.15)'}`,
                cursor: 'pointer',
                padding: '5px 10px 5px 6px', borderRadius: 20,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(83,74,183,0.08)'; e.currentTarget.style.borderColor = 'rgba(83,74,183,0.3)' }}
              onMouseLeave={e => {
                if (!dropdownOpen) {
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.borderColor = 'rgba(83,74,183,0.15)'
                }
              }}
            >
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {user.displayName?.[0] ?? '?'}
                  </div>
              }
              <span style={{ fontSize: 13, color: '#444', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </span>
              <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>{dropdownOpen ? '▴' : '▾'}</span>
            </button>

            {/* 드롭다운 */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#fff', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '0.5px solid rgba(83,74,183,0.12)',
                minWidth: 168, zIndex: 1001, overflow: 'hidden',
              }}>
                {/* 유저 정보 헤더 */}
                <div style={{ padding: '12px 16px 10px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{user.displayName}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
                <div style={{ height: '0.5px', background: '#f0f0f0', margin: '0 12px' }} />

                {/* 메뉴 항목 */}
                <div style={{ padding: '5px 0' }}>
                  {/* 내 정보 */}
                  <button
                    style={itemBase}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 14 }}>👤</span>
                    내 정보
                  </button>

                  {/* 내 컬렉션 */}
                  <Link
                    to="/my/collections"
                    onClick={() => setDropdownOpen(false)}
                    style={itemBase}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 14 }}>⊞</span>
                    내 컬렉션
                  </Link>

                  {/* 레이아웃 설정 */}
                  <Link
                    to="/settings/layout"
                    onClick={() => setDropdownOpen(false)}
                    style={itemBase}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 14 }}>⚙</span>
                    레이아웃 설정
                  </Link>

                  <div style={{ height: '0.5px', background: '#f0f0f0', margin: '4px 12px' }} />

                  {/* 로그아웃 */}
                  <button
                    onClick={() => { logout(); setDropdownOpen(false) }}
                    style={{ ...itemBase, color: '#e53935' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 14 }}>↩</span>
                    로그아웃
                  </button>
                </div>

              </div>
            )}
          </div>

        ) : (
          <Link
            to="/"
            style={{
              fontSize: 14, fontWeight: 600, color: '#fff',
              background: C.primary, textDecoration: 'none',
              padding: '7px 18px', borderRadius: 8,
            }}
          >
            로그인
          </Link>
        )}

      </div>
    </header>
  )
}
