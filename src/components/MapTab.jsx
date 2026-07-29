import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { usePrefersDark } from '../hooks/usePrefersDark'

// Vite doesn't serve Leaflet's default marker images correctly out of the
// box, so point the default icon at the bundled asset URLs directly.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const ROUTE_COLOR = '#00b8ff'
const EARTH_RADIUS_MILES = 3958.8
const METERS_PER_MILE = 1609.34

const LIGHT_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}
const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

function stopIcon(number) {
  return L.divIcon({
    className: 'crawl-stop-icon',
    html: `<div class="crawl-stop-icon__inner">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function formatAddress(brewery) {
  return [brewery.street, brewery.city, brewery.state_province].filter(Boolean).join(', ')
}

function toPosition(brewery) {
  const lat = parseFloat(brewery?.latitude)
  const lng = parseFloat(brewery?.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
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

function legKey(leg) {
  return `${leg.from.brewery.id}->${leg.to.brewery.id}`
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

function FitBounds({ bounds }) {
  const map = useMap()

  useEffect(() => {
    if (bounds?.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [bounds, map])

  return null
}

function MapTab({ breweries, status, crawls, crawlsStatus }) {
  const [activeCrawlId, setActiveCrawlId] = useState('')
  const [drivingRoutes, setDrivingRoutes] = useState({})
  const [routingStatus, setRoutingStatus] = useState('idle')
  const prefersDark = usePrefersDark()

  const located = useMemo(
    () =>
      breweries
        .map((brewery) => ({ brewery, position: toPosition(brewery) }))
        .filter((entry) => entry.position !== null),
    [breweries],
  )

  const activeCrawl = crawls?.find((crawl) => crawl.id === activeCrawlId) ?? null

  const stops = useMemo(() => {
    if (!activeCrawl) return []
    return activeCrawl.breweries
      .map((crawlBrewery, index) => {
        const brewery = breweries.find((b) => b.id === crawlBrewery.id)
        const position = toPosition(brewery)
        return position ? { brewery, position, stopNumber: index + 1 } : null
      })
      .filter(Boolean)
  }, [activeCrawl, breweries])

  const skippedStops = activeCrawl ? activeCrawl.breweries.length - stops.length : 0

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
    if (legs.length === 0) {
      setDrivingRoutes({})
      setRoutingStatus('idle')
      return
    }

    let cancelled = false
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
      setDrivingRoutes(next)
      setRoutingStatus('done')
    })

    return () => {
      cancelled = true
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
  const activeBounds = activeCrawl && routeBounds ? routeBounds : allBounds
  const initialCenter = allBounds.getCenter()
  const tiles = prefersDark ? DARK_TILES : LIGHT_TILES

  return (
    <div>
      <div className="map-tab__toolbar">
        {crawlsStatus === 'ready' && crawls.length > 0 && (
          <label className="map-tab__route-select">
            <span>Show route:</span>
            <select
              value={activeCrawlId}
              onChange={(event) => setActiveCrawlId(event.target.value)}
            >
              <option value="">All breweries (no route)</option>
              {crawls.map((crawl) => (
                <option key={crawl.id} value={crawl.id}>
                  {crawl.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {missingCount > 0 && (
        <p className="map-tab__note">
          {missingCount} of {breweries.length} breweries don't have location data
          and aren't shown on the map.
        </p>
      )}

      {activeCrawl && skippedStops > 0 && (
        <p className="map-tab__note">
          {skippedStops} stop{skippedStops === 1 ? '' : 's'} in this crawl couldn't
          be located on the map.
        </p>
      )}

      {activeCrawl && routingStatus === 'loading' && (
        <p className="map-tab__note">Calculating driving directions…</p>
      )}

      <div className="map-tab__container">
        <MapContainer center={initialCenter} zoom={12} scrollWheelZoom>
          <TileLayer url={tiles.url} attribution={tiles.attribution} />
          <FitBounds bounds={activeBounds} />

          {regularMarkers.map(({ brewery, position }) => (
            <Marker key={brewery.id} position={position}>
              <Popup>
                <strong>{brewery.name}</strong>
                {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
                {brewery.website_url && (
                  <div>
                    <a href={brewery.website_url} target="_blank" rel="noreferrer">
                      Website ↗
                    </a>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}

          {stops.map(({ brewery, position, stopNumber }) => (
            <Marker key={brewery.id} position={position} icon={stopIcon(stopNumber)}>
              <Popup>
                <strong>
                  {stopNumber}. {brewery.name}
                </strong>
                {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
                {brewery.website_url && (
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
            const driving = drivingRoutes[legKey(leg)]
            const positions = driving?.positions ?? [leg.from.position, leg.to.position]
            const distance = driving?.distanceMiles ?? leg.distance
            const label = driving ? 'driving' : 'straight-line'

            return (
              <Polyline
                key={`hit-${legKey(leg)}`}
                positions={positions}
                pathOptions={{ color: ROUTE_COLOR, weight: 20, opacity: 0 }}
                eventHandlers={{ click: (event) => event.target.openTooltip() }}
              >
                <Tooltip sticky>
                  {leg.from.brewery.name} → {leg.to.brewery.name}: {distance.toFixed(1)} mi (
                  {label})
                </Tooltip>
              </Polyline>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapTab
