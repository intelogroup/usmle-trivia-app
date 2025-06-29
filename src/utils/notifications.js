// Notification system for user-facing errors and messages
// Provides toast notifications, retry mechanisms, and user-friendly error handling

import logger from './logger';

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
  }
};

// Action handlers for different error recovery options
export const ERROR_ACTIONS = {
  retry: {
    label: 'Try Again',
    variant: 'primary',
    handler: (context) => context.retry?.()
  },
  goHome: {
    label: 'Go Home',
    variant: 'secondary',
    handler: (context) => context.navigate?.('/')
  },
  goBack: {
    label: 'Go Back',
    variant: 'secondary',
    handler: (context) => context.navigate?.(-1)
  },
  continue: {
    label: 'Continue Anyway',
    variant: 'secondary',
    handler: (context) => context.continue?.()
  },
  login: {
    label: 'Log In',
    variant: 'primary',
    handler: (context) => context.navigate?.('/login')
  },
  offline: {
    label: 'Use Offline Mode',
    variant: 'secondary',
    handler: (context) => context.enableOfflineMode?.()
  },
  tryDifferentSettings: {
    label: 'Change Settings',
    variant: 'secondary',
    handler: (context) => context.navigate?.(-1)
  }
};

class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
  }

  // Show a notification to the user
  show(type, customMessage = null, context = {}) {
    const errorConfig = ERROR_TYPES[type] || ERROR_TYPES.UNKNOWN_ERROR;
    const id = this._generateId();
    
    const notification = {
      id,
      type,
      title: errorConfig.title,
      message: customMessage || errorConfig.message,
      severity: errorConfig.severity,
      actions: errorConfig.actions.map(actionKey => ({
        ...ERROR_ACTIONS[actionKey],
        key: actionKey
      })),
      context,
      timestamp: Date.now(),
      dismissed: false
    };

    this.notifications.set(id, notification);
    
    // Log the notification
    logger.info('User notification shown', {
      notificationId: id,
      type,
      severity: errorConfig.severity,
      hasCustomMessage: !!customMessage
    });

    // Auto-dismiss non-critical notifications after 10 seconds
    if (errorConfig.severity !== 'error') {
      setTimeout(() => this.dismiss(id), 10000);
    }

    return notification;
  }

  // Dismiss a notification
  dismiss(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.dismissed = true;
      this.notifications.delete(id);
      logger.debug('Notification dismissed', { notificationId: id });
    }
  }

  // Dismiss all notifications
  dismissAll() {
    const count = this.notifications.size;
    this.notifications.clear();
    logger.debug('All notifications dismissed', { count });
  }

  // Get all active notifications
  getAll() {
    return Array.from(this.notifications.values()).filter(n => !n.dismissed);
  }

  // Handle error with automatic retry logic
  async handleWithRetry(operation, operationName, context = {}) {
    const retryKey = `${operationName}_${Date.now()}`;
    this.retryAttempts.set(retryKey, 0);

    const attemptOperation = async () => {
      const attempts = this.retryAttempts.get(retryKey) || 0;
      
      try {
        logger.debug('Attempting operation', { operationName, attempt: attempts + 1 });
        const result = await operation();
        
        // Success - clean up retry tracking
        this.retryAttempts.delete(retryKey);
        logger.info('Operation succeeded', { operationName, attempts: attempts + 1 });
        
        return result;
      } catch (error) {
        const newAttempts = attempts + 1;
        this.retryAttempts.set(retryKey, newAttempts);
        
        logger.warn('Operation failed', {
          operationName,
          attempt: newAttempts,
          error: error.message
        });

        if (newAttempts >= this.maxRetries) {
          // Max retries reached - show error notification
          this.retryAttempts.delete(retryKey);
          this._handleFinalError(error, operationName, context);
          throw error;
        } else {
          // Schedule retry with exponential backoff
          const delay = this.retryDelay * Math.pow(2, newAttempts - 1);
          logger.info('Scheduling retry', { operationName, delay, attempt: newAttempts + 1 });
          
          await this._delay(delay);
          return attemptOperation();
        }
      }
    };

    return attemptOperation();
  }

  // Handle final error after all retries exhausted
  _handleFinalError(error, operationName, context) {
    const errorType = this._classifyError(error, operationName);
    const notification = this.show(errorType, null, {
      ...context,
      retry: () => this.handleWithRetry(context.operation, operationName, context),
      originalError: error
    });

    logger.error('Operation failed after all retries', {
      operationName,
      errorType,
      notificationId: notification.id
    }, error);
  }

  // Classify error type based on error details and operation
  _classifyError(error, operationName) {
    // Network-related errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return 'NETWORK_ERROR';
    }

    // Authentication errors
    if (error.message?.includes('auth') || error.status === 401) {
      return 'AUTHENTICATION_ERROR';
    }

    // Insufficient data errors
    if (error.message?.includes('not enough') || error.message?.includes('no questions')) {
      return 'INSUFFICIENT_QUESTIONS_ERROR';
    }

    // Operation-specific classification
    switch (operationName) {
      case 'fetchQuestions':
      case 'fetchQuestionsForUser':
        return 'FETCH_QUESTIONS_ERROR';
      case 'createQuizSession':
        return 'SESSION_CREATION_ERROR';
      case 'recordQuizResponse':
        return 'RESPONSE_RECORDING_ERROR';
      case 'updateUserQuestionHistory':
        return 'USER_HISTORY_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  // Utility methods
  _generateId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Show success message
  showSuccess(message, duration = 5000) {
    const id = this._generateId();
    const notification = {
      id,
      type: 'SUCCESS',
      title: 'Success',
      message,
      severity: 'success',
      actions: [],
      timestamp: Date.now(),
      dismissed: false
    };

    this.notifications.set(id, notification);
    
    // Auto-dismiss success messages
    setTimeout(() => this.dismiss(id), duration);
    
    logger.info('Success notification shown', { message });
    return notification;
  }

  // Show info message
  showInfo(message, duration = 8000) {
    const id = this._generateId();
    const notification = {
      id,
      type: 'INFO',
      title: 'Information',
      message,
      severity: 'info',
      actions: [],
      timestamp: Date.now(),
      dismissed: false
    };

    this.notifications.set(id, notification);
    
    // Auto-dismiss info messages
    setTimeout(() => this.dismiss(id), duration);
    
    logger.info('Info notification shown', { message });
    return notification;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;

// Convenience functions for common operations
export const showError = (type, message = null, context = {}) => {
  return notificationManager.show(type, message, context);
};

export const showSuccess = (message, duration) => {
  return notificationManager.showSuccess(message, duration);
};

export const showInfo = (message, duration) => {
  return notificationManager.showInfo(message, duration);
};

export const withRetry = (operation, operationName, context = {}) => {
  return notificationManager.handleWithRetry(operation, operationName, context);
};

export const dismissAll = () => {
  notificationManager.dismissAll();
};

export const getActiveNotifications = () => {
  return notificationManager.getAll();
}; 