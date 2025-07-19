import { Component } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { motion } from "framer-motion";
import { ERROR_MESSAGES, BUTTON_LABELS } from "../../constants/ui";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
      hasError: true,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // TODO: Log to error reporting service (Sentry, LogRocket, etc.)
    // this.logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, level = "component" } = this.props;

      // Use custom fallback if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
            goHome={this.handleGoHome}
          />
        );
      }

      // Default error UI based on error level
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card dark:glass-card-dark rounded-2xl p-8 max-w-md w-full text-center space-y-6"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {level === "app" ? "App Error" : "Something went wrong"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {level === "app"
                  ? "The application encountered an unexpected error."
                  : "This section encountered an error. You can try again or return to the home page."}
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Bug className="inline w-4 h-4 mr-1" />
                  Technical Details
                </summary>
                <div className="glass-subtle dark:glass-subtle-dark rounded-lg p-3 text-xs">
                  <div className="font-mono text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo.componentStack && (
                    <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Retry attempts: {this.state.retryCount}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleRetry}
                className="flex-1 glass-button dark:glass-button-dark px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4" />
                {this.state.retryCount >= 3
                  ? "Max retries reached"
                  : BUTTON_LABELS.TRY_AGAIN}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleGoHome}
                className="flex-1 glass-gradient-primary text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {BUTTON_LABELS.GO_HOME}
              </motion.button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If the problem persists, please refresh the page or contact
              support.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for hooks
export const ErrorBoundaryWrapper = ({
  children,
  fallback,
  level = "component",
  onError,
}) => {
  return (
    <ErrorBoundary fallback={fallback} level={level} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

// Specific error boundaries for different sections
export const QuizErrorBoundary = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
);

export const AppErrorBoundary = ({ children }) => (
  <ErrorBoundary level="app">{children}</ErrorBoundary>
);

export default ErrorBoundary;
