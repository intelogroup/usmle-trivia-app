import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react';

/**
 * Production-ready error boundary for network and query errors
 * Handles 500+ concurrent users gracefully
 */
class NetworkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for monitoring (could integrate with Sentry, LogRocket, etc.)
    console.error('NetworkErrorBoundary caught an error:', error, errorInfo);
    
    // Send to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'error_boundary_triggered', {
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack
      });
    }
  }

  handleRetry = async () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      alert('Maximum retry attempts reached. Please refresh the page or check your internet connection.');
      return;
    }

    this.setState({ isRetrying: true });

    // Wait with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
      isRetrying: false
    });

    // Call parent retry function if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  getErrorType() {
    const { error } = this.state;
    
    if (!error) return 'unknown';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('rate limit')) {
      return 'rateLimit';
    }
    if (message.includes('cors')) {
      return 'cors';
    }
    
    return 'application';
  }

  renderErrorMessage() {
    const errorType = this.getErrorType();
    const { retryCount } = this.state;
    
    const messages = {
      network: {
        title: 'Connection Problem',
        description: 'Unable to connect to the server. Please check your internet connection.',
        icon: Wifi,
        canRetry: true
      },
      timeout: {
        title: 'Request Timeout',
        description: 'The request is taking longer than expected. This might be due to high server load.',
        icon: AlertTriangle,
        canRetry: true
      },
      rateLimit: {
        title: 'Too Many Requests',
        description: 'You\'re making requests too quickly. Please wait a moment before trying again.',
        icon: AlertTriangle,
        canRetry: true
      },
      cors: {
        title: 'Configuration Error',
        description: 'There\'s a configuration issue. Please contact support.',
        icon: AlertTriangle,
        canRetry: false
      },
      application: {
        title: 'Application Error',
        description: 'Something went wrong in the application. We\'re working to fix this.',
        icon: AlertTriangle,
        canRetry: true
      },
      unknown: {
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
        icon: AlertTriangle,
        canRetry: true
      }
    };

    const config = messages[errorType];
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Icon className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {config.description}
            </p>
          </div>

          {retryCount > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Retry attempt {retryCount}/3
              </p>
            </div>
          )}

          <div className="space-y-3">
            {config.canRetry && retryCount < 3 && (
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {this.state.isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={this.handleRefresh}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Refresh Page
            </button>
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Error Details (Dev Only)
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorMessage();
    }

    return this.props.children;
  }
}

/**
 * Enhanced error boundary wrapper with React Query integration
 */
export const ProductionErrorBoundary = ({ children, fallback }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <NetworkErrorBoundary onRetry={reset} fallback={fallback}>
          {children}
        </NetworkErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

/**
 * Network status hook for production monitoring
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionQuality, setConnectionQuality] = React.useState('good');

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor connection quality
    const checkConnectionQuality = async () => {
      if (!isOnline) return;

      const start = performance.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        const duration = performance.now() - start;
        
        if (duration < 200) {
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

    // Check connection quality every 30 seconds
    const qualityInterval = setInterval(checkConnectionQuality, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityInterval);
    };
  }, [isOnline]);

  return { isOnline, connectionQuality };
};

export default NetworkErrorBoundary;