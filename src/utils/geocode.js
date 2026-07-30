const CACHE_PREFIX = 'jbeercrawl:geocode:v1:'

// Nominatim's usage policy caps requests at 1/sec - this serializes every
// geocode call app-wide (regardless of how many components ask at once)
// with a gap between each, rather than trying to rate-limit per caller.
let queue = Promise.resolve()

function enqueue(task) {
  const result = queue.then(task, task)
  queue = result.then(
    () => new Promise((resolve) => setTimeout(resolve, 1100)),
    () => new Promise((resolve) => setTimeout(resolve, 1100)),
  )
  return result
}

function buildAddressQuery(brewery) {
  // Leading with the brewery's own name lets Nominatim match its actual
  // point in OSM (many breweries are mapped as their own POI) instead of
  // just whatever business happens to share the same street address.
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
 * Geocodes a brewery's street address to a [lat, lng] position via
 * OpenStreetMap's free Nominatim service, for breweries Open Brewery DB
 * doesn't have coordinates on file for. Results (including "not found") are
 * cached in localStorage so the same brewery is never looked up twice.
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
      const params = new URLSearchParams({ format: 'json', q: query, limit: '1' })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      if (!response.ok) throw new Error('geocoding request failed')

      const results = await response.json()
      const result = results[0]
      return result ? [parseFloat(result.lat), parseFloat(result.lon)] : null
    })

    writeCache(brewery.id, position)
    return position
  } catch {
    // Don't cache network failures - worth retrying on a future visit.
    return null
  }
}
