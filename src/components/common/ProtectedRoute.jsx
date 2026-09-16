import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function ProtectedRoute() {
  const { session } = useAuth()
  const location = useLocation()

  return session ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
