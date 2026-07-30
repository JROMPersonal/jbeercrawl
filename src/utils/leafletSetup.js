import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
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

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Rough bounding boxes (contiguous US + southern Canada, matching this app's
// current city list) - not meant to precisely trace a border, just to catch
// grossly wrong coordinates. Open Brewery DB's own dataset isn't always
// accurate even for entries it does have lat/lng for (confirmed directly: a
// "South San Francisco, California" brewery on file with coordinates that
// are actually in interior British Columbia, Canada). A brewery whose given
// position clearly isn't even in its own recorded country gets treated as
// if it had no position at all, so it falls through to this app's own
// geocoding (see useLocatedBreweries/geocode.js), which cross-checks country
// and city before trusting a result.
const COUNTRY_BOUNDS = {
  'united states': { latMin: 24.5, latMax: 49.4, lngMin: -125, lngMax: -66.9 },
  canada: { latMin: 41.7, latMax: 83.1, lngMin: -141, lngMax: -52.6 },
}

function isPlausiblePosition(lat, lng, country) {
  const bounds = COUNTRY_BOUNDS[country?.trim().toLowerCase()]
  if (!bounds) return true
  return lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax
}

export function toPosition(brewery) {
  const lat = parseFloat(brewery?.latitude)
  const lng = parseFloat(brewery?.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (!isPlausiblePosition(lat, lng, brewery?.country)) return null
  return [lat, lng]
}

export function formatAddress(brewery) {
  return [brewery.street, brewery.city, brewery.state_province].filter(Boolean).join(', ')
}
