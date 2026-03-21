import { useAuthContext } from '../store/authContext'

// authContext에서 isAdmin을 가져오는 얇은 래퍼
// 컴포넌트에서 useAdmin() 한 줄로 관리자 여부 확인 가능
export function useAdmin() {
  const { isAdmin, loading } = useAuthContext()
  return { isAdmin, loading }
}
