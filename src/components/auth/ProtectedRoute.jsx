import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import SplashScreen from './SplashScreen'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <SplashScreen />
  }

  if (!user) {
    // Redirect to welcome page with the current location as state
    return <Navigate to="/auth/welcome" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute 