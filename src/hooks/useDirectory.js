import { useEffect, useState } from 'react'
import {
  collection, onSnapshot,
  addDoc, updateDoc, deleteDoc,
  doc, getDoc, serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

// 신규 필드 기본값 — 구 문서에도 안전하게 spread
const DEFAULTS = {
  shortDesc:    '',
  fullDesc:     '',
  howToUse:     '',
  screenshots:  [],
  relatedSites: [],
  isAd:         false,
  adType:       'none',     // none | banner | premium
  adBannerUrl:  '',
  adBannerLink: '',
  adStartDate:  '',
  adEndDate:    '',
  viewCount:    0,
  isPublished:  true,
}

// ─────────────────────────────────────────────
// 전체 목록 훅 (Admin + Directory 목록 공용)
// ─────────────────────────────────────────────
export function useDirectory() {
  const [sites, setSites]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'directory'),
      (snap) => {
        const data = snap.docs.map(d => ({ ...DEFAULTS, id: d.id, ...d.data() }))
        // premium 최상단, 이후 등록일 오름차순
        data.sort((a, b) => {
          const ap = a.adType === 'premium'
          const bp = b.adType === 'premium'
          if (ap !== bp) return ap ? -1 : 1
          return (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
        })
        setSites(data)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [])

  const addSite = async (data) => {
    const { screenshots = [], relatedSites = [], tags = '', icon = '' } = data
    await addDoc(collection(db, 'directory'), {
      ...DEFAULTS,
      ...data,
      icon:         icon || '🌐',
      tags:         normalizeTags(tags),
      screenshots:  screenshots.filter(s => s?.trim()),
      relatedSites: relatedSites.filter(Boolean),
      isPublished:  true,
      viewCount:    0,
      createdAt:    serverTimestamp(),
    })
  }

  const updateSite = async (siteId, data) => {
    const { screenshots = [], relatedSites = [], tags = '', icon = '' } = data
    await updateDoc(doc(db, 'directory', siteId), {
      ...data,
      icon:         icon || '🌐',
      tags:         normalizeTags(tags),
      screenshots:  screenshots.filter(s => s?.trim()),
      relatedSites: relatedSites.filter(Boolean),
      updatedAt:    serverTimestamp(),
    })
  }

  const deleteSite = async (siteId) => {
    await deleteDoc(doc(db, 'directory', siteId))
  }

  const toggleAd = async (siteId, currentIsAd) => {
    await updateDoc(doc(db, 'directory', siteId), { isAd: !currentIsAd })
  }

  return { sites, loading, addSite, updateSite, deleteSite, toggleAd }
}

// ─────────────────────────────────────────────
// 단일 문서 훅 (상세 페이지용)
// ─────────────────────────────────────────────
export function useDirectorySite(siteId) {
  const [site, setSite]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!siteId) { setLoading(false); return }
    const unsub = onSnapshot(
      doc(db, 'directory', siteId),
      (snap) => {
        setSite(snap.exists() ? { ...DEFAULTS, id: snap.id, ...snap.data() } : null)
        setLoading(false)
      },
      () => { setSite(null); setLoading(false) }
    )
    return unsub
  }, [siteId])

  return { site, loading }
}

// ─────────────────────────────────────────────
// 독립 함수 (훅 불필요)
// ─────────────────────────────────────────────
export async function incrementViewCount(siteId) {
  try {
    await updateDoc(doc(db, 'directory', siteId), { viewCount: increment(1) })
  } catch { /* 권한 없어도 무시 */ }
}

export async function fetchSitesByIds(ids) {
  if (!ids?.length) return []
  const snaps = await Promise.all(ids.map(id => getDoc(doc(db, 'directory', id))))
  return snaps
    .filter(s => s.exists())
    .map(s => ({ ...DEFAULTS, id: s.id, ...s.data() }))
}
