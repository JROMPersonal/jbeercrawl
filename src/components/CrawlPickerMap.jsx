import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import { TILE_URL, TILE_ATTRIBUTION, toPosition, formatAddress } from '../utils/leafletSetup'
import { ROUTE_COLOR } from '../utils/routeUtils'
import MapFitBounds from './MapFitBounds'

function stopIcon(number) {
  return L.divIcon({
    className: 'crawl-stop-icon',
    html: `<div class="crawl-stop-icon__inner">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function CrawlPickerMap({ breweries, selectedIds, onToggle }) {
  const [hoveredBreweryId, setHoveredBreweryId] = useState(null)

  const located = useMemo(
    () =>
      breweries
        .map((brewery) => ({ brewery, position: toPosition(brewery) }))
        .filter((entry) => entry.position !== null),
    [breweries],
  )

  if (located.length === 0) {
    return (
      <p className="city-panel__message">
        No breweries with location data to show on the map yet.
      </p>
    )
  }

  const selectedSet = new Set(selectedIds)
  const regularMarkers = located.filter((entry) => !selectedSet.has(entry.brewery.id))
  const selectedStops = selectedIds
    .map((id) => located.find((entry) => entry.brewery.id === id))
    .filter(Boolean)
    .map((entry, index) => ({ ...entry, stopNumber: index + 1 }))

  const bounds = L.latLngBounds(located.map((entry) => entry.position))

  return (
    <div className="crawl-picker-map__container">
      <MapContainer center={bounds.getCenter()} zoom={12} scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <MapFitBounds bounds={bounds} triggerKey="picker" />

        {regularMarkers.map(({ brewery, position }) => (
          <Marker
            key={brewery.id}
            position={position}
            opacity={hoveredBreweryId === brewery.id ? 0.9 : 0.5}
            eventHandlers={{
              mouseover: () => setHoveredBreweryId(brewery.id),
              mouseout: () => setHoveredBreweryId(null),
            }}
          >
            <Popup>
              <strong>{brewery.name}</strong>
              {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
              <div>
                <button
                  type="button"
                  className="map-tab__add-to-route"
                  onClick={() => onToggle(brewery.id)}
                >
                  + Add to Crawl
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedStops.map(({ brewery, position, stopNumber }) => (
          <Marker key={brewery.id} position={position} icon={stopIcon(stopNumber)}>
            <Popup>
              <strong>
                {stopNumber}. {brewery.name}
              </strong>
              {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
              <div>
                <button
                  type="button"
                  className="map-tab__add-to-route"
                  onClick={() => onToggle(brewery.id)}
                >
                  - Remove from Crawl
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedStops.length > 1 && (
          <Polyline
            positions={selectedStops.map((stop) => stop.position)}
            pathOptions={{ color: ROUTE_COLOR, weight: 4, opacity: 0.8, dashArray: '6 8' }}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default CrawlPickerMap
