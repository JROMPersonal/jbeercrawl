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

const COLLECTION = 'reports'

/**
 * @param {{ type: string, message: string, about: string, contactEmail: string }} report
 */
export function createReport({ type, message, about, contactEmail }) {
  return addDoc(collection(db, COLLECTION), {
    type,
    message: message.trim(),
    about: about?.trim() || null,
    contactEmail: contactEmail?.trim() || null,
    status: 'open',
    createdAt: serverTimestamp(),
  })
}

/**
 * Admin-only (Firestore rules require auth to read this collection).
 * @returns {() => void} unsubscribe function
 */
export function subscribeReports(onChange, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      const reports = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      reports.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      onChange(reports)
    },
    onError,
  )
}

export function setReportStatus(reportId, status) {
  return updateDoc(doc(db, COLLECTION, reportId), { status })
}

export function deleteReport(reportId) {
  return deleteDoc(doc(db, COLLECTION, reportId))
}
