import { useEffect, useState } from 'react'
import { subscribeReports } from '../api/reports'
import { isFirebaseConfigured } from '../firebase'

/**
 * Admin-only: subscribes to real-time user-submitted reports.
 * @returns {{ reports: Array, status: 'unconfigured' | 'loading' | 'ready' | 'error' }}
 */
export function useReports() {
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState(isFirebaseConfigured ? 'loading' : 'unconfigured')

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return subscribeReports(
      (data) => {
        setReports(data)
        setStatus('ready')
      },
      () => setStatus('error'),
    )
  }, [])

  return { reports, status }
}
