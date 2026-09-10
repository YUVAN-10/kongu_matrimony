import { createContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, getAdminProfile } from '@/services/authService'
import { getAuthToken, getStoredAdmin } from '@/lib/api'

export const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(() => getStoredAdmin())
  const [loading, setLoading] = useState(true)

  // Verify stored session on app load
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      const token = getAuthToken()
      if (!token) {
        if (isMounted) {
          setCurrentAdmin(null)
          setLoading(false)
        }
        return
      }

      try {
        const admin = await getAdminProfile()
        if (isMounted) {
          setCurrentAdmin(admin)
        }
      } catch {
        if (isMounted) {
          // If profile fetch fails but stored admin exists, use fallback or clear
          setCurrentAdmin(getStoredAdmin() || null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogin = useCallback(async (email, password, rememberMe = true) => {
    const admin = await apiLogin(email, password, rememberMe)
    setCurrentAdmin(admin)
    return admin
  }, [])

  const handleLogout = useCallback(async () => {
    await apiLogout(currentAdmin)
    setCurrentAdmin(null)
  }, [currentAdmin])

  const refreshAdmin = useCallback(async () => {
    const admin = await getAdminProfile()
    setCurrentAdmin(admin)
    return admin
  }, [])

  const value = {
    currentAdmin,
    loading,
    isAuthenticated: Boolean(currentAdmin && getAuthToken()),
    login: handleLogin,
    logout: handleLogout,
    refreshAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
