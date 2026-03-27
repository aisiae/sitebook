import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSites } from '../../hooks/useSites'
import { useTheme, useThemeControl } from '../../store/themeContext'
import { useGlobalStats } from '../../hooks/useGlobalStats'
import { useDirectory } from '../../hooks/useDirectory'
import { useCategories } from '../../hooks/useCategories'

export default function Navbar() {
  const { user, isAdmin, logout }       = useAuth()
  const { sites, deleteAllSites }       = useSites()
  const { pathname }                    = useLocation()
  const C                               = useTheme()
  const { isDark, toggleTheme }         = useThemeControl()
  const { totalUsers }                  = useGlobalStats()
  const { sites: dirSites }             = useDirectory()
  const { categories: dirCats }         = useCategories()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const dropdownRef = useRef(null)

  const handleDeleteAll = async () => {
    setDeleting(true)
    await deleteAllSites()
    setDeleting(false)
    setConfirmDelete(false)
    setDropdownOpen(false)
  }

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
    { label: '사이트 디렉토리', to: '/directory'   },
    { label: '컬렉션',         to: '/collections' },
    ...(isAdmin ? [{ label: '관리자', to: '/admin', admin: true }] : []),
  ]

  const itemBase = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 16px', fontSize: 13, cursor: 'pointer',
    background: 'none', border: 'none', width: '100%', textAlign: 'left',
    fontFamily: 'inherit', color: C.textPrimary, textDecoration: 'none',
    transition: 'background 0.1s',
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: C.navBg,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: C.navBorder,
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
                    : (active ? C.primary : C.textSub),
                  textDecoration: 'none',
                  padding: '6px 14px', borderRadius: 8,
                  background: admin
                    ? (active ? C.primary : 'rgba(83,74,183,0.08)')
                    : (active ? (isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.08)') : 'transparent'),
                  transition: 'all 0.15s',
                  border: admin && !active ? `1px solid rgba(83,74,183,0.25)` : 'none',
                }}
              >
                {admin && '⚙ '}{label}
              </Link>
            )
          })}
        </nav>

        {/* 오른쪽: 다크모드 토글 + 유저 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleTheme}
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.08)',
              color: C.primary, fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(123,116,224,0.25)' : 'rgba(83,74,183,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.08)'}
          >
            {isDark ? '☀' : '🌙'}
          </button>

          {/* 유저 영역 */}
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>

              {/* 프로필 버튼 */}
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: dropdownOpen ? (isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.08)') : 'none',
                  border: `1px solid ${dropdownOpen ? 'rgba(83,74,183,0.3)' : (isDark ? 'rgba(123,116,224,0.25)' : 'rgba(83,74,183,0.15)')}`,
                  cursor: 'pointer',
                  padding: '5px 10px 5px 6px', borderRadius: 20,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(123,116,224,0.15)' : 'rgba(83,74,183,0.08)'; e.currentTarget.style.borderColor = 'rgba(83,74,183,0.3)' }}
                onMouseLeave={e => {
                  if (!dropdownOpen) {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.borderColor = isDark ? 'rgba(123,116,224,0.25)' : 'rgba(83,74,183,0.15)'
                  }
                }}
              >
                {user.photoURL
                  ? <img src={user.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {user.displayName?.[0] ?? '?'}
                    </div>
                }
                <span style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName}
                </span>
                <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>{dropdownOpen ? '▴' : '▾'}</span>
              </button>

              {/* 드롭다운 */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: C.cardBg, borderRadius: 12,
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
                  border: C.cardBorder,
                  minWidth: 168, zIndex: 1001, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px 10px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{user.displayName}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>
                  <div style={{ height: '0.5px', background: isDark ? '#2a2748' : '#f0f0f0', margin: '0 12px' }} />

                  <div style={{ padding: '5px 0' }}>
                    <button
                      style={itemBase}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontSize: 14 }}>👤</span>
                      내 정보
                    </button>

                    <Link
                      to="/my/collections"
                      onClick={() => setDropdownOpen(false)}
                      style={itemBase}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontSize: 14 }}>⊞</span>
                      내 컬렉션
                    </Link>

                    <Link
                      to="/onboarding"
                      onClick={() => setDropdownOpen(false)}
                      style={itemBase}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontSize: 14 }}>📥</span>
                      북마크 가져오기
                    </Link>

                    <Link
                      to="/settings/layout"
                      onClick={() => setDropdownOpen(false)}
                      style={itemBase}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHoverBg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontSize: 14 }}>⚙</span>
                      레이아웃 설정
                    </Link>

                    <div style={{ height: '0.5px', background: isDark ? '#2a2748' : '#f0f0f0', margin: '4px 12px' }} />

                    {/* 전체 삭제 */}
                    {!confirmDelete ? (
                      <button
                        onClick={() => sites.length > 0 && setConfirmDelete(true)}
                        style={{ ...itemBase, color: sites.length > 0 ? '#e53935' : C.textMuted }}
                        onMouseEnter={e => { if (sites.length > 0) e.currentTarget.style.background = isDark ? 'rgba(229,57,53,0.15)' : '#fff5f5' }}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span style={{ fontSize: 14 }}>🗑</span>
                        내 사이트 전체 삭제 {sites.length > 0 ? `(${sites.length})` : ''}
                      </button>
                    ) : (
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, color: '#e53935', fontWeight: 600, marginBottom: 8 }}>
                          {sites.length}개를 전부 삭제할까요?
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            style={{ flex: 1, padding: '6px', borderRadius: 6, border: C.inputBorder, background: C.cardBg, color: C.textSub, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >
                            취소
                          </button>
                          <button
                            onClick={handleDeleteAll}
                            disabled={deleting}
                            style={{ flex: 1, padding: '6px', borderRadius: 6, border: 'none', background: '#e53935', color: '#fff', fontSize: 12, fontWeight: 700, cursor: deleting ? 'default' : 'pointer', opacity: deleting ? 0.7 : 1 }}
                          >
                            {deleting ? '삭제 중...' : '전체 삭제'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ height: '0.5px', background: isDark ? '#2a2748' : '#f0f0f0', margin: '4px 12px' }} />

                    <button
                      onClick={() => { logout(); setDropdownOpen(false) }}
                      style={{ ...itemBase, color: '#e53935' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(229,57,53,0.15)' : '#fff5f5'}
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

      </div>

      {/* ── 글로벌 통계 sub-bar ── */}
      <div style={{
        borderTop: isDark ? 'rgba(123,116,224,0.10) solid 1px' : 'rgba(83,74,183,0.07) solid 1px',
        display: 'flex', justifyContent: 'center', gap: 28,
        padding: '5px 24px',
      }}>
        <span style={{ fontSize: 11, color: C.textMuted }}>
          🔍 <span style={{ fontWeight: 700, color: C.textSub }}>{dirSites.length}</span> 큐레이션 사이트
        </span>
        <span style={{ fontSize: 11, color: C.textMuted }}>
          📂 <span style={{ fontWeight: 700, color: C.textSub }}>{dirCats.length}</span> 카테고리
        </span>
        <span style={{ fontSize: 11, color: C.textMuted }}>
          👥 <span style={{ fontWeight: 700, color: C.primary }}>
            {totalUsers !== null ? `${totalUsers.toLocaleString()}명` : '-'}
          </span> 누적 사용자
        </span>
      </div>

    </header>
  )
}
