import { useEffect, useState } from 'react'
import { subscribeCrawlsForCity } from '../api/crawls'
import { isFirebaseConfigured } from '../firebase'

/**
 * Subscribes to real-time JBeer Crawls for a city.
 * @returns {{ crawls: Array, status: 'unconfigured' | 'loading' | 'ready' | 'error' }}
 */
export function useCrawls(city) {
  const [crawls, setCrawls] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!city) return

    if (!isFirebaseConfigured) {
      setStatus('unconfigured')
      return
    }

    setStatus('loading')
    const unsubscribe = subscribeCrawlsForCity(
      city.id,
      (data) => {
        setCrawls(data)
        setStatus('ready')
      },
      () => setStatus('error'),
    )

    return unsubscribe
  }, [city])

  return { crawls, status }
}
