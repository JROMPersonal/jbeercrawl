import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { TILE_URL, TILE_ATTRIBUTION, formatAddress } from '../utils/leafletSetup'
import { isSafeUrl } from '../utils/safeUrl'
import { useLocatedBreweries } from '../hooks/useLocatedBreweries'
import MapFitBounds from './MapFitBounds'

// Below this zoom, breweries stay grouped into numbered clusters that split
// into smaller clusters as you zoom in; at this zoom and beyond (roughly a
// single-city view, matching the zoom level city maps open at) clustering
// turns off entirely and every brewery gets its own marker.
const DISABLE_CLUSTERING_AT_ZOOM = 11

function UsaMapTab({ breweries, status }) {
  const [panSignal, setPanSignal] = useState(0)

  const { located, pendingCount } = useLocatedBreweries(breweries)

  if (status === 'loading' || status === 'idle') {
    return <p className="city-panel__message">Loading breweries from every city…</p>
  }

  if (located.length === 0) {
    return (
      <p className="city-panel__message">
        {pendingCount > 0
          ? `Still trying to locate ${pendingCount} brewer${pendingCount === 1 ? 'y' : 'ies'}…`
          : "Couldn't find a reliable map location for any breweries yet."}
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

      {pendingCount > 0 && (
        <p className="map-tab__note">
          Still trying to locate {pendingCount} more brewer{pendingCount === 1 ? 'y' : 'ies'}{' '}
          missing coordinates - they'll appear here if a reliable match is found.
        </p>
      )}

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
          {/* located.length is part of the key so the view expands to include
              breweries that show up later via geocoding (e.g. Niagara Falls,
              ON is far outside the initial fit around US cities) instead of
              only ever fitting to whatever was already located on first
              render. */}
          <MapFitBounds bounds={bounds} triggerKey={`${panSignal}::${located.length}`} />

          <MarkerClusterGroup
            disableClusteringAtZoom={DISABLE_CLUSTERING_AT_ZOOM}
            spiderfyOnMaxZoom={false}
            showCoverageOnHover={false}
          >
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
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  )
}

export default UsaMapTab
