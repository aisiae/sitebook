import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, getDocs, limit, query, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [isAdmin, setIsAdmin]     = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        const [adminSnap, sitesSnap, userDocSnap] = await Promise.all([
          getDoc(doc(db, 'admins', firebaseUser.uid)),
          getDocs(query(collection(db, 'users', firebaseUser.uid, 'sites'), limit(1))),
          getDoc(doc(db, 'users', firebaseUser.uid)),
        ])
        setIsAdmin(adminSnap.exists() && adminSnap.data()?.isAdmin === true)

        if (!userDocSnap.exists()) {
          const truly_new = sitesSnap.empty
          // Create user profile doc
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            registeredAt: serverTimestamp(),
            isNew: truly_new,
          })
          // Only increment counter for genuinely new users (no prior sites)
          if (truly_new) {
            updateDoc(doc(db, 'stats', 'global'), { totalUsers: increment(1) }).catch(() => {})
          }
          setIsNewUser(truly_new)
        } else {
          setIsNewUser(sitesSnap.empty)
        }
      } else {
        setIsAdmin(false)
        setIsNewUser(false)
      }

      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAdmin, isNewUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
