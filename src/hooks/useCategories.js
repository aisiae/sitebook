import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export const DEFAULT_CATEGORIES = [
  { name: '업무',         emoji: '💼', order: 0, subcategories: [] },
  { name: 'SNS',          emoji: '📱', order: 1, subcategories: [] },
  { name: '쇼핑',         emoji: '🛍',  order: 2, subcategories: [] },
  { name: '금융',         emoji: '💳', order: 3, subcategories: [] },
  { name: '개발',         emoji: '💻', order: 4, subcategories: [] },
  { name: '엔터테인먼트', emoji: '🎬', order: 5, subcategories: [] },
  { name: '기타',         emoji: '📁', order: 6, subcategories: [] },
]

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'))
    const unsub = onSnapshot(
      q,
      snap => { setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      ()   => setLoading(false),
    )
    return unsub
  }, [])

  const addCategory = async ({ name, emoji }) => {
    const maxOrder = categories.length ? Math.max(...categories.map(c => c.order)) + 1 : 0
    await addDoc(collection(db, 'categories'), {
      name: name.trim(), emoji: emoji.trim() || '📁',
      order: maxOrder, subcategories: [], createdAt: serverTimestamp(),
    })
  }

  const updateCategory = async (id, data) =>
    updateDoc(doc(db, 'categories', id), data)

  const deleteCategory = async (id) =>
    deleteDoc(doc(db, 'categories', id))

  const seedDefaults = async () => {
    const batch = writeBatch(db)
    DEFAULT_CATEGORIES.forEach((cat, i) =>
      batch.set(doc(collection(db, 'categories')), { ...cat, order: i, createdAt: serverTimestamp() })
    )
    await batch.commit()
  }

  const moveCategory = async (id, direction) => {
    const idx = categories.findIndex(c => c.id === id)
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= categories.length) return
    const target  = categories[targetIdx]
    const current = categories[idx]
    const batch = writeBatch(db)
    batch.update(doc(db, 'categories', id), { order: target.order })
    batch.update(doc(db, 'categories', target.id), { order: current.order })
    await batch.commit()
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory, seedDefaults, moveCategory }
}
