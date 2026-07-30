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

  useEffect(() => {
    // Snapshot exactly what needs geocoding for this breweries list once,
    // up front, and work through that fixed batch to completion. Depending
    // on `geocoded` here (so this effect reruns after every single
    // resolution) seems appealing but backfires: each rerun cancels the
    // in-progress loop and starts a new one from the current brewery
    // onward, which re-issues a lookup for whatever was already in flight -
    // for N unresolved breweries that multiplies into a much longer queue
    // than N real requests, badly delaying whichever one is queued last.
    const targets = breweries.filter(
      (brewery) => !toPosition(brewery) && !(brewery.id in geocoded),
    )
    if (targets.length === 0) return

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
    // Only `breweries` itself should retrigger this - see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breweries])

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
