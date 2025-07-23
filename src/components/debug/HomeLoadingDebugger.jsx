import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserActivityQuery } from '../../hooks/useOptimizedQueries';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * Home Loading Debugger Component
 * Shows detailed loading states and helps identify issues
 */
const HomeLoadingDebugger = ({ onClose }) => {
  const [debugInfo, setDebugInfo] = useState({
    authState: 'checking',
    queryState: 'idle',
    errors: [],
    timestamps: {},
    details: {}
  });

  const { user, profile, loading: authLoading, isConfigured } = useAuth();
  const {
    data: userActivity,
    isLoading: queryLoading,
    isError: queryError,
    error: queryErrorDetails,
    fetchStatus,
    status
  } = useUserActivityQuery(user?.id);

  useEffect(() => {
    const startTime = Date.now();
    
    setDebugInfo(prev => ({
      ...prev,
      timestamps: { ...prev.timestamps, start: startTime },
      details: {
        ...prev.details,
        authLoading,
        queryLoading,
        fetchStatus,
        status,
        isConfigured,
        hasUser: !!user,
        hasProfile: !!profile,
        hasUserActivity: !!userActivity
      }
    }));

    // Update auth state
    if (!authLoading) {
      setDebugInfo(prev => ({
        ...prev,
        authState: user ? 'authenticated' : 'unauthenticated',
        timestamps: { ...prev.timestamps, authComplete: Date.now() }
      }));
    }

    // Update query state
    if (queryError) {
      setDebugInfo(prev => ({
        ...prev,
        queryState: 'error',
        errors: [...prev.errors, queryErrorDetails?.message || 'Unknown query error'],
        timestamps: { ...prev.timestamps, queryError: Date.now() }
      }));
    } else if (!queryLoading && userActivity) {
      setDebugInfo(prev => ({
        ...prev,
        queryState: 'success',
        timestamps: { ...prev.timestamps, queryComplete: Date.now() }
      }));
    } else if (queryLoading) {
      setDebugInfo(prev => ({
        ...prev,
        queryState: 'loading',
        timestamps: { ...prev.timestamps, queryStart: Date.now() }
      }));
    }

  }, [authLoading, queryLoading, queryError, user, profile, userActivity, fetchStatus, status, isConfigured]);

  const getLoadingTime = (start, end) => {
    if (!start || !end) return 'Pending...';
    return `${end - start}ms`;
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'success':
      case 'authenticated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'loading':
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'success':
      case 'authenticated':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'loading':
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🔍 Home Loading Debugger
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Auth State */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Authentication State
          </h3>
          <div className={`p-3 rounded-lg border flex items-center gap-3 ${getStateColor(debugInfo.authState)}`}>
            {getStateIcon(debugInfo.authState)}
            <div>
              <div className="font-medium">
                {debugInfo.authState === 'authenticated' ? 'User Authenticated' : 
                 debugInfo.authState === 'unauthenticated' ? 'No Authentication' :
                 'Checking Authentication...'}
              </div>
              <div className="text-sm">
                Time: {getLoadingTime(debugInfo.timestamps.start, debugInfo.timestamps.authComplete)}
              </div>
            </div>
          </div>
          
          {/* Auth Details */}
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div>Supabase Configured: {isConfigured ? '✅' : '❌'}</div>
            <div>Has User: {debugInfo.details.hasUser ? '✅' : '❌'}</div>
            <div>Has Profile: {debugInfo.details.hasProfile ? '✅' : '❌'}</div>
            {user && <div>User Email: {user.email}</div>}
          </div>
        </div>

        {/* Query State */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Data Query State
          </h3>
          <div className={`p-3 rounded-lg border flex items-center gap-3 ${getStateColor(debugInfo.queryState)}`}>
            {getStateIcon(debugInfo.queryState)}
            <div>
              <div className="font-medium">
                {debugInfo.queryState === 'success' ? 'Data Loaded Successfully' :
                 debugInfo.queryState === 'error' ? 'Query Failed' :
                 debugInfo.queryState === 'loading' ? 'Loading Data...' :
                 'Query Idle'}
              </div>
              <div className="text-sm">
                Time: {getLoadingTime(debugInfo.timestamps.queryStart, debugInfo.timestamps.queryComplete)}
              </div>
            </div>
          </div>

          {/* Query Details */}
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div>React Query Status: {debugInfo.details.status || 'Unknown'}</div>
            <div>Fetch Status: {debugInfo.details.fetchStatus || 'Unknown'}</div>
            <div>Auth Loading: {debugInfo.details.authLoading ? '⏳' : '✅'}</div>
            <div>Query Loading: {debugInfo.details.queryLoading ? '⏳' : '✅'}</div>
            <div>Has User Activity: {debugInfo.details.hasUserActivity ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              Errors Found
            </h3>
            <div className="space-y-2">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Performance Metrics
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm space-y-1">
            <div>Auth Time: {getLoadingTime(debugInfo.timestamps.start, debugInfo.timestamps.authComplete)}</div>
            <div>Query Time: {getLoadingTime(debugInfo.timestamps.queryStart, debugInfo.timestamps.queryComplete)}</div>
            <div>Total Time: {getLoadingTime(debugInfo.timestamps.start, 
              debugInfo.timestamps.queryComplete || debugInfo.timestamps.authComplete || Date.now())}</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            💡 Recommendations
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {!isConfigured && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                ⚠️ Supabase is not configured properly. Check environment variables.
              </div>
            )}
            
            {debugInfo.queryState === 'error' && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                ❌ Data query failed. Check database connectivity and user permissions.
              </div>
            )}
            
            {debugInfo.queryState === 'loading' && (
              getLoadingTime(debugInfo.timestamps.queryStart, Date.now()).includes('ms') &&
              parseInt(getLoadingTime(debugInfo.timestamps.queryStart, Date.now()).replace('ms', '')) > 5000 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded text-orange-700">
                  🐌 Query is taking longer than 5 seconds. This may indicate a performance issue.
                </div>
              )
            )}
            
            {debugInfo.authState === 'checking' && (
              getLoadingTime(debugInfo.timestamps.start, Date.now()).includes('ms') &&
              parseInt(getLoadingTime(debugInfo.timestamps.start, Date.now()).replace('ms', '')) > 3000 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded text-orange-700">
                  🐌 Authentication is taking longer than 3 seconds. This may indicate a network issue.
                </div>
              )
            )}
            
            {debugInfo.authState === 'authenticated' && debugInfo.queryState === 'success' && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700">
                ✅ Everything looks good! The loading issue may be UI-related.
              </div>
            )}
          </div>
        </div>

        {/* Debug Data */}
        <details className="mb-4">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-300 font-medium">
            🔧 Raw Debug Data
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
            {JSON.stringify({ debugInfo, userActivity }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default HomeLoadingDebugger;