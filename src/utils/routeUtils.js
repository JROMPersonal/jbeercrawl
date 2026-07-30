const EARTH_RADIUS_MILES = 3958.8
const METERS_PER_MILE = 1609.34

export const ROUTE_COLOR = '#00e676'

// The public router.project-osrm.org demo only has a driving/car graph
// loaded - it accepts "cycling"/"walking" in the URL without erroring, but
// silently returns the same driving route for all three. routing.osm.de's
// demo instances host separate car/bike/foot graphs, so that's what
// actually produces different distances and paths per mode. Google Maps
// uses its own separate travel-mode vocabulary, so each entry maps to that
// too.
export const TRAVEL_MODES = [
  { value: 'driving', label: 'Driving', osrmProfile: 'routed-car', googleTravelMode: 'driving' },
  { value: 'cycling', label: 'Bike', osrmProfile: 'routed-bike', googleTravelMode: 'bicycling' },
  { value: 'walking', label: 'Walk', osrmProfile: 'routed-foot', googleTravelMode: 'walking' },
]

export function haversineMiles([lat1, lng1], [lat2, lng2]) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(a))
}

export function buildGoogleMapsUrl(stops, travelMode = 'driving') {
  const [originLat, originLng] = stops[0].position
  const [destLat, destLng] = stops[stops.length - 1].position
  const waypoints = stops
    .slice(1, -1)
    .map(({ position }) => `${position[0]},${position[1]}`)
    .join('|')

  const googleTravelMode =
    TRAVEL_MODES.find((mode) => mode.value === travelMode)?.googleTravelMode ?? 'driving'

  const params = new URLSearchParams({
    api: '1',
    origin: `${originLat},${originLng}`,
    destination: `${destLat},${destLng}`,
    travelmode: googleTravelMode,
  })
  if (waypoints) params.set('waypoints', waypoints)

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

// Uses OSRM's free public routing servers (no API key) to fetch a real
// route between two points for the given travel mode (driving, cycling, or
// walking). Positions are [lat, lng]; OSRM expects {lng},{lat} in the URL
// and returns geometry as [lng, lat] pairs.
export async function fetchRoute(from, to, travelMode = 'driving') {
  const osrmProfile =
    TRAVEL_MODES.find((mode) => mode.value === travelMode)?.osrmProfile ?? 'routed-car'
  const url = `https://routing.openstreetmap.de/${osrmProfile}/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
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

export function legKey(leg) {
  return `${leg.from.brewery.id}->${leg.to.brewery.id}`
}

export function pathMidpoint(positions) {
  if (positions.length === 2) {
    const [[lat1, lng1], [lat2, lng2]] = positions
    return [(lat1 + lat2) / 2, (lng1 + lng2) / 2]
  }
  return positions[Math.floor(positions.length / 2)]
}
