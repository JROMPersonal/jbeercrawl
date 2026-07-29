import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, ADMIN_EMAIL } from '../firebase'

export function signInAdmin(password) {
  return signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
}

export function signOutAdmin() {
  return signOut(auth)
}

/**
 * @returns {() => void} unsubscribe function
 */
export function subscribeAdminAuthState(onChange) {
  return onAuthStateChanged(auth, onChange)
}
