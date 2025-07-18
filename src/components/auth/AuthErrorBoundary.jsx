import { Component } from 'react';
import { AlertTriangle, LogIn, RefreshCw } from 'lucide-react';
import logger from '../../utils/logger';

/**
 * Specialized Error Boundary for Authentication flows
 * Provides auth-specific error handling and recovery options
 */
class AuthErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    logger.error("Authentication error boundary triggered", { 
      errorInfo,
      authFlow: this.props.authFlow || 'unknown',
      userAgent: navigator.userAgent
    }, error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleGoToLogin = () => {
    window.location.href = '/login';
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isSessionError = error?.message?.includes('session') || error?.message?.includes('token');
      const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('Network');
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center max-w-md w-full">
            <div className="mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isSessionError ? 'Session Expired' : 
                 isNetworkError ? 'Connection Error' : 
                 'Authentication Error'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isSessionError ? 'Your session has expired. Please sign in again.' :
                 isNetworkError ? 'Unable to connect to our servers. Please check your connection.' :
                 'We encountered an issue with authentication. Please try again.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {!isSessionError && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
              
              <button
                onClick={this.handleGoToLogin}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {isSessionError ? 'Sign In Again' : 'Go to Login'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
