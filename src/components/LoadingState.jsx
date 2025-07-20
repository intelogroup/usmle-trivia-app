import React from 'react';
import { Loader2, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Enhanced loading states for better UX
 * Provides progressive feedback and handles various loading scenarios
 */

export const LoadingSpinner = ({ size = 'medium', message = 'Loading...', showMessage = true }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {showMessage && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};

export const ProgressiveLoader = ({ 
  stages = [],
  currentStage = 0,
  error = null,
  onRetry = null,
  timeout = 30000
}) => {
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [hasTimedOut, setHasTimedOut] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 100;
        if (newTime >= timeout) {
          setHasTimedOut(true);
          clearInterval(interval);
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeout]);

  if (hasTimedOut && !error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-orange-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Taking longer than expected
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The app is still loading, but it's taking longer than usual. This might be due to slow network conditions.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading Failed
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Something went wrong while loading'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPercentage = stages.length > 0 ? ((currentStage + 1) / stages.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 max-w-md mx-auto">
      {/* Main loading spinner */}
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      
      {/* Progress bar */}
      {stages.length > 0 && (
        <div className="w-full">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>
      )}

      {/* Current stage */}
      {stages[currentStage] && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {stages[currentStage].title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stages[currentStage].description}
          </p>
        </div>
      )}

      {/* All stages list */}
      {stages.length > 0 && (
        <div className="w-full space-y-2">
          {stages.map((stage, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                index < currentStage 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : index === currentStage
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              {index < currentStage ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : index === currentStage ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              )}
              <span className="text-sm font-medium">{stage.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Time indicator */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Loading for {Math.round(timeElapsed / 1000)}s
        {timeElapsed > 5000 && (
          <div className="mt-1 text-orange-600 dark:text-orange-400">
            Slow network detected
          </div>
        )}
      </div>
    </div>
  );
};

export const SkeletonLoader = ({ type = 'list', count = 3, className = '' }) => {
  const skeletonClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

  if (type === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array(count).fill().map((_, i) => (
          <div key={i} className="p-4 border dark:border-gray-700 rounded-lg">
            <div className={`${skeletonClass} h-4 w-3/4 mb-3`} />
            <div className={`${skeletonClass} h-3 w-full mb-2`} />
            <div className={`${skeletonClass} h-3 w-2/3`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'leaderboard') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array(count).fill().map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border dark:border-gray-700 rounded-lg">
            <div className={`${skeletonClass} w-8 h-8 rounded-full`} />
            <div className="flex-1">
              <div className={`${skeletonClass} h-4 w-1/2 mb-2`} />
              <div className={`${skeletonClass} h-3 w-1/4`} />
            </div>
            <div className={`${skeletonClass} h-6 w-12 rounded-full`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'question') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className={`${skeletonClass} h-6 w-full`} />
        <div className={`${skeletonClass} h-4 w-3/4`} />
        <div className="space-y-3">
          {Array(4).fill().map((_, i) => (
            <div key={i} className={`${skeletonClass} h-12 rounded-lg`} />
          ))}
        </div>
      </div>
    );
  }

  // Default list type
  return (
    <div className={`space-y-3 ${className}`}>
      {Array(count).fill().map((_, i) => (
        <div key={i} className={`${skeletonClass} h-4 w-full`} />
      ))}
    </div>
  );
};

export const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionQuality, setConnectionQuality] = React.useState('unknown');

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality
    const checkQuality = async () => {
      if (!isOnline) {
        setConnectionQuality('offline');
        return;
      }

      const start = performance.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        const duration = performance.now() - start;
        
        if (duration < 200) {
          setConnectionQuality('excellent');
        } else if (duration < 500) {
          setConnectionQuality('good');
        } else if (duration < 1000) {
          setConnectionQuality('fair');
        } else {
          setConnectionQuality('poor');
        }
      } catch {
        setConnectionQuality('poor');
      }
    };

    // Check initially and then every 30 seconds
    checkQuality();
    const interval = setInterval(checkQuality, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  }

  if (connectionQuality === 'poor') {
    return (
      <div className="fixed top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-medium">Slow connection</span>
      </div>
    );
  }

  return null;
};

export default {
  LoadingSpinner,
  ProgressiveLoader,
  SkeletonLoader,
  NetworkStatusIndicator
};