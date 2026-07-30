import { useEffect, useMemo, useState } from 'react'
import { toPosition } from '../utils/leafletSetup'
import { geocodeBrewery } from '../utils/geocode'

/**
 * Resolves a map position for each brewery, same shape as calling
 * `toPosition` directly - but for breweries missing latitude/longitude
 * (a real gap in some Open Brewery DB records), falls back to geocoding
 * their street address instead of just leaving them off the map.
 * @param {Array<object>} breweries
 * @returns {Array<{ brewery: object, position: [number, number] }>}
 */
export function useLocatedBreweries(breweries) {
  const [geocoded, setGeocoded] = useState({})

  const unresolvedIds = breweries
    .filter((brewery) => !toPosition(brewery) && !(brewery.id in geocoded))
    .map((brewery) => brewery.id)
    .join(',')

  useEffect(() => {
    if (!unresolvedIds) return
    const idSet = new Set(unresolvedIds.split(','))
    const targets = breweries.filter((brewery) => idSet.has(brewery.id))
    let cancelled = false

    ;(async () => {
      for (const brewery of targets) {
        const position = await geocodeBrewery(brewery)
        if (cancelled) return
        setGeocoded((prev) => ({ ...prev, [brewery.id]: position }))
      }
    })()

    return () => {
      cancelled = true
    }
    // Only the set of ids actually needing a lookup should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unresolvedIds])

  // Memoized so consumers (which build routes/legs off this) get a stable
  // reference across unrelated re-renders (e.g. hover state on the map) -
  // otherwise every render would look like "the breweries changed" and
  // retrigger the driving-route fetch, which is why the loading icon was
  // showing almost constantly.
  return useMemo(
    () =>
      breweries
        .map((brewery) => ({ brewery, position: toPosition(brewery) ?? geocoded[brewery.id] }))
        .filter((entry) => entry.position),
    [breweries, geocoded],
  )
}
