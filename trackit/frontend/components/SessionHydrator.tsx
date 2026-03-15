'use client'

import { useEffect } from 'react'
import { useStore } from '@/frontend/store'

/**
 * Placed once in layout.tsx. On mount it calls GET /api/session to
 * rehydrate the Zustand store from the encrypted iron-session cookie.
 * Sets sessionReady=true when complete so protected pages don't redirect
 * prematurely on a hard refresh.
 */
export default function SessionHydrator() {
  const sessionReady  = useStore(s => s.sessionReady)
  const setStudentId  = useStore(s => s.setStudentId)
  const setSessionReady = useStore(s => s.setSessionReady)
  const clearSession  = useStore(s => s.clearSession)

  useEffect(() => {
    if (sessionReady) return // already ran (e.g. soft nav)

    fetch('/api/session')
      .then(r => r.json() as Promise<{ studentId: string | null }>)
      .then(data => {
        if (data.studentId) setStudentId(data.studentId)
        else clearSession()
      })
      .catch(() => clearSession())
      .finally(() => setSessionReady())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
