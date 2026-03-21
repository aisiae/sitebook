import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useAuthContext } from '../store/authContext'

export function useAuth() {
  const { user, isAdmin, loading } = useAuthContext()

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { user, isAdmin, loading, signInWithGoogle, logout }
}
