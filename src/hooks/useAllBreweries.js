import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchBreweriesForCity } from '../api/breweryDb'
import { subscribeAllCustomBreweries } from '../api/customBreweries'
import { isFirebaseConfigured } from '../firebase'

/**
 * Fetches breweries for every city at once (API + community-added), for the
 * All Cities Map tab. Deferred behind `enabled` so the ~N Open Brewery DB requests
 * only fire once someone actually opens that tab, not on every page load -
 * and only fires once total (cached after), not every time the tab reopens.
 * @returns {{ breweries: Array, status: 'idle' | 'loading' | 'ready' | 'error' }}
 */
export function useAllBreweries(cities, enabled) {
  const [apiBreweriesByCity, setApiBreweriesByCity] = useState({})
  const [apiStatus, setApiStatus] = useState('idle')
  const [customBreweries, setCustomBreweries] = useState([])
  // A ref (not state) so StrictMode's dev-only double-effect-invocation can't
  // race with it: a state-based "already fetched" flag combined with a
  // cancel-on-cleanup guard caused the first (real) fetch's result to be
  // discarded as "cancelled" while the second invocation saw the flag
  // already set and skipped starting a new one - status got stuck loading
  // forever. A ref persists across that double-invocation without being
  // part of the reactive cleanup cycle, and the fetch is intentionally left
  // to complete even if StrictMode's fake unmount fires in between.
  const fetchStartedRef = useRef(false)

  useEffect(() => {
    if (!enabled || fetchStartedRef.current || cities.length === 0) return

    fetchStartedRef.current = true
    setApiStatus('loading')

    Promise.all(
      cities.map((city) =>
        fetchBreweriesForCity(city)
          .then((data) => ({ cityId: city.id, data }))
          .catch(() => ({ cityId: city.id, data: [] })),
      ),
    ).then((results) => {
      const byCity = {}
      for (const { cityId, data } of results) byCity[cityId] = data
      setApiBreweriesByCity(byCity)
      setApiStatus('ready')
    })
  }, [enabled, cities])

  useEffect(() => {
    if (!enabled || !isFirebaseConfigured) return

    return subscribeAllCustomBreweries(setCustomBreweries, () => setCustomBreweries([]))
  }, [enabled])

  const breweries = useMemo(() => {
    const cityById = new Map(cities.map((city) => [city.id, city]))

    const apiEntries = Object.entries(apiBreweriesByCity).flatMap(([cityId, list]) => {
      const city = cityById.get(cityId)
      return list.map((brewery) => ({
        ...brewery,
        cityName: city?.name ?? brewery.city,
        cityStateAbbr: city?.stateAbbr ?? brewery.state_province,
      }))
    })

    const customEntries = customBreweries.map((brewery) => {
      const city = cityById.get(brewery.cityId)
      return {
        ...brewery,
        cityName: city?.name ?? brewery.city,
        cityStateAbbr: city?.stateAbbr ?? brewery.state_province,
      }
    })

    return [...customEntries, ...apiEntries]
  }, [apiBreweriesByCity, customBreweries, cities])

  return { breweries, status: apiStatus }
}
