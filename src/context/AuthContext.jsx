import { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/firebase'
import { login as loginRequest, logout as logoutRequest, getAdminProfile } from '@/services/authService'

export const AuthContext = createContext(undefined)

const ALLOWED_ROLES = ['admin', 'super_admin']
const ACTIVE_STATUS = 'active'

/**
 * Fetches admins/{uid} and enforces that the account is active and holds an
 * admin-level role. Throws a user-friendly Error if either check fails so
 * unauthorized Firebase users can never reach the admin panel.
 */
async function resolveAdminProfile(user) {
  if (import.meta.env.DEV) {
    console.log('[AuthContext] Resolving admin profile for UID:', user.uid)
  }

  const adminProfile = await getAdminProfile(user.uid)

  if (!adminProfile) {
    throw new Error('No admin record was found for this account.')
  }

  if (import.meta.env.DEV) {
    // JSON.stringify surfaces stray whitespace/casing that a collapsed
    // console object hides — "active " and "Active" both LOOK like "active"
    // until you see the actual quoted bytes.
    console.log(
      '[AuthContext] status:', JSON.stringify(adminProfile.status),
      '| expected:', JSON.stringify(ACTIVE_STATUS),
      '| role:', JSON.stringify(adminProfile.role),
      '| allowed:', JSON.stringify(ALLOWED_ROLES)
    )
  }

  if (adminProfile.status !== ACTIVE_STATUS) {
    throw new Error('Your admin account has been blocked. Please contact the super admin.')
  }
  if (!ALLOWED_ROLES.includes(adminProfile.role)) {
    throw new Error('You do not have permission to access the admin panel.')
  }

  return { uid: user.uid, email: user.email, ...adminProfile }
}

export function AuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Keeps the admin panel in sync with Firebase's auth state (page refresh,
  // token expiry, sign-out in another tab, etc.), re-verifying the admin
  // role every time so a revoked account is caught immediately.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentAdmin(null)
        setLoading(false)
        return
      }

      try {
        const admin = await resolveAdminProfile(user)
        setCurrentAdmin(admin)
      } catch (error) {
        // Was previously a silent catch — any Firestore error here (bad
        // rules, wrong project, missing doc) vanished with no trace.
        console.error('[AuthContext] Admin verification failed on auth-state change:', error)
        await logoutRequest()
        setCurrentAdmin(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  async function login(email, password, rememberMe) {
    const user = await loginRequest(email, password, rememberMe)

    try {
      const admin = await resolveAdminProfile(user)
      setCurrentAdmin(admin)
      return admin
    } catch (error) {
      console.error('[AuthContext] Admin verification failed after login:', error)
      await logoutRequest()
      throw error
    }
  }

  async function logout() {
    await logoutRequest(currentAdmin)
    setCurrentAdmin(null)
  }

  const value = {
    currentAdmin,
    loading,
    isAuthenticated: Boolean(currentAdmin),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
