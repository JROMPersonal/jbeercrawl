const CACHE_PREFIX = 'jbeercrawl:geocode:v3:'
const REQUEST_TIMEOUT_MS = 8000

// Photon (komoot's free OSM-based geocoder) has no documented per-second
// cap like Nominatim's - a handful of rapid back-to-back requests all came
// back in well under a second with no throttling. Still worth spacing
// requests out a little so a big batch (e.g. dozens of breweries missing
// coordinates at once) doesn't hammer their free service in one burst.
let queue = Promise.resolve()

function enqueue(task) {
  const result = queue.then(task, task)
  queue = result.then(
    () => new Promise((resolve) => setTimeout(resolve, 250)),
    () => new Promise((resolve) => setTimeout(resolve, 250)),
  )
  return result
}

// fetch() has no default timeout - a single slow/hung request against this
// best-effort free service would otherwise stall the shared queue forever,
// blocking every geocode lookup queued behind it.
async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

function buildAddressQuery(brewery) {
  // Leading with the brewery's own name lets Photon match its actual point
  // in OSM (many breweries are mapped as their own POI) instead of just
  // whatever business happens to share the same street address.
  return [
    brewery.name,
    brewery.street,
    brewery.city,
    brewery.state_province,
    brewery.postal_code,
    brewery.country,
  ]
    .filter(Boolean)
    .join(', ')
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage disabled/full - fine to just skip caching.
  }
}

/**
 * Geocodes a brewery's street address to a [lat, lng] position via Photon
 * (komoot's free OSM-based geocoding service, no API key required), for
 * breweries Open Brewery DB doesn't have coordinates on file for. Results
 * (including "not found") are cached in localStorage so the same brewery
 * is never looked up twice.
 * @param {{ id: string, street?: string, city?: string, state_province?: string, postal_code?: string, country?: string }} brewery
 * @returns {Promise<[number, number] | null>}
 */
export async function geocodeBrewery(brewery) {
  const cached = readCache(brewery.id)
  if (cached !== undefined) return cached

  const query = buildAddressQuery(brewery)
  if (!query) {
    writeCache(brewery.id, null)
    return null
  }

  try {
    const position = await enqueue(async () => {
      const params = new URLSearchParams({ q: query, limit: '1' })
      const response = await fetchWithTimeout(`https://photon.komoot.io/api/?${params}`)
      if (!response.ok) throw new Error('geocoding request failed')

      const data = await response.json()
      const [lng, lat] = data.features?.[0]?.geometry?.coordinates ?? []
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
    })

    writeCache(brewery.id, position)
    return position
  } catch {
    // Don't cache network failures - worth retrying on a future visit.
    return null
  }
}
