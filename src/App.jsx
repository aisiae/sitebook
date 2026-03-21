import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LandingPage        from './pages/LandingPage'
import Dashboard          from './pages/Dashboard'
import Directory          from './pages/Directory'
import DirectorySite      from './pages/DirectorySite'
import Admin              from './pages/Admin'
import LayoutSelector     from './components/layouts/LayoutSelector'
import CollectionShare    from './pages/CollectionShare'
import CollectionsExplore from './pages/CollectionsExplore'
import MyCollections      from './pages/MyCollections'

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f4ff' }}>
      <div style={{ fontSize: 14, color: '#aaa' }}>로딩 중...</div>
    </div>
  )
}

// 로그인 필요
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/" replace />
}

// 관리자 전용 (비관리자 → 홈으로)
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* 랜딩: 로그인 상태면 대시보드로 */}
      <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      {/* 대시보드: 로그인 필요 */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      {/* 디렉토리: 누구나 접근 가능 */}
      <Route path="/directory"          element={<Directory />} />
      <Route path="/directory/:siteId"  element={<DirectorySite />} />
      {/* 레이아웃 설정 */}
      <Route path="/settings/layout" element={<PrivateRoute><LayoutSelector /></PrivateRoute>} />
      {/* 공유 컬렉션 / 탐색: 비로그인도 접근 가능 */}
      <Route path="/c/:shareSlug"  element={<CollectionShare />} />
      <Route path="/collections"   element={<CollectionsExplore />} />
      {/* 내 컬렉션 관리: 로그인 필요 */}
      <Route path="/my/collections" element={<PrivateRoute><MyCollections /></PrivateRoute>} />
      {/* 관리자 패널: 관리자만 접근 가능 */}
      <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
    </Routes>
  )
}
