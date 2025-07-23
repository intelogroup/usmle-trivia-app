import { Suspense, lazy, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserActivityQuery } from '../hooks/useOptimizedQueries'
import { useViewTransitions } from '../hooks/useViewTransitions'
import { AlertCircle, Loader2, Settings } from 'lucide-react'
import LoadingIndicator from '../components/ui/LoadingIndicator'
import HomeLoadingDebugger from '../components/debug/HomeLoadingDebugger'

// Lazy load sections for better performance
const WelcomeSection = lazy(() => import('../components/home/WelcomeSection'))
const HomeStats = lazy(() => import('../components/home/HomeStats'))
const HomeActions = lazy(() => import('../components/home/HomeActions'))
const StudyTipsSection = lazy(() => import('../components/home/StudyTipsSection'))
const ProgressOverview = lazy(() => import('../components/home/ProgressOverview'))

// Enhanced loading indicator with timeout detection
const EnhancedLoadingIndicator = ({ onShowDebugger, loadingTime }) => {
  const isSlowLoading = loadingTime > 5000; // Show warning after 5 seconds
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin opacity-60" style={{ animationDelay: '-0.15s' }}></div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Loading your dashboard...
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {isSlowLoading 
            ? "This is taking longer than usual. Please wait..." 
            : "Preparing your USMLE experience"
          }
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Loading time: {Math.round(loadingTime / 1000)}s
        </div>
        
        {isSlowLoading && (
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Slow loading detected</span>
              </div>
              <p>The app is taking longer than usual to load. This could be due to network issues or server load.</p>
            </div>
            
            <button
              onClick={onShowDebugger}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              Show Debug Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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

// Enhanced error display with retry functionality
const ErrorDisplay = ({ error, onRetry, onShowDebugger }) => (
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
      
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
        
        <button
          onClick={onShowDebugger}
          className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Debug Info
        </button>
      </div>
    </div>
  </div>
)

const HomeFixed = () => {
  const { user, profile } = useAuth()
  const { transitionTo } = useViewTransitions()
  const [showDebugger, setShowDebugger] = useState(false)
  const [loadingStartTime] = useState(Date.now())
  const [loadingTime, setLoadingTime] = useState(0)
  
  // Use optimized query hook for instant rendering
  const {
    data: userActivity,
    isLoading,
    isError,
    error,
    refetch,
    fetchStatus,
    status
  } = useUserActivityQuery(user?.id)

  // Track loading time
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(Date.now() - loadingStartTime)
    }, 1000)

    // Clear interval when loading is done
    if (!isLoading && !isError) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isLoading, isError, loadingStartTime])

  // Auto-show debugger for extremely slow loading
  useEffect(() => {
    if (isLoading && loadingTime > 15000) { // 15 seconds
      setShowDebugger(true)
    }
  }, [isLoading, loadingTime])

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

  // Handle different loading states
  if (isError) {
    return (
      <>
        <ErrorDisplay 
          error={error} 
          onRetry={refetch} 
          onShowDebugger={() => setShowDebugger(true)}
        />
        {showDebugger && (
          <HomeLoadingDebugger onClose={() => setShowDebugger(false)} />
        )}
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <EnhancedLoadingIndicator 
          onShowDebugger={() => setShowDebugger(true)}
          loadingTime={loadingTime}
        />
        {showDebugger && (
          <HomeLoadingDebugger onClose={() => setShowDebugger(false)} />
        )}
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
        <CacheStatusIndicators isRefreshing={fetchStatus === 'fetching'} isFromCache={status === 'success'} />
        
        {/* Debug button for development */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowDebugger(true)}
            className="fixed bottom-4 right-4 z-40 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            title="Show Debug Info"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        
        <div className="px-3 md:px-6 lg:px-8 pt-2 pb-3 max-w-4xl mx-auto">
          <Suspense fallback={<LoadingIndicator />}>
            <WelcomeSection user={user} profile={profile} isNewUser={isNewUser} />
            <HomeStats userStats={userStats} isNewUser={isNewUser} isLoading={false} />
            <HomeActions isNewUser={isNewUser} onNavigate={transitionTo} />
            <StudyTipsSection />
            <ProgressOverview userStats={userStats} isNewUser={isNewUser} />
          </Suspense>
        </div>
      </div>
      
      {showDebugger && (
        <HomeLoadingDebugger onClose={() => setShowDebugger(false)} />
      )}
    </>
  )
}

export default HomeFixed