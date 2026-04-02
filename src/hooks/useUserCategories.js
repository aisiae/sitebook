import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthContext } from '../store/authContext'

/**
 * useUserCategories
 * 사용자별 카테고리를 관리하는 훅 (users/{uid}/categories)
 * LayoutC에서 사이드바 카테고리 CRUD + 순서 변경에 사용
 */
export function useUserCategories() {
  const { user } = useAuthContext()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }
    const colRef = collection(db, 'users', user.uid, 'categories')
    const q = query(colRef, orderBy('order', 'asc'))
    const unsub = onSnapshot(
      q,
      snap => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [user])

  /** 카테고리 순서 일괄 업데이트 (이름 배열로 order 재지정) */
  const updateCategoryOrder = async (nameArray) => {
    if (!user) return
    const batch = writeBatch(db)
    nameArray.forEach((name, idx) => {
      const cat = categories.find(c => c.name === name)
      if (cat?.id) {
        batch.update(doc(db, 'users', user.uid, 'categories', cat.id), { order: idx })
      }
    })
    await batch.commit()
  }

  /** 새 카테고리 추가 */
  const addCategory = async (name, emoji = '📁') => {
    if (!user) return
    const maxOrder = categories.length ? Math.max(...categories.map(c => c.order ?? 0)) + 1 : 0
    await addDoc(collection(db, 'users', user.uid, 'categories'), {
      name: name.trim(),
      emoji,
      order: maxOrder,
      createdAt: serverTimestamp(),
    })
  }

  /** 카테고리 삭제 (빈 카테고리만) */
  const removeCategory = async (name) => {
    if (!user) return
    const cat = categories.find(c => c.name === name)
    if (!cat?.id) return
    await deleteDoc(doc(db, 'users', user.uid, 'categories', cat.id))
  }

  /** 카테고리 이름 변경 (사이드바 메뉴 내 이름 수정) */
  const renameInOrder = async (oldName, newName) => {
    if (!user) return
    const cat = categories.find(c => c.name === oldName)
    if (!cat?.id) return
    await updateDoc(doc(db, 'users', user.uid, 'categories', cat.id), {
      name: newName.trim(),
    })
  }

  return { categories, loading, updateCategoryOrder, addCategory, removeCategory, renameInOrder }
}
