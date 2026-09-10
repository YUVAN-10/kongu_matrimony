import { createContext, useState } from 'react'

export const AuthContext = createContext(undefined)

const DEFAULT_ADMIN = {
  uid: 'admin_1',
  id: 'admin_1',
  name: 'Admin',
  email: 'admin@kongumatrimony.com',
  role: 'super_admin',
  status: 'active',
}

export function AuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(DEFAULT_ADMIN)

  const value = {
    currentAdmin,
    loading: false,
    isAuthenticated: true,
    login: async () => DEFAULT_ADMIN,
    logout: async () => setCurrentAdmin(DEFAULT_ADMIN),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
