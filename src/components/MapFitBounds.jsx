import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

/**
 * Fits the map to the given bounds, but only when `triggerKey` actually
 * changes (e.g. the selected route) — not on every render, since `bounds`
 * is a freshly-computed object on every render (hovering a marker, adding a
 * stop, driving-route data resolving) and would otherwise reset the user's
 * pan/zoom constantly. Bump `triggerKey` (e.g. from an "Auto Pan" button) to
 * force a re-fit on demand.
 *
 * Also forces Leaflet to recompute its internal tile-grid sizing whenever
 * the container's actual rendered size changes. Without this, Leaflet can
 * measure a stale container size (e.g. zero-height, or mid-layout before the
 * tab bar/flex layout settles) at mount time, which shows up as tiles
 * rendering offset/jumbled from each other, or never loading at all.
 */
function MapFitBounds({ bounds, triggerKey }) {
  const map = useMap()
  const lastTriggerRef = useRef()

  useEffect(() => {
    map.invalidateSize()

    const container = map.getContainer()
    const resizeObserver = new ResizeObserver(() => map.invalidateSize())
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [map])

  useEffect(() => {
    if (lastTriggerRef.current === triggerKey) return
    lastTriggerRef.current = triggerKey

    if (bounds?.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
    // Only re-fit when triggerKey changes — bounds is intentionally excluded
    // so unrelated re-renders (with a fresh-but-equivalent bounds object)
    // don't reset the user's current pan/zoom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey, map])

  return null
}

export default MapFitBounds
