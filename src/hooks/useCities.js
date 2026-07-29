import { useEffect, useMemo, useState } from 'react'
import { cities as staticCities } from '../data/cities'
import { subscribeCustomCities } from '../api/customCities'
import { isFirebaseConfigured } from '../firebase'

/**
 * Returns the built-in city list plus any admin-added custom cities.
 * Memoized so consumers get a stable array reference across re-renders
 * (only changes when the actual set of custom cities changes) — otherwise
 * anything that fetches data per-city on a `cities` dependency would refetch
 * on every render.
 */
export function useCities() {
  const [customCities, setCustomCities] = useState([])

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return subscribeCustomCities(setCustomCities, () => setCustomCities([]))
  }, [])

  return useMemo(
    () => [...staticCities, ...customCities.map((city) => ({ ...city, isCustom: true }))],
    [customCities],
  )
}
