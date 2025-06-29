import { Suspense, lazy } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserActivityQuery } from '../hooks/useOptimizedQueries'
import { useViewTransitions } from '../hooks/useViewTransitions'
import { AlertCircle, Loader2 } from 'lucide-react'
import LoadingIndicator from '../components/ui/LoadingIndicator'

// Lazy load sections for better performance
const WelcomeSection = lazy(() => import('../components/home/WelcomeSection'))
const HomeStats = lazy(() => import('../components/home/HomeStats'))
const HomeActions = lazy(() => import('../components/home/HomeActions'))
const StudyTipsSection = lazy(() => import('../components/home/StudyTipsSection'))
const ProgressOverview = lazy(() => import('../components/home/ProgressOverview'))

// Cache status indicators
const CacheStatusIndicators = ({ isRefreshing, isFromCache }) => {
  if (!isFromCache && !isRefreshing) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 flex space-x-2">
      {isFromCache && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-800">
          📱 Offline Mode
        </div>
      )}
      {isRefreshing && (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800 flex items-center space-x-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Syncing...</span>
        </div>
      )}
    </div>
  )
}

// Error display component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-red-200 dark:border-red-800 max-w-md w-full text-center">
      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {error?.message || 'Unable to load your dashboard. Please try again.'}
      </p>
      
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  </div>
)

const Home = () => {
  const { user, profile } = useAuth()
  const { transitionTo } = useViewTransitions()
  
  // Use optimized query hook for instant rendering
  const {
    data: userActivity,
    isLoading,
    isError,
    error,
    refetch
  } = useUserActivityQuery(user?.id)

  // Extract data with safe defaults
  const {
    isNewUser = true,
    userStats = {
      totalQuestions: 0,
      accuracy: 0,
      studyTime: 0,
      currentStreak: 0
    },
    recentActivity = []
  } = userActivity || {}

  if (isError) return <ErrorDisplay error={error} onRetry={refetch} />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <CacheStatusIndicators isRefreshing={false} isFromCache={false} />
      <div className="px-3 md:px-6 lg:px-8 pt-2 pb-3 max-w-4xl mx-auto">
        <Suspense fallback={<LoadingIndicator />}>
          <WelcomeSection user={user} profile={profile} isNewUser={isNewUser} />
          <HomeStats userStats={userStats} isNewUser={isNewUser} isLoading={isLoading} />
          <HomeActions isNewUser={isNewUser} onNavigate={transitionTo} />
          <StudyTipsSection />
          <ProgressOverview userStats={userStats} isNewUser={isNewUser} />
        </Suspense>
      </div>
    </div>
  )
}

export default Home