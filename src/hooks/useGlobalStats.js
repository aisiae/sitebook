import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Reads { totalSites, totalUsers } from Firestore `stats/global`.
 * Falls back to null if the document doesn't exist yet.
 * Admins/Cloud Functions should keep this document up-to-date.
 */
export function useGlobalStats() {
  const [stats, setStats] = useState({ totalSites: null, totalUsers: null })

  useEffect(() => {
    const ref = doc(db, 'stats', 'global')
    getDoc(ref).then(snap => {
      if (!snap.exists()) {
        // Document doesn't exist yet — create it
        setDoc(ref, { totalSites: 0, totalUsers: 0 }, { merge: true }).catch(() => {})
        setStats({ totalSites: 0, totalUsers: 0 })
      } else {
        const data = snap.data()
        if (data.totalUsers === undefined) {
          setDoc(ref, { totalUsers: 0 }, { merge: true }).catch(() => {})
          data.totalUsers = 0
        }
        setStats(prev => ({ ...prev, ...data }))
      }
    }).catch(() => {})
  }, [])

  return stats
}
