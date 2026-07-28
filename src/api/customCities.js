import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'customCities'

const slugify = (value) => value.trim().toLowerCase().replace(/\s+/g, '_')

/**
 * Subscribes to real-time updates for community-added cities.
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
