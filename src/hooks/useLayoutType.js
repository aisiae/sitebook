import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthContext } from '../store/authContext'

const LS_KEY = 'siteBook_layoutType'

export function useLayoutType() {
  const { user } = useAuthContext()
  const [layoutType, setLayoutTypeState] = useState(
    () => localStorage.getItem(LS_KEY) || 'A'
  )

  useEffect(() => {
    if (!user) return

    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const type = snap.data()?.layoutType
        if (type) {
          setLayoutTypeState(type)
          localStorage.setItem(LS_KEY, type)
        }
      },
      () => {} // Firestore 접근 실패 시 localStorage 값 유지
    )
    return unsub
  }, [user?.uid])

  const setLayoutType = async (type) => {
    // localStorage + state 즉시 반영 (Firestore 무관하게 UI 즉시 응답)
    localStorage.setItem(LS_KEY, type)
    setLayoutTypeState(type)

    if (!user) return
    try {
      await setDoc(doc(db, 'users', user.uid), { layoutType: type }, { merge: true })
    } catch {
      // 규칙 미배포 상태여도 로컬 설정은 유지됨
    }
  }

  return { layoutType, setLayoutType, loading: false }
}
