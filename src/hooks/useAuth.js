import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

// Will expose auth state and actions (login, logout, current admin) once the Authentication module is built.
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
