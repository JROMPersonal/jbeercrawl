import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'crawls'

/**
 * Subscribes to real-time updates for all beer crawls belonging to a city.
 * Sorting happens client-side (newest first) to avoid requiring a Firestore
 * composite index for `where(cityId) + orderBy(createdAt)`.
 * @returns {() => void} unsubscribe function
 */
export function subscribeCrawlsForCity(cityId, onChange, onError) {
  const q = query(collection(db, COLLECTION), where('cityId', '==', cityId))

  return onSnapshot(
    q,
    (snapshot) => {
      const crawls = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      crawls.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
      )
      onChange(crawls)
    },
    onError,
  )
}

/**
 * @param {string} cityId
 * @param {{ name: string, creatorName: string, breweries: Array<{id: string, name: string, breweryType?: string}> }} crawl
 */
export function createCrawl(cityId, { name, creatorName, breweries }) {
  return addDoc(collection(db, COLLECTION), {
    cityId,
    name: name.trim(),
    creatorName: creatorName.trim() || 'Anonymous',
    breweries,
    createdAt: serverTimestamp(),
  })
}
