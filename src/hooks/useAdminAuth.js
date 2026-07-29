import { useEffect, useState } from 'react'
import { subscribeAdminAuthState } from '../api/adminAuth'
import { isFirebaseConfigured } from '../firebase'

/**
 * @returns {{ user: import('firebase/auth').User | null, status: 'unconfigured' | 'loading' | 'ready' }}
 */
export function useAdminAuth() {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(isFirebaseConfigured ? 'loading' : 'unconfigured')

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return subscribeAdminAuthState((firebaseUser) => {
      setUser(firebaseUser)
      setStatus('ready')
    })
  }, [])

  return { user, status }
}
