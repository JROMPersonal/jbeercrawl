import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'customBreweries'

/**
 * Subscribes to real-time updates for community-added breweries in a city.
 * Field names match the Open Brewery DB shape (brewery_type, state_province,
 * website_url, ...) so they can be merged directly into the same brewery
 * list/cards used for API results.
 * @returns {() => void} unsubscribe function
 */
export function subscribeCustomBreweriesForCity(cityId, onChange, onError) {
  const q = query(collection(db, COLLECTION), where('cityId', '==', cityId))

  return onSnapshot(
    q,
    (snapshot) => {
      const breweries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        source: 'custom',
      }))
      onChange(breweries)
    },
    onError,
  )
}

/**
 * @param {{ id: string, name: string, stateAbbr: string }} city
 * @param {{ name: string, breweryType: string, street: string, phone: string, websiteUrl: string, addedBy: string }} brewery
 */
export function createCustomBrewery(city, { name, breweryType, street, phone, websiteUrl, addedBy }) {
  return addDoc(collection(db, COLLECTION), {
    cityId: city.id,
    name: name.trim(),
    brewery_type: breweryType || null,
    street: street?.trim() || null,
    city: city.name,
    state_province: city.stateAbbr,
    postal_code: null,
    phone: phone?.trim() || null,
    website_url: websiteUrl?.trim() || null,
    addedBy: addedBy?.trim() || 'Anonymous',
    createdAt: serverTimestamp(),
  })
}

/**
 * @param {string} breweryId
 * @param {{ name: string, breweryType: string, street: string, phone: string, websiteUrl: string }} brewery
 */
export function updateCustomBrewery(breweryId, { name, breweryType, street, phone, websiteUrl }) {
  return updateDoc(doc(db, COLLECTION, breweryId), {
    name: name.trim(),
    brewery_type: breweryType || null,
    street: street?.trim() || null,
    phone: phone?.trim() || null,
    website_url: websiteUrl?.trim() || null,
  })
}

export function deleteCustomBrewery(breweryId) {
  return deleteDoc(doc(db, COLLECTION, breweryId))
}
