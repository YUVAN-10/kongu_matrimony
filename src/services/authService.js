import { initializeApp, deleteApp } from 'firebase/app'
import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, firebaseConfig } from '@/firebase/firebase'
import { logActivity } from '@/services/activityLogService'

const ADMINS_COLLECTION = 'admins'

/**
 * Signs an admin in with email/password.
 * `rememberMe` controls whether the session survives a browser restart
 * (local persistence) or ends when the tab/browser closes (session persistence).
 *
 * The activity log entry is written with a synthetic `admin` object (built
 * from the just-authenticated Firebase user + admin profile) rather than
 * `currentAdmin` from context, since AuthContext hasn't updated state yet
 * at this point in the login flow.
 */
export async function login(email, password, rememberMe = true) {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
  const userCredential = await signInWithEmailAndPassword(auth, email, password)

  if (import.meta.env.DEV) {
    console.log('[authService] Firebase Auth sign-in succeeded. UID:', userCredential.user.uid)
  }

  const adminProfile = await getAdminProfile(userCredential.user.uid)
  logActivity({
    action: 'login',
    module: 'Authentication',
    targetType: 'admin',
    targetId: userCredential.user.uid,
    description: `${adminProfile?.name || email} logged in`,
    admin: {
      uid: userCredential.user.uid,
      name: adminProfile?.name,
      email: userCredential.user.email,
      role: adminProfile?.role,
    },
  })

  return userCredential.user
}

export async function logout(admin) {
  if (admin) {
    logActivity({
      action: 'logout',
      module: 'Authentication',
      targetType: 'admin',
      targetId: admin.uid,
      description: `${admin.name || admin.email} logged out`,
      admin,
    })
  }
  await signOut(auth)
}

/**
 * Creates a brand-new Firebase Authentication user (used by the Add Profile
 * "Create New User" flow), WITHOUT signing the admin out of their own session.
 *
 * `createUserWithEmailAndPassword` on the default `auth` instance signs in
 * as the newly created user, replacing whoever was signed in — calling it
 * directly here would silently log the admin out and log them in as the
 * user they just created. To avoid that, this spins up a second, isolated
 * Firebase App instance (same config, different app name), creates the user
 * there instead, signs out of that throwaway instance, then tears it down —
 * the admin's session on the primary `auth` instance is never touched.
 */
export async function createUserAccount({ email, password }) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    const uid = credential.user.uid
    await signOut(secondaryAuth)
    return uid
  } finally {
    await deleteApp(secondaryApp)
  }
}

/**
 * Reads the admin authorization record from Firestore at admins/{uid}.
 * Returns null if no such document exists.
 */
export async function getAdminProfile(uid) {
  const adminDocRef = doc(db, ADMINS_COLLECTION, uid)

  if (import.meta.env.DEV) {
    console.log('[authService] Reading Firestore document:', adminDocRef.path)
  }

  try {
    const adminDocSnap = await getDoc(adminDocRef)

    if (import.meta.env.DEV) {
      console.log('[authService] Document exists:', adminDocSnap.exists())
      if (adminDocSnap.exists()) {
       const data = adminDocSnap.data();

        console.log("Full Data:", data);
        console.log("Keys:", Object.keys(data));
        console.log("Status Value:", data.status);
        console.log("Role Value:", data.role);
      }
    }

    return adminDocSnap.exists() ? adminDocSnap.data() : null
  } catch (error) {
    // Firestore errors (permission-denied, unavailable, etc.) land here —
    // logged with the exact path and error code so a misconfigured rule or
    // wrong project is obvious instead of a generic failure.
    console.error(
      `[authService] Firestore read failed for "${adminDocRef.path}":`,
      error.code || error.name,
      '-',
      error.message
    )
    throw error
  }
}

/**
 * Maps Firebase Auth error codes (and our own thrown Errors) to
 * user-friendly messages for display on the login form.
 */
export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact the super admin.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    default:
      return error?.message || 'Something went wrong. Please try again.'
  }
}
