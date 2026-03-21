import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, where,
  getDoc, getDocs, increment, setDoc, deleteDoc as fsDeleteDoc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthContext } from '../store/authContext'

// 제목 → URL 슬러그 자동 생성
export function generateSlug(title) {
  const base = title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .slice(0, 40)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${base}-${rand}`
}

// ── 내 컬렉션 CRUD ──────────────────────────────────────────
export function useCollections() {
  const { user } = useAuthContext()
  const [collections, setCollections] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!user) { setCollections([]); setLoading(false); return }

    const q    = query(collection(db, 'collections'), where('uid', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      setCollections(data)
      setLoading(false)
    }, () => setLoading(false))

    return unsub
  }, [user?.uid])

  // siteSnapshots: [{ id, name, url, category, memo, loginId }]
  const createCollection = async ({ title, description, isPublic, shareSlug, siteIds, siteSnapshots }) => {
    if (!user) return null
    const ref = await addDoc(collection(db, 'collections'), {
      uid:          user.uid,
      authorName:   user.displayName  ?? '',
      authorPhoto:  user.photoURL     ?? '',
      title,
      description:  description ?? '',
      siteIds,        // 원본 siteId 배열 (수정 시 참조용)
      siteSnapshots,  // 공개 페이지 표시용 스냅샷
      isPublic:     isPublic ?? true,
      shareSlug,
      likeCount:    0,
      saveCount:    0,
      viewCount:    0,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    })
    return ref.id
  }

  const updateCollection = async (collectionId, fields) => {
    if (!user) return
    await updateDoc(doc(db, 'collections', collectionId), {
      ...fields,
      updatedAt: serverTimestamp(),
    })
  }

  const deleteCollection = async (collectionId) => {
    if (!user) return
    await deleteDoc(doc(db, 'collections', collectionId))
  }

  return { collections, loading, createCollection, updateCollection, deleteCollection }
}

// ── 공개 컬렉션 조회 (slug 기반, 비로그인 가능) ───────────────
export async function fetchCollectionBySlug(shareSlug) {
  const q    = query(collection(db, 'collections'), where('shareSlug', '==', shareSlug), where('isPublic', '==', true))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

// ── 공개 컬렉션 목록 (탐색 페이지용) ─────────────────────────
export async function fetchPublicCollections() {
  const q    = query(collection(db, 'collections'), where('isPublic', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── 조회수 증가 ───────────────────────────────────────────────
export async function incrementViewCount(collectionId) {
  try {
    await updateDoc(doc(db, 'collections', collectionId), { viewCount: increment(1) })
  } catch { /* 실패해도 무시 */ }
}

// ── 좋아요 토글 ───────────────────────────────────────────────
export async function toggleLike(collectionId, uid, currentlyLiked) {
  if (!uid) return
  const likeId  = `${uid}_${collectionId}`
  const likeRef = doc(db, 'collection_likes', likeId)
  const colRef  = doc(db, 'collections', collectionId)

  if (currentlyLiked) {
    await fsDeleteDoc(likeRef)
    await updateDoc(colRef, { likeCount: increment(-1) })
  } else {
    await setDoc(likeRef, { uid, collectionId, createdAt: serverTimestamp() })
    await updateDoc(colRef, { likeCount: increment(1) })
  }
}

// ── 좋아요 여부 확인 ──────────────────────────────────────────
export async function checkLiked(collectionId, uid) {
  if (!uid) return false
  const snap = await getDoc(doc(db, 'collection_likes', `${uid}_${collectionId}`))
  return snap.exists()
}

// ── 저장 수 증가/감소 ─────────────────────────────────────────
export async function incrementSaveCount(collectionId, delta = 1) {
  try {
    await updateDoc(doc(db, 'collections', collectionId), { saveCount: increment(delta) })
  } catch { /* 실패해도 무시 */ }
}
