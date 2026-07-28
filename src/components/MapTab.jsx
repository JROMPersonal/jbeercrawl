import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

function formatAddress(brewery) {
  return [brewery.street, brewery.city, brewery.state_province].filter(Boolean).join(', ')
}

function toPosition(brewery) {
  const lat = parseFloat(brewery.latitude)
  const lng = parseFloat(brewery.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
}

function MapTab({ breweries, status }) {
  const located = useMemo(
    () =>
      breweries
        .map((brewery) => ({ brewery, position: toPosition(brewery) }))
        .filter((entry) => entry.position !== null),
    [breweries],
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

  const bounds = L.latLngBounds(located.map((entry) => entry.position))
  const missingCount = breweries.length - located.length

  return (
    <div>
      {missingCount > 0 && (
        <p className="map-tab__note">
          {missingCount} of {breweries.length} breweries don't have location data
          and aren't shown on the map.
        </p>
      )}

      <div className="map-tab__container">
        <MapContainer bounds={bounds} boundsOptions={{ padding: [30, 30] }} scrollWheelZoom>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {located.map(({ brewery, position }) => (
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
        </MapContainer>
      </div>
    </div>
  )
}

export default MapTab
