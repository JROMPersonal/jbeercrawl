import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { isSafeUrl } from '../utils/safeUrl'
import { useIsMobile } from '../hooks/useIsMobile'
import { useLocatedBreweries } from '../hooks/useLocatedBreweries'
import { TILE_URL, TILE_ATTRIBUTION, formatAddress } from '../utils/leafletSetup'
import {
  ROUTE_COLOR,
  TRAVEL_MODES,
  haversineMiles,
  buildGoogleMapsUrl,
  fetchRoute,
  legKey,
  pathMidpoint,
} from '../utils/routeUtils'
import AddCrawlForm from './AddCrawlForm'
import MapFitBounds from './MapFitBounds'

function stopIcon(number, highlighted) {
  return L.divIcon({
    className: 'crawl-stop-icon',
    html: `<div class="crawl-stop-icon__inner${
      highlighted ? ' crawl-stop-icon__inner--hovered' : ''
    }">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function CloseOnMapClick({ onClose }) {
  useMapEvents({ click: onClose })
  return null
}

// Lets code outside the map (the Breweries tab) "click" a specific brewery's
// marker on demand - pans/zooms to it and opens its popup, same as if the
// user had clicked it directly.
function FocusBrewery({ focusRequest, located, markerRefs, onHandled }) {
  const map = useMap()

  useEffect(() => {
    if (!focusRequest) return
    const entry = located.find((item) => item.brewery.id === focusRequest.breweryId)
    if (!entry) return

    map.setView(entry.position, Math.max(map.getZoom(), 15))
    markerRefs.current[focusRequest.breweryId]?.openPopup()
    // Consume the request so it doesn't get replayed if this MapTab instance
    // (or a later one, e.g. after switching cities and back) re-renders.
    onHandled?.(focusRequest.breweryId)
    // markerRefs is a stable ref object - only focusRequest/located should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest, located, map])

  return null
}

function MapTab({
  cityId,
  cityName,
  breweries,
  status,
  crawls,
  crawlsStatus,
  activeCrawlId,
  onActiveCrawlIdChange,
  focusRequest,
  onFocusHandled,
}) {
  const [drivingRoutes, setDrivingRoutes] = useState({})
  const [routingStatus, setRoutingStatus] = useState('idle')
  const [openLegKey, setOpenLegKey] = useState(null)
  const [extraStopIds, setExtraStopIds] = useState([])
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [hoveredBreweryId, setHoveredBreweryId] = useState(null)
  const [hoveredLegKey, setHoveredLegKey] = useState(null)
  const [panSignal, setPanSignal] = useState(0)
  const [focusedBreweryId, setFocusedBreweryId] = useState(null)
  const [travelMode, setTravelMode] = useState('driving')
  const markerRefs = useRef({})
  const isMobile = useIsMobile()

  const located = useLocatedBreweries(breweries)
  const locatedById = useMemo(() => {
    const map = new Map()
    for (const entry of located) map.set(entry.brewery.id, entry)
    return map
  }, [located])

  const activeCrawl = crawls?.find((crawl) => crawl.id === activeCrawlId) ?? null

  useEffect(() => {
    setExtraStopIds([])
    setShowSaveForm(false)
  }, [activeCrawlId])

  const addExtraStop = (breweryId) => {
    setExtraStopIds((prev) => (prev.includes(breweryId) ? prev : [...prev, breweryId]))
  }

  // Extra stops (added by clicking "+ Add to Route" on the map) can build a
  // route on top of a selected crawl, or entirely from scratch when no crawl
  // is selected ("All Breweries (No Crawl)") - either way they're combined
  // into one ordered stop list.
  const { stops, originalStopCount } = useMemo(() => {
    const originalStops = activeCrawl
      ? activeCrawl.breweries.map((crawlBrewery) => locatedById.get(crawlBrewery.id)).filter(Boolean)
      : []

    const addedStops = extraStopIds.map((id) => locatedById.get(id)).filter(Boolean)

    return {
      stops: [...originalStops, ...addedStops].map((stop, index) => ({
        ...stop,
        stopNumber: index + 1,
      })),
      originalStopCount: originalStops.length,
    }
  }, [activeCrawl, locatedById, extraStopIds])

  const skippedStops = activeCrawl ? activeCrawl.breweries.length - originalStopCount : 0

  const legs = useMemo(
    () =>
      stops.slice(0, -1).map((stop, i) => ({
        from: stop,
        to: stops[i + 1],
        distance: haversineMiles(stop.position, stops[i + 1].position),
      })),
    [stops],
  )

  useEffect(() => {
    setOpenLegKey(null)

    if (legs.length === 0) {
      setDrivingRoutes({})
      setRoutingStatus('idle')
      return
    }

    let cancelled = false
    setRoutingStatus('loading')

    Promise.all(
      legs.map((leg) =>
        fetchRoute(leg.from.position, leg.to.position, travelMode)
          .then((result) => ({ key: legKey(leg), result }))
          .catch(() => ({ key: legKey(leg), result: null })),
      ),
    ).then((results) => {
      if (cancelled) return
      const next = {}
      for (const { key, result } of results) next[key] = result
      setDrivingRoutes(next)
      setRoutingStatus('done')
    })

    return () => {
      cancelled = true
    }
  }, [legs, travelMode])

  if (status === 'loading') {
    return <p className="city-panel__message">Loading breweries…</p>
  }

  if (status === 'error') {
    return (
      <p className="city-panel__message">
        Couldn't load breweries right now. Please try again in a bit.
      </p>
    )
  }

  if (located.length === 0) {
    return (
      <p className="city-panel__message">
        No breweries with location data to show on the map yet.
      </p>
    )
  }

  const stopIds = new Set(stops.map((s) => s.brewery.id))
  const regularMarkers = located.filter((entry) => !stopIds.has(entry.brewery.id))
  const missingCount = breweries.length - located.length

  const allBounds = L.latLngBounds(located.map((entry) => entry.position))
  const routeBounds = stops.length > 0 ? L.latLngBounds(stops.map((s) => s.position)) : null
  const activeBounds = routeBounds ?? allBounds

  // If a brewery's popup is still open (e.g. focused from the Breweries tab)
  // when the user picks a different crawl route, keep it in view alongside
  // the route instead of letting the fit-bounds and the popup's own
  // auto-pan fight each other.
  const focusedEntry = focusedBreweryId
    ? located.find((entry) => entry.brewery.id === focusedBreweryId)
    : null
  if (focusedEntry) activeBounds.extend(focusedEntry.position)

  const initialCenter = allBounds.getCenter()
  const travelModeLabel =
    TRAVEL_MODES.find((mode) => mode.value === travelMode)?.label.toLowerCase() ?? 'driving'

  const openLeg = legs.find((leg) => legKey(leg) === openLegKey) ?? null
  let openLegPositions = null
  if (openLeg) {
    const driving = drivingRoutes[openLegKey]
    openLegPositions = driving?.positions ?? [openLeg.from.position, openLeg.to.position]
  }

  const totalRouteMiles = legs.reduce((sum, leg) => {
    const driving = drivingRoutes[legKey(leg)]
    return sum + (driving?.distanceMiles ?? leg.distance)
  }, 0)

  return (
    <div>
      <div className="map-tab__toolbar">
        <label className="map-tab__route-select">
          <span>JBeer Crawl Route:</span>
          <select
            value={activeCrawlId}
            onChange={(event) => onActiveCrawlIdChange(event.target.value)}
          >
            <option value="">All Breweries (No Crawl)</option>
            {crawlsStatus === 'ready' &&
              crawls.map((crawl) => (
                <option key={crawl.id} value={crawl.id}>
                  {crawl.name}
                </option>
              ))}
          </select>
        </label>

        <label className="map-tab__route-select">
          <span>Mode:</span>
          <select value={travelMode} onChange={(event) => setTravelMode(event.target.value)}>
            {TRAVEL_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        {stops.length >= 2 && (
          <a
            className="map-tab__gmaps-link"
            href={buildGoogleMapsUrl(stops, travelMode)}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps ↗
          </a>
        )}

        {stops.length > 0 ? (
          <span className="map-tab__route-stats">
            {stops.length} brewer{stops.length === 1 ? 'y' : 'ies'}
            {legs.length > 0 && <> · {totalRouteMiles.toFixed(1)} mi total</>}
          </span>
        ) : (
          <span className="map-tab__route-stats">
            {breweries.length} brewer{breweries.length === 1 ? 'y' : 'ies'} in this city
          </span>
        )}
      </div>

      {missingCount > 0 && (
        <p className="map-tab__note">
          {missingCount} of {breweries.length} breweries don't have location data
          and aren't shown on the map.
        </p>
      )}

      {skippedStops > 0 && (
        <p className="map-tab__note">
          {skippedStops} stop{skippedStops === 1 ? '' : 's'} in this crawl couldn't
          be located on the map.
        </p>
      )}

      {routingStatus === 'loading' && (
        <p className="map-tab__note">Calculating {travelModeLabel} directions…</p>
      )}

      {extraStopIds.length > 0 && (
        <>
          <p className="map-tab__note">
            {activeCrawl ? (
              <>
                {extraStopIds.length} brewer{extraStopIds.length === 1 ? 'y' : 'ies'} added
                to this route - save it as a new crawl to keep them (the original crawl
                isn't changed).
              </>
            ) : (
              <>
                {extraStopIds.length} brewer{extraStopIds.length === 1 ? 'y' : 'ies'} added
                - save them as a new JBeer Crawl.
              </>
            )}
          </p>
          <div className="map-tab__save-route">
            <button type="button" className="button" onClick={() => setShowSaveForm(true)}>
              Save as new JBeer Crawl
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setExtraStopIds([])}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <div
        className={`map-tab__container${
          (isMobile && legs.length > 0) || hoveredLegKey || openLegKey
            ? ' map-tab__container--dimmed'
            : ''
        }`}
      >
        <button
          type="button"
          className="map-tab__auto-pan"
          onClick={() => setPanSignal((n) => n + 1)}
        >
          Auto Pan
        </button>

        {routingStatus === 'loading' && (
          <div className="map-tab__loading-overlay">
            <img
              src={`${import.meta.env.BASE_URL}jbeercrawl-icon.png`}
              alt=""
              className="map-tab__loading-icon"
            />
          </div>
        )}

        <MapContainer center={initialCenter} zoom={12} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapFitBounds
            bounds={activeBounds}
            triggerKey={`${activeCrawlId}::${panSignal}::${located.length}`}
          />
          <CloseOnMapClick onClose={() => setOpenLegKey(null)} />

          {regularMarkers.map(({ brewery, position }) => (
            <Marker
              key={brewery.id}
              position={position}
              opacity={hoveredBreweryId !== brewery.id ? 0.75 : 1}
              ref={(marker) => {
                markerRefs.current[brewery.id] = marker
              }}
              eventHandlers={{
                click: () => setOpenLegKey(null),
                mouseover: () => setHoveredBreweryId(brewery.id),
                mouseout: () => setHoveredBreweryId(null),
                popupclose: () =>
                  setFocusedBreweryId((prev) => (prev === brewery.id ? null : prev)),
              }}
            >
              <Tooltip>
                <strong>{brewery.name}</strong>
                {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
              </Tooltip>
              <Popup>
                <strong>{brewery.name}</strong>
                {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
                {isSafeUrl(brewery.website_url) && (
                  <div>
                    <a href={brewery.website_url} target="_blank" rel="noreferrer">
                      Website ↗
                    </a>
                  </div>
                )}
                <div>
                  <button
                    type="button"
                    className="map-tab__add-to-route"
                    onClick={() => addExtraStop(brewery.id)}
                  >
                    + Add to Route
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {stops.map(({ brewery, position, stopNumber }) => (
            <Marker
              key={brewery.id}
              position={position}
              icon={stopIcon(stopNumber, hoveredBreweryId === brewery.id)}
              ref={(marker) => {
                markerRefs.current[brewery.id] = marker
              }}
              eventHandlers={{
                click: () => setOpenLegKey(null),
                mouseover: () => setHoveredBreweryId(brewery.id),
                mouseout: () => setHoveredBreweryId(null),
                popupclose: () =>
                  setFocusedBreweryId((prev) => (prev === brewery.id ? null : prev)),
              }}
            >
              <Tooltip>
                <strong>{brewery.name}</strong>
                {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
              </Tooltip>
              <Popup>
                <strong>
                  {stopNumber}. {brewery.name}
                </strong>
                {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
                {isSafeUrl(brewery.website_url) && (
                  <div>
                    <a href={brewery.website_url} target="_blank" rel="noreferrer">
                      Website ↗
                    </a>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}

          <FocusBrewery
            focusRequest={focusRequest}
            located={located}
            markerRefs={markerRefs}
            onHandled={(breweryId) => {
              setFocusedBreweryId(breweryId)
              onFocusHandled?.()
            }}
          />

          {legs.map((leg) => {
            const key = legKey(leg)
            const driving = drivingRoutes[key]
            const positions = driving?.positions ?? [leg.from.position, leg.to.position]
            return (
              <Polyline
                key={`glow-${key}`}
                positions={positions}
                // react-leaflet doesn't apply `interactive` from pathOptions at
                // creation time, so this stroke would otherwise still swallow
                // hover events (fighting the hit-detection line below it for
                // hoveredLegKey and causing rapid flicker). Reach into the
                // real Leaflet layer and disable pointer events directly.
                ref={(layer) => {
                  const el = layer?.getElement?.()
                  if (el) el.style.pointerEvents = 'none'
                }}
                pathOptions={{
                  color: ROUTE_COLOR,
                  weight: 18,
                  // On mobile there's no real hover, so the whole route stays
                  // glowing/highlighted rather than only lighting up on tap.
                  opacity: isMobile || key === hoveredLegKey ? 0.45 : 0,
                }}
              />
            )
          })}

          {legs.map((leg) => {
            const key = legKey(leg)
            const driving = drivingRoutes[key]
            const positions = driving?.positions ?? [leg.from.position, leg.to.position]
            const isHighlighted = isMobile || key === hoveredLegKey
            return (
              <Polyline
                key={`line-${key}`}
                positions={positions}
                pathOptions={{
                  color: ROUTE_COLOR,
                  weight: isHighlighted ? 7 : 5,
                  opacity: isHighlighted ? 1 : 0.9,
                }}
              />
            )
          })}

          {legs.map((leg) => {
            const key = legKey(leg)
            const driving = drivingRoutes[key]
            const positions = driving?.positions ?? [leg.from.position, leg.to.position]
            const distance = driving?.distanceMiles ?? leg.distance
            const label = driving ? travelModeLabel : 'straight-line'

            return (
              <Polyline
                key={`hit-${key}`}
                positions={positions}
                pathOptions={{ color: ROUTE_COLOR, weight: 20, opacity: 0 }}
                eventHandlers={{
                  click: () => setOpenLegKey((prev) => (prev === key ? null : key)),
                  mouseover: () => setHoveredLegKey(key),
                  mouseout: () => setHoveredLegKey(null),
                }}
              >
                <Tooltip sticky className="route-leg-tooltip">
                  {leg.from.brewery.name} → {leg.to.brewery.name}: {distance.toFixed(1)} mi (
                  {label})
                </Tooltip>
              </Polyline>
            )
          })}

          {openLeg && openLegPositions && (
            <Popup
              position={pathMidpoint(openLegPositions)}
              eventHandlers={{ remove: () => setOpenLegKey(null) }}
            >
              {openLeg.from.brewery.name} → {openLeg.to.brewery.name}:{' '}
              {(drivingRoutes[openLegKey]?.distanceMiles ?? openLeg.distance).toFixed(1)} mi (
              {drivingRoutes[openLegKey] ? travelModeLabel : 'straight-line'})
            </Popup>
          )}
        </MapContainer>
      </div>

      {showSaveForm && (
        <AddCrawlForm
          cityId={cityId}
          cityName={cityName}
          breweries={breweries}
          breweriesStatus={status}
          initialOrderedIds={stops.map((stop) => stop.brewery.id)}
          onClose={() => setShowSaveForm(false)}
          onCreated={(newCrawlId) => onActiveCrawlIdChange(newCrawlId)}
        />
      )}
    </div>
  )
}

export default MapTab
