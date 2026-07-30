import { isFirebaseConfigured } from '../firebase'
import { readSharedGeocodeCache, writeSharedGeocodeCache } from '../api/geocodeCache'

const CACHE_PREFIX = 'jbeercrawl:geocode:v5:'
const REQUEST_TIMEOUT_MS = 8000

// So a query like "..., CA" isn't wrongly matched against Canada instead of
// California - both the country name Photon returns and our own brewery
// records need to agree on the same spelling before comparing them.
const COUNTRY_ALIASES = {
  usa: 'united states',
  us: 'united states',
  'united states of america': 'united states',
}

function normalizeCountry(value) {
  if (!value) return null
  const key = value.trim().toLowerCase()
  return COUNTRY_ALIASES[key] ?? key
}

function normalizeText(value) {
  if (!value) return null
  return value.trim().toLowerCase()
}

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
 * breweries Open Brewery DB doesn't have coordinates on file for.
 *
 * Checked in order: this browser's localStorage cache, then the shared
 * Firestore cache (so once anyone has looked a brewery up, every visitor
 * gets it from our own database instead of re-querying Photon), then
 * Photon itself as a last resort. Results (including "not found") are
 * written back to both caches, so the same brewery is never looked up
 * twice by this browser, and at most once across all visitors.
 * @param {{ id: string, street?: string, city?: string, state_province?: string, postal_code?: string, country?: string }} brewery
 * @returns {Promise<[number, number] | null>}
 */
export async function geocodeBrewery(brewery) {
  const cached = readCache(brewery.id)
  if (cached !== undefined) return cached

  if (isFirebaseConfigured) {
    try {
      const shared = await readSharedGeocodeCache(brewery.id)
      if (shared !== undefined) {
        writeCache(brewery.id, shared)
        return shared
      }
    } catch {
      // Firestore read failed - fall through to geocoding directly.
    }
  }

  const query = buildAddressQuery(brewery)
  if (!query) {
    writeCache(brewery.id, null)
    if (isFirebaseConfigured) writeSharedGeocodeCache(brewery.id, null)
    return null
  }

  try {
    const position = await enqueue(async () => {
      const params = new URLSearchParams({ q: query, limit: '1' })
      const response = await fetchWithTimeout(`https://photon.komoot.io/api/?${params}`)
      if (!response.ok) throw new Error('geocoding request failed')

      const data = await response.json()
      const feature = data.features?.[0]
      const [lng, lat] = feature?.geometry?.coordinates ?? []
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

      // Guard against a wrong-country match (e.g. an ambiguous state
      // abbreviation like "CA" resolving to Canada instead of California) -
      // if we know what country to expect and Photon's result disagrees,
      // treat it as not found rather than trusting a clearly bad match.
      const expectedCountry = normalizeCountry(brewery.country)
      const actualCountry = normalizeCountry(feature?.properties?.country)
      if (expectedCountry && actualCountry && expectedCountry !== actualCountry) return null

      // Photon does fuzzy relevance matching - a brewery with no actual OSM
      // presence (common for small independent ones, especially custom
      // breweries added through this app) can still return a "result": some
      // unrelated but similarly-worded business, sometimes in a different
      // city entirely. If we know the expected city and it doesn't match,
      // that's a clear enough signal to discard the match rather than trust it.
      const expectedCity = normalizeText(brewery.city)
      const actualCity = normalizeText(feature?.properties?.city)
      if (expectedCity && actualCity && expectedCity !== actualCity) return null

      return [lat, lng]
    })

    writeCache(brewery.id, position)
    // Not awaited - the caller already has its answer; this just shares it
    // with future visitors in the background.
    if (isFirebaseConfigured) writeSharedGeocodeCache(brewery.id, position)
    return position
  } catch {
    // Don't cache network failures - worth retrying on a future visit.
    return null
  }
}
