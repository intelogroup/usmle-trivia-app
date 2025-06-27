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
    // Prevent redirect loops by checking if we're already on auth pages
    const authPages = ['/login', '/welcome', '/signup', '/forgot-password']
    if (authPages.includes(location.pathname)) {
      return <SplashScreen />
    }
    
    // Redirect to welcome page with the current location as state
    return <Navigate to="/welcome" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute 