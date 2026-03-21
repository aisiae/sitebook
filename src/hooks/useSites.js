import { useEffect, useState } from 'react'
import {
  collection, onSnapshot,
  addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthContext } from '../store/authContext'

export function useSites() {
  const { user } = useAuthContext()
  const [sites, setSites]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSites([])
      setLoading(false)
      return
    }

    const ref  = collection(db, 'users', user.uid, 'sites')
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // 최신 등록 순 정렬
      data.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0
        const tb = b.createdAt?.toMillis?.() ?? 0
        return tb - ta
      })
      setSites(data)
      setLoading(false)
    })

    return unsub
  }, [user?.uid])

  const addSite = async ({ name, url, category, memo = '', loginId = '' }) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'sites'), {
      name,
      url,
      category,
      memo,
      loginId,
      status:        'active',
      lastVisitedAt: serverTimestamp(),
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
    })
  }

  const updateLastVisited = async (siteId) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'sites', siteId), {
      lastVisitedAt: serverTimestamp(),
    })
  }

  const updateSite = async (siteId, data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'sites', siteId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  const deleteSite = async (siteId) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'sites', siteId))
  }

  return { sites, loading, addSite, updateSite, updateLastVisited, deleteSite }
}
