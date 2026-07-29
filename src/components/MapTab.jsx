import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { isSafeUrl } from '../utils/safeUrl'
import { TILE_URL, TILE_ATTRIBUTION, toPosition, formatAddress } from '../utils/leafletSetup'
import AddCrawlForm from './AddCrawlForm'
import MapFitBounds from './MapFitBounds'

const ROUTE_COLOR = '#00b8ff'
const EARTH_RADIUS_MILES = 3958.8
const METERS_PER_MILE = 1609.34

function stopIcon(number) {
  return L.divIcon({
    className: 'crawl-stop-icon',
    html: `<div class="crawl-stop-icon__inner">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function haversineMiles([lat1, lng1], [lat2, lng2]) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(a))
}

function pathMidpoint(positions) {
  if (positions.length === 2) {
    const [[lat1, lng1], [lat2, lng2]] = positions
    return [(lat1 + lat2) / 2, (lng1 + lng2) / 2]
  }
  return positions[Math.floor(positions.length / 2)]
}

function legKey(leg) {
  return `${leg.from.brewery.id}->${leg.to.brewery.id}`
}

function buildGoogleMapsUrl(stops) {
  const [originLat, originLng] = stops[0].position
  const [destLat, destLng] = stops[stops.length - 1].position
  const waypoints = stops
    .slice(1, -1)
    .map(({ position }) => `${position[0]},${position[1]}`)
    .join('|')

  const params = new URLSearchParams({
    api: '1',
    origin: `${originLat},${originLng}`,
    destination: `${destLat},${destLng}`,
    travelmode: 'driving',
  })
  if (waypoints) params.set('waypoints', waypoints)

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

// Uses OSRM's free public routing server (no API key) to fetch a real
// driving path between two points. Positions are [lat, lng]; OSRM expects
// {lng},{lat} in the URL and returns geometry as [lng, lat] pairs.
async function fetchDrivingRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
  const response = await fetch(url)
  if (!response.ok) throw new Error('routing request failed')

  const data = await response.json()
  const route = data.routes?.[0]
  if (!route) throw new Error('no route found')

  return {
    positions: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMiles: route.distance / METERS_PER_MILE,
  }
}

function CloseOnMapClick({ onClose }) {
  useMapEvents({ click: onClose })
  return null
}

function MapTab({
  cityId,
  breweries,
  status,
  crawls,
  crawlsStatus,
  activeCrawlId,
  onActiveCrawlIdChange,
}) {
  const [drivingRoutes, setDrivingRoutes] = useState({})
  const [routingStatus, setRoutingStatus] = useState('idle')
  const [openLegKey, setOpenLegKey] = useState(null)
  const [extraStopIds, setExtraStopIds] = useState([])
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [hoveredBreweryId, setHoveredBreweryId] = useState(null)
  const [panSignal, setPanSignal] = useState(0)

  const located = useMemo(
    () =>
      breweries
        .map((brewery) => ({ brewery, position: toPosition(brewery) }))
        .filter((entry) => entry.position !== null),
    [breweries],
  )

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
  // is selected ("All Breweries (No Crawl)") — either way they're combined
  // into one ordered stop list.
  const { stops, originalStopCount } = useMemo(() => {
    const originalStops = activeCrawl
      ? activeCrawl.breweries
          .map((crawlBrewery) => {
            const brewery = breweries.find((b) => b.id === crawlBrewery.id)
            const position = toPosition(brewery)
            return position ? { brewery, position } : null
          })
          .filter(Boolean)
      : []

    const addedStops = extraStopIds
      .map((id) => breweries.find((b) => b.id === id))
      .map((brewery) => (brewery ? { brewery, position: toPosition(brewery) } : null))
      .filter((entry) => entry && entry.position !== null)

    return {
      stops: [...originalStops, ...addedStops].map((stop, index) => ({
        ...stop,
        stopNumber: index + 1,
      })),
      originalStopCount: originalStops.length,
    }
  }, [activeCrawl, breweries, extraStopIds])

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
    let delayTimeoutId
    setRoutingStatus('loading')

    Promise.all(
      legs.map((leg) =>
        fetchDrivingRoute(leg.from.position, leg.to.position)
          .then((result) => ({ key: legKey(leg), result }))
          .catch(() => ({ key: legKey(leg), result: null })),
      ),
    ).then((results) => {
      if (cancelled) return
      const next = {}
      for (const { key, result } of results) next[key] = result

      // Hold the loading overlay for an extra second even if OSRM responds
      // instantly — swapping straight lines for the real driving path
      // immediately looked like a glitch rather than a load.
      delayTimeoutId = setTimeout(() => {
        if (cancelled) return
        setDrivingRoutes(next)
        setRoutingStatus('done')
      }, 1000)
    })

    return () => {
      cancelled = true
      clearTimeout(delayTimeoutId)
    }
  }, [legs])

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
  const initialCenter = allBounds.getCenter()

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

        {stops.length >= 2 && (
          <a
            className="map-tab__gmaps-link"
            href={buildGoogleMapsUrl(stops)}
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
        <p className="map-tab__note">Calculating driving directions…</p>
      )}

      {extraStopIds.length > 0 && (
        <>
          <p className="map-tab__note">
            {activeCrawl ? (
              <>
                {extraStopIds.length} brewer{extraStopIds.length === 1 ? 'y' : 'ies'} added
                to this route — save it as a new crawl to keep them (the original crawl
                isn't changed).
              </>
            ) : (
              <>
                {extraStopIds.length} brewer{extraStopIds.length === 1 ? 'y' : 'ies'} added
                — save them as a new JBeer Crawl.
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

      <div className="map-tab__container">
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
          <MapFitBounds bounds={activeBounds} triggerKey={`${activeCrawlId}::${panSignal}`} />
          <CloseOnMapClick onClose={() => setOpenLegKey(null)} />

          {regularMarkers.map(({ brewery, position }) => (
            <Marker
              key={brewery.id}
              position={position}
              opacity={hoveredBreweryId !== brewery.id ? 0.75 : 1}
              eventHandlers={{
                click: () => setOpenLegKey(null),
                mouseover: () => setHoveredBreweryId(brewery.id),
                mouseout: () => setHoveredBreweryId(null),
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
              icon={stopIcon(stopNumber)}
              eventHandlers={{ click: () => setOpenLegKey(null) }}
            >
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

          {legs.map((leg) => {
            const driving = drivingRoutes[legKey(leg)]
            const positions = driving?.positions ?? [leg.from.position, leg.to.position]
            return (
              <Polyline
                key={`line-${legKey(leg)}`}
                positions={positions}
                pathOptions={{ color: ROUTE_COLOR, weight: 5, opacity: 0.9 }}
              />
            )
          })}

          {legs.map((leg) => {
            const key = legKey(leg)
            const driving = drivingRoutes[key]
            const positions = driving?.positions ?? [leg.from.position, leg.to.position]
            const distance = driving?.distanceMiles ?? leg.distance
            const label = driving ? 'driving' : 'straight-line'

            return (
              <Polyline
                key={`hit-${key}`}
                positions={positions}
                pathOptions={{ color: ROUTE_COLOR, weight: 20, opacity: 0 }}
                eventHandlers={{
                  click: () => setOpenLegKey((prev) => (prev === key ? null : key)),
                }}
              >
                <Tooltip sticky>
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
              {drivingRoutes[openLegKey] ? 'driving' : 'straight-line'})
            </Popup>
          )}
        </MapContainer>
      </div>

      {showSaveForm && (
        <AddCrawlForm
          cityId={cityId}
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
