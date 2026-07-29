import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import FullScreenLoader from '@/components/common/FullScreenLoader'

export default function ProtectedRoute() {
  const { currentAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullScreenLoader label="Verifying access…" />
  }

  if (!currentAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
