/**
 * Error Types and User-Friendly Messages
 * Extracted from notifications.js to follow 250-line rule
 */

// Error types and their user-friendly messages
export const ERROR_TYPES = {
  FETCH_QUESTIONS_ERROR: {
    title: 'Question Loading Failed',
    message: 'Unable to load quiz questions. Please check your connection and try again.',
    severity: 'error',
    actions: ['retry', 'goHome']
  },
  USER_HISTORY_ERROR: {
    title: 'Progress Tracking Issue',
    message: 'Your progress may not be saved properly, but you can continue the quiz.',
    severity: 'warning',
    actions: ['continue']
  },
  SESSION_CREATION_ERROR: {
    title: 'Quiz Setup Failed',
    message: 'Unable to start the quiz session. Please try again.',
    severity: 'error',
    actions: ['retry', 'goHome']
  },
  RESPONSE_RECORDING_ERROR: {
    title: 'Answer Not Saved',
    message: 'Your answer may not have been recorded. You can continue, but progress might be lost.',
    severity: 'warning',
    actions: ['continue', 'retry']
  },
  INSUFFICIENT_QUESTIONS_ERROR: {
    title: 'Not Enough Questions',
    message: 'There aren\'t enough questions available for your selection. Try adjusting your filters.',
    severity: 'info',
    actions: ['goBack', 'tryDifferentSettings']
  },
  AUTHENTICATION_ERROR: {
    title: 'Authentication Required',
    message: 'Please log in to continue with your quiz.',
    severity: 'error',
    actions: ['login', 'goHome']
  },
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Check your internet connection and try again.',
    severity: 'error',
    actions: ['retry', 'offline']
  },
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    severity: 'error',
    actions: ['retry', 'goHome']
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    severity: 'warning',
    actions: ['retry']
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    message: 'The request took too long. Please try again.',
    severity: 'error',
    actions: ['retry', 'goHome']
  },
  PERMISSION_ERROR: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    severity: 'error',
    actions: ['goHome', 'login']
  },
  RATE_LIMIT_ERROR: {
    title: 'Too Many Requests',
    message: 'Please wait a moment before trying again.',
    severity: 'warning',
    actions: ['wait', 'retry']
  },
  MAINTENANCE_ERROR: {
    title: 'Service Maintenance',
    message: 'The service is temporarily unavailable for maintenance.',
    severity: 'info',
    actions: ['wait', 'goHome']
  }
}

// Severity levels for styling
export const SEVERITY_LEVELS = {
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-600 dark:text-green-400'
  }
}

// Action button configurations
export const ACTION_CONFIGS = {
  retry: {
    label: 'Try Again',
    variant: 'primary',
    icon: 'refresh'
  },
  goHome: {
    label: 'Go Home',
    variant: 'secondary',
    icon: 'home'
  },
  goBack: {
    label: 'Go Back',
    variant: 'secondary',
    icon: 'arrow-left'
  },
  continue: {
    label: 'Continue',
    variant: 'primary',
    icon: 'arrow-right'
  },
  login: {
    label: 'Sign In',
    variant: 'primary',
    icon: 'user'
  },
  offline: {
    label: 'Work Offline',
    variant: 'secondary',
    icon: 'wifi-off'
  },
  wait: {
    label: 'Wait',
    variant: 'secondary',
    icon: 'clock'
  },
  tryDifferentSettings: {
    label: 'Change Settings',
    variant: 'secondary',
    icon: 'settings'
  }
}
