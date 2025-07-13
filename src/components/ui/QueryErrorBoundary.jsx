import { Component } from 'react';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import logger from '../../utils/logger';

/**
 * Specialized Error Boundary for Query/Database errors
 * Provides fallback UI when data fetching fails
 */
class QueryErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      lastQueryKey: props.queryKey || null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Reset error boundary when query key changes (new query)
    if (nextProps.queryKey && nextProps.queryKey !== prevState.lastQueryKey) {
      return {
        hasError: false,
        error: null,
        retryCount: 0,
        lastQueryKey: nextProps.queryKey
      };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    // Don't trigger error boundary for certain types of errors
    if (error?.name === 'AbortError' ||
        error?.message?.includes('AbortError') ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('Network request failed') && error?.message?.includes('timeout')) {
      // These are expected errors that should be handled gracefully
      return { hasError: false, error: null };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log significant errors, not expected timeouts or cancellations
    if (!error?.name?.includes('AbortError') &&
        !error?.message?.includes('cancelled') &&
        !error?.message?.includes('timeout')) {
      logger.error("Query error boundary triggered", {
        errorInfo,
        queryType: this.props.queryType || 'unknown',
        retryCount: this.state.retryCount,
        errorType: error?.name || 'Unknown',
        isNetworkError: error?.message?.includes('fetch') || error?.message?.includes('Network')
      }, error);
    }
  }

  handleRetry = () => {
    const { error } = this.state;
    const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('Network');
    const isTimeoutError = error?.message?.includes('timeout') || error?.message?.includes('Timeout');

    // Add a small delay for network/timeout errors to allow recovery
    const retryDelay = (isNetworkError || isTimeoutError) ? 1000 : 0;

    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }));

      // Call onRetry prop if provided
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }, retryDelay);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      const { error } = this.state;
      const isTimeoutError = error?.message?.includes('timeout') || error?.message?.includes('Timeout');
      const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('Network');
      const canRetry = this.state.retryCount < 3;
      
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center max-w-sm">
            <div className="mb-4">
              {isNetworkError ? (
                <Database className="w-12 h-12 text-red-500 mx-auto mb-3" />
              ) : (
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isTimeoutError ? 'Request Timeout' :
                 isNetworkError ? 'Connection Error' :
                 'Data Loading Error'}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {isTimeoutError ? 'The request took too long to complete.' :
                 isNetworkError ? 'Unable to connect to the server.' :
                 'Failed to load the requested data.'}
              </p>
            </div>
            
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            {!canRetry && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum retry attempts reached. Please refresh the page.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QueryErrorBoundary;
