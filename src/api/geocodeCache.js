import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'geocodeCache'

// Bump this if the geocoding query/validation logic changes in a way that
// could make previously-cached results wrong (e.g. the "CA" = California
// vs. Canada mixup fixed alongside this). firestore.rules only allows the
// *first* write per document (see there for why), so a bad entry can't be
// corrected in place - baking the version into the doc ID instead means a
// bump just starts writing to fresh, never-before-used documents.
const CACHE_VERSION = 'v3'

function cacheDocId(breweryId) {
  return `${breweryId}_${CACHE_VERSION}`
}

/**
 * Reads a previously-cached geocode result for a brewery, shared across
 * every visitor (not just this browser) - see firestore.rules.
 * @param {string} breweryId
 * @returns {Promise<[number, number] | null | undefined>} undefined if
 *   nothing's cached yet for this brewery
 */
export async function readSharedGeocodeCache(breweryId) {
  const snapshot = await getDoc(doc(db, COLLECTION, cacheDocId(breweryId)))
  return snapshot.exists() ? snapshot.data().position : undefined
}

/**
 * Caches a geocode result (including "not found", as `null`) so every other
 * visitor benefits from this lookup too, instead of re-querying the free
 * geocoding service for the same brewery. Only the first write for a given
 * brewery is allowed through (see firestore.rules) - if another client's
 * write already landed first, this silently no-ops rather than erroring.
 * @param {string} breweryId
 * @param {[number, number] | null} position
 */
export async function writeSharedGeocodeCache(breweryId, position) {
  try {
    await setDoc(doc(db, COLLECTION, cacheDocId(breweryId)), {
      position,
      updatedAt: serverTimestamp(),
    })
  } catch {
    // Another client already cached this brewery first - fine, ignore.
  }
}
