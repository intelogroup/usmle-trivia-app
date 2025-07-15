/**
 * Refactored Notification System
 * Reduced from 343+ lines to under 100 lines by extracting modules
 * Follows the 250-line rule from augment-code-rules.md
 */

// Re-export everything from the modular structure
export { ERROR_TYPES, SEVERITY_LEVELS, ACTION_CONFIGS } from './notifications/errorTypes'
export { 
  parseError, 
  createErrorMessage, 
  isRetryableError, 
  requiresAuth, 
  getRetryDelay, 
  formatErrorForDisplay 
} from './notifications/errorParser'
export { 
  default as toastManager,
  success,
  error,
  warning,
  info,
  loading,
  quizError,
  quizSuccess,
  quizWarning,
  authError,
  authSuccess,
  networkError
} from './notifications/toastManager'

// Convenience functions for common use cases
export const showQuizError = (error, context = {}) => {
  return toastManager.quizError(error, context)
}

export const showAuthError = (error, context = {}) => {
  return toastManager.authError(error, context)
}

export const showNetworkError = (error, context = {}) => {
  return toastManager.networkError(error, context)
}

export const showSuccess = (message, options = {}) => {
  return toastManager.success(message, options)
}

export const showWarning = (message, options = {}) => {
  return toastManager.warning(message, options)
}

export const showInfo = (message, options = {}) => {
  return toastManager.info(message, options)
}

export const showLoading = (message, options = {}) => {
  return toastManager.loading(message, options)
}

// Retry mechanism with exponential backoff
export const withRetry = async (fn, maxAttempts = 3, context = {}) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts || !isRetryableError(error)) {
        throw error
      }
      
      const delay = getRetryDelay(error, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Error boundary helper
export const handleError = (error, context = {}) => {
  const errorMessage = createErrorMessage(error, context)
  toastManager.error(error, context)
  return errorMessage
}

// Clear all notifications
export const clearAllNotifications = () => {
  toastManager.clearAll()
}

// Subscribe to notification changes
export const subscribeToNotifications = (listener) => {
  return toastManager.subscribe(listener)
}

// Default export for backward compatibility
export default {
  ERROR_TYPES,
  SEVERITY_LEVELS,
  ACTION_CONFIGS,
  parseError,
  createErrorMessage,
  isRetryableError,
  requiresAuth,
  getRetryDelay,
  formatErrorForDisplay,
  toastManager,
  showQuizError,
  showAuthError,
  showNetworkError,
  showSuccess,
  showWarning,
  showInfo,
  showLoading,
  withRetry,
  handleError,
  clearAllNotifications,
  subscribeToNotifications
}
