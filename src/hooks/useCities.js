import { useEffect, useState } from 'react'
import { cities as staticCities } from '../data/cities'
import { subscribeCustomCities } from '../api/customCities'
import { isFirebaseConfigured } from '../firebase'

/**
 * Returns the built-in city list plus any community-added custom cities.
 */
export function useCities() {
  const [customCities, setCustomCities] = useState([])

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return subscribeCustomCities(setCustomCities, () => setCustomCities([]))
  }, [])

  return [...staticCities, ...customCities.map((city) => ({ ...city, isCustom: true }))]
}
