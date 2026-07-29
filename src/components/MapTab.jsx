import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite doesn't serve Leaflet's default marker images correctly out of the
// box, so point the default icon at the bundled asset URLs directly.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const ROUTE_COLOR = '#c9722c'
const EARTH_RADIUS_MILES = 3958.8

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

      <div className="map-tab__container">
        <MapContainer center={initialCenter} zoom={12} scrollWheelZoom>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
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

          {legs.map((leg, i) => (
            <Polyline
              key={`line-${i}`}
              positions={[leg.from.position, leg.to.position]}
              pathOptions={{ color: ROUTE_COLOR, weight: 4 }}
            />
          ))}

          {legs.map((leg, i) => (
            <Polyline
              key={`hit-${i}`}
              positions={[leg.from.position, leg.to.position]}
              pathOptions={{ color: ROUTE_COLOR, weight: 20, opacity: 0 }}
              eventHandlers={{ click: (event) => event.target.openTooltip() }}
            >
              <Tooltip sticky>
                {leg.from.brewery.name} → {leg.to.brewery.name}: {leg.distance.toFixed(1)} mi
              </Tooltip>
            </Polyline>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapTab
