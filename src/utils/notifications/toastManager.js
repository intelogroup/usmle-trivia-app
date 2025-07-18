import { formatErrorForDisplay } from './errorParser'
import logger from '../logger'

/**
 * Toast Notification Manager
 * Extracted from notifications.js to follow 250-line rule
 */

// Toast notification queue
let toastQueue = []
let toastListeners = []
let nextToastId = 1

// Toast manager class
class ToastManager {
  constructor() {
    this.toasts = []
    this.listeners = []
  }

  // Add a toast notification
  addToast(toast) {
    const id = `toast-${nextToastId++}`
    const newToast = {
      id,
      ...toast,
      timestamp: Date.now()
    }

    this.toasts.push(newToast)
    this.notifyListeners()

    // Auto-hide if specified
    if (newToast.autoHide) {
      setTimeout(() => {
        this.removeToast(id)
      }, newToast.hideDelay || 5000)
    }

    return id
  }

  // Remove a toast notification
  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyListeners()
  }

  // Clear all toasts
  clearAll() {
    this.toasts = []
    this.notifyListeners()
  }

  // Get all toasts
  getToasts() {
    return [...this.toasts]
  }

  // Subscribe to toast changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.toasts)
      } catch (error) {
        logger.error('Error in toast listener', error)
      }
    })
  }

  // Show success toast
  success(message, options = {}) {
    return this.addToast({
      type: 'success',
      title: options.title || 'Success',
      message,
      severity: 'success',
      autoHide: true,
      hideDelay: 3000,
      dismissible: true,
      ...options
    })
  }

  // Show error toast
  error(error, context = {}, options = {}) {
    const errorData = formatErrorForDisplay(error, context)
    return this.addToast({
      type: 'error',
      ...errorData,
      ...options
    })
  }

  // Show warning toast
  warning(message, options = {}) {
    return this.addToast({
      type: 'warning',
      title: options.title || 'Warning',
      message,
      severity: 'warning',
      autoHide: true,
      hideDelay: 5000,
      dismissible: true,
      ...options
    })
  }

  // Show info toast
  info(message, options = {}) {
    return this.addToast({
      type: 'info',
      title: options.title || 'Information',
      message,
      severity: 'info',
      autoHide: true,
      hideDelay: 4000,
      dismissible: true,
      ...options
    })
  }

  // Show loading toast
  loading(message, options = {}) {
    return this.addToast({
      type: 'loading',
      title: options.title || 'Loading',
      message,
      severity: 'info',
      autoHide: false,
      dismissible: false,
      showSpinner: true,
      ...options
    })
  }

  // Update existing toast
  updateToast(id, updates) {
    const toastIndex = this.toasts.findIndex(toast => toast.id === id)
    if (toastIndex !== -1) {
      this.toasts[toastIndex] = {
        ...this.toasts[toastIndex],
        ...updates
      }
      this.notifyListeners()
    }
  }

  // Show quiz-specific notifications
  quizError(error, context = {}) {
    return this.error(error, { ...context, source: 'quiz' })
  }

  quizSuccess(message, options = {}) {
    return this.success(message, { ...options, source: 'quiz' })
  }

  quizWarning(message, options = {}) {
    return this.warning(message, { ...options, source: 'quiz' })
  }

  // Show auth-specific notifications
  authError(error, context = {}) {
    return this.error(error, { ...context, source: 'auth' })
  }

  authSuccess(message, options = {}) {
    return this.success(message, { ...options, source: 'auth' })
  }

  // Show network-specific notifications
  networkError(error, context = {}) {
    return this.error(error, { ...context, source: 'network' })
  }

  // Batch operations
  showMultiple(toasts) {
    const ids = []
    toasts.forEach(toast => {
      const id = this.addToast(toast)
      ids.push(id)
    })
    return ids
  }

  // Clear toasts by type
  clearByType(type) {
    this.toasts = this.toasts.filter(toast => toast.type !== type)
    this.notifyListeners()
  }

  // Clear toasts by source
  clearBySource(source) {
    this.toasts = this.toasts.filter(toast => toast.source !== source)
    this.notifyListeners()
  }

  // Get toast count by severity
  getCountBySeverity(severity) {
    return this.toasts.filter(toast => toast.severity === severity).length
  }

  // Check if has errors
  hasErrors() {
    return this.getCountBySeverity('error') > 0
  }

  // Check if has warnings
  hasWarnings() {
    return this.getCountBySeverity('warning') > 0
  }
}

// Create singleton instance
const toastManager = new ToastManager()

export default toastManager

// Export convenience functions
export const {
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
} = toastManager
