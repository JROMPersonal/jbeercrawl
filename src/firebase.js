import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// JBeer Crawls need a Firestore project to be shared across visitors. Until
// .env is filled in (see .env.example), leave Firebase uninitialized so the
// rest of the app (city list + breweries) keeps working without it.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
)

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const db = isFirebaseConfigured ? getFirestore(app) : null
export const auth = isFirebaseConfigured ? getAuth(app) : null

// Not a secret - just a fixed identifier for the single Firebase Auth user
// that gates the admin page. Its password is set directly in the Firebase
// console (Authentication > Users), never stored in this codebase.
export const ADMIN_EMAIL = 'admin@jbeercrawl.local'
