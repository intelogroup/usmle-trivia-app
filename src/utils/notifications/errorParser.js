import { ERROR_TYPES } from './errorTypes'
import logger from '../logger'

/**
 * Error Parser Utilities
 * Extracted from notifications.js to follow 250-line rule
 */

// Parse error and return appropriate error type
export const parseError = (error) => {
  if (!error) {
    return ERROR_TYPES.UNKNOWN_ERROR
  }

  const errorMessage = error.message || error.toString()
  const errorCode = error.code || error.status

  // Network errors
  if (errorMessage.includes('fetch') || 
      errorMessage.includes('network') || 
      errorMessage.includes('NetworkError') ||
      errorCode === 'NETWORK_ERROR') {
    return ERROR_TYPES.NETWORK_ERROR
  }

  // Authentication errors
  if (errorMessage.includes('auth') || 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('login') ||
      errorCode === 401) {
    return ERROR_TYPES.AUTHENTICATION_ERROR
  }

  // Permission errors
  if (errorMessage.includes('permission') || 
      errorMessage.includes('forbidden') ||
      errorCode === 403) {
    return ERROR_TYPES.PERMISSION_ERROR
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || 
      errorMessage.includes('too many requests') ||
      errorCode === 429) {
    return ERROR_TYPES.RATE_LIMIT_ERROR
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('timed out') ||
      errorCode === 'TIMEOUT') {
    return ERROR_TYPES.TIMEOUT_ERROR
  }

  // Validation errors
  if (errorMessage.includes('validation') || 
      errorMessage.includes('invalid') ||
      errorCode === 400) {
    return ERROR_TYPES.VALIDATION_ERROR
  }

  // Question-related errors
  if (errorMessage.includes('question') || 
      errorMessage.includes('insufficient')) {
    if (errorMessage.includes('insufficient') || errorMessage.includes('not enough')) {
      return ERROR_TYPES.INSUFFICIENT_QUESTIONS_ERROR
    }
    return ERROR_TYPES.FETCH_QUESTIONS_ERROR
  }

  // Session errors
  if (errorMessage.includes('session') || 
      errorMessage.includes('quiz setup')) {
    return ERROR_TYPES.SESSION_CREATION_ERROR
  }

  // Response recording errors
  if (errorMessage.includes('response') || 
      errorMessage.includes('answer') || 
      errorMessage.includes('recording')) {
    return ERROR_TYPES.RESPONSE_RECORDING_ERROR
  }

  // User history errors
  if (errorMessage.includes('history') || 
      errorMessage.includes('progress')) {
    return ERROR_TYPES.USER_HISTORY_ERROR
  }

  // Maintenance mode
  if (errorMessage.includes('maintenance') || 
      errorMessage.includes('unavailable') ||
      errorCode === 503) {
    return ERROR_TYPES.MAINTENANCE_ERROR
  }

  // Default to unknown error
  return ERROR_TYPES.UNKNOWN_ERROR
}

// Create user-friendly error message
export const createErrorMessage = (error, context = {}) => {
  const errorType = parseError(error)
  
  // Log the original error for debugging
  logger.error('Error occurred', {
    originalError: error,
    errorType: errorType.title,
    context
  })

  return {
    ...errorType,
    originalError: error,
    context,
    timestamp: new Date().toISOString()
  }
}

// Check if error is retryable
export const isRetryableError = (error) => {
  const errorType = parseError(error)
  return errorType.actions.includes('retry')
}

// Check if error requires authentication
export const requiresAuth = (error) => {
  const errorType = parseError(error)
  return errorType.actions.includes('login')
}

// Get retry delay based on error type
export const getRetryDelay = (error, attemptCount = 1) => {
  const errorType = parseError(error)
  
  // Base delays in milliseconds
  const baseDelays = {
    NETWORK_ERROR: 1000,
    TIMEOUT_ERROR: 2000,
    RATE_LIMIT_ERROR: 5000,
    UNKNOWN_ERROR: 1000
  }
  
  const baseDelay = baseDelays[errorType.title] || 1000
  
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attemptCount - 1)
  const jitter = Math.random() * 0.1 * exponentialDelay
  
  return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
}

// Format error for display
export const formatErrorForDisplay = (error, context = {}) => {
  const errorMessage = createErrorMessage(error, context)
  
  return {
    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: errorMessage.title,
    message: errorMessage.message,
    severity: errorMessage.severity,
    actions: errorMessage.actions,
    timestamp: errorMessage.timestamp,
    dismissible: true,
    autoHide: errorMessage.severity !== 'error',
    hideDelay: errorMessage.severity === 'info' ? 5000 : 8000
  }
}
