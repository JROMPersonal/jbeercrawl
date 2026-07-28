import { useEffect, useMemo, useState } from 'react'
import { fetchBreweriesForCity } from '../api/breweryDb'
import { subscribeCustomBreweriesForCity } from '../api/customBreweries'
import { isFirebaseConfigured } from '../firebase'

/**
 * Fetches the brewery list for a city, merging live Open Brewery DB results
 * with any community-added custom breweries stored in Firestore.
 * @returns {{ breweries: Array, status: 'loading' | 'ready' | 'error' }}
 */
export function useBreweries(city) {
  const [apiBreweries, setApiBreweries] = useState([])
  const [apiStatus, setApiStatus] = useState('loading')
  const [customBreweries, setCustomBreweries] = useState([])

  useEffect(() => {
    if (!city) return

    let cancelled = false
    setApiStatus('loading')

    fetchBreweriesForCity(city)
      .then((data) => {
        if (cancelled) return
        setApiBreweries(data)
        setApiStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setApiStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [city])

  useEffect(() => {
    if (!city || !isFirebaseConfigured) {
      setCustomBreweries([])
      return
    }

    return subscribeCustomBreweriesForCity(
      city.id,
      setCustomBreweries,
      () => setCustomBreweries([]),
    )
  }, [city])

  const breweries = useMemo(
    () => [...customBreweries, ...apiBreweries],
    [customBreweries, apiBreweries],
  )

  // Don't block community-added breweries just because the public API had a
  // hiccup — only show an error state if there's nothing at all to display.
  const status =
    apiStatus === 'loading'
      ? 'loading'
      : apiStatus === 'error' && customBreweries.length === 0
        ? 'error'
        : 'ready'

  return { breweries, status }
}
