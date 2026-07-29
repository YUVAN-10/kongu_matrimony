import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Values are injected from environment variables — never hardcode credentials here.
// See .env.example for the required keys and where to find them in the Firebase Console.
// Exported (not just local) because authService.js needs it to spin up a
// secondary, isolated Firebase App instance for admin-creates-user flows —
// see the comment on authService.createUserAccount for why.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Single Firebase app instance for the whole admin panel.
const app = initializeApp(firebaseConfig)

if (import.meta.env.DEV) {
  // Confirms the running app is actually pointed at the Firebase project
  // you think it is — mismatched .env.local values are a common cause of
  // "the data I created isn't there" bugs.
  console.log('[firebase] Connected to project:', firebaseConfig.projectId)
}

// Firebase Authentication instance — used later by authService.js for admin login/session handling.
export const auth = getAuth(app)

// Cloud Firestore instance — used later by firestoreService.js for all database reads/writes.
export const db = getFirestore(app)

// Firebase Storage instance — used later by storageService.js for file/image uploads.
export const storage = getStorage(app)

export default app
