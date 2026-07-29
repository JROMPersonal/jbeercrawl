import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { TILE_URL, TILE_ATTRIBUTION, toPosition, formatAddress } from '../utils/leafletSetup'
import { isSafeUrl } from '../utils/safeUrl'
import MapFitBounds from './MapFitBounds'

function UsaMapTab({ breweries, status }) {
  const [panSignal, setPanSignal] = useState(0)

  const located = useMemo(
    () =>
      breweries
        .map((brewery) => ({ brewery, position: toPosition(brewery) }))
        .filter((entry) => entry.position !== null),
    [breweries],
  )

  if (status === 'loading' || status === 'idle') {
    return <p className="city-panel__message">Loading breweries from every city…</p>
  }

  if (located.length === 0) {
    return (
      <p className="city-panel__message">
        No breweries with location data to show yet.
      </p>
    )
  }

  const cityCount = new Set(located.map((entry) => entry.brewery.cityName)).size
  const bounds = L.latLngBounds(located.map((entry) => entry.position))
  const center = bounds.getCenter()

  return (
    <div>
      <p className="map-tab__note">
        Showing {located.length} breweries across {cityCount} cit{cityCount === 1 ? 'y' : 'ies'}.
      </p>

      <div className="map-tab__container">
        <button
          type="button"
          className="map-tab__auto-pan"
          onClick={() => setPanSignal((n) => n + 1)}
        >
          Auto Pan
        </button>

        <MapContainer center={center} zoom={4} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapFitBounds bounds={bounds} triggerKey={panSignal} />

          {located.map(({ brewery, position }) => (
            <Marker key={brewery.id} position={position}>
              <Popup>
                <strong>{brewery.name}</strong>
                <div>
                  {brewery.cityName}, {brewery.cityStateAbbr}
                </div>
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
        </MapContainer>
      </div>
    </div>
  )
}

export default UsaMapTab
