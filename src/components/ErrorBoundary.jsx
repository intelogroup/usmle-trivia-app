import { Component } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import logger from '../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    logger.error("Uncaught error in React component", {
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.fallbackComponent || 'default',
      retryCount: this.state.retryCount
    }, error);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      const { error } = this.state;
      const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('Network');
      const isAuthError = error?.message?.includes('auth') || error?.message?.includes('unauthorized');

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isNetworkError ? 'Connection Error' :
                 isAuthError ? 'Authentication Error' :
                 'Something went wrong'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isNetworkError ? 'Please check your internet connection and try again.' :
                 isAuthError ? 'Please sign in again to continue.' :
                 'We encountered an unexpected error. Please try again.'}
              </p>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="text-left bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs mb-4">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4" />
                {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
