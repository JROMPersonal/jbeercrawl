import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'customCities'

const slugify = (value) => value.trim().toLowerCase().replace(/\s+/g, '_')

/**
 * Subscribes to real-time updates for admin-added cities (city creation is
 * admin-only — see firestore.rules).
 * @returns {() => void} unsubscribe function
 */
export function subscribeCustomCities(onChange, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      const cities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      onChange(cities)
    },
    onError,
  )
}

/**
 * @param {{ name: string, state: string, stateAbbr: string, image: string, addedBy: string }} city
 */
export function createCustomCity({ name, state, stateAbbr, image, addedBy }) {
  return addDoc(collection(db, COLLECTION), {
    name: name.trim(),
    state: state.trim(),
    stateAbbr: stateAbbr.trim().toUpperCase(),
    breweryDbCity: slugify(name),
    breweryDbState: slugify(state),
    image: image?.trim() || null,
    addedBy: addedBy?.trim() || 'Anonymous',
    createdAt: serverTimestamp(),
  })
}

/**
 * @param {string} cityId
 * @param {{ name: string, state: string, stateAbbr: string, image: string }} city
 */
export function updateCustomCity(cityId, { name, state, stateAbbr, image }) {
  return updateDoc(doc(db, COLLECTION, cityId), {
    name: name.trim(),
    state: state.trim(),
    stateAbbr: stateAbbr.trim().toUpperCase(),
    breweryDbCity: slugify(name),
    breweryDbState: slugify(state),
    image: image?.trim() || null,
  })
}

export function deleteCustomCity(cityId) {
  return deleteDoc(doc(db, COLLECTION, cityId))
}
