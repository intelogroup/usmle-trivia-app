// Centralized logging system for USMLE Trivia app
// Supports different log levels, structured logging, and context tracking

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '#ff4444',
  WARN: '#ffaa00',
  INFO: '#4488ff',
  DEBUG: '#888888'
};

class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    this.context = {};
  }

  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] <= this.level;
  }

  _formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const contextData = { ...this.context, ...data };
    
    return {
      timestamp,
      level,
      message,
      context: contextData,
      userAgent: navigator?.userAgent || 'unknown',
      url: window?.location?.href || 'unknown'
    };
  }

  _logToConsole(level, formattedMessage) {
    const { timestamp, message, context } = formattedMessage;
    const color = LOG_COLORS[level];
    
    const prefix = `%c[${level}] ${timestamp.split('T')[1].split('.')[0]}`;
    const hasContext = Object.keys(context).length > 0;
    
    if (hasContext) {
      console.groupCollapsed(prefix, `color: ${color}; font-weight: bold`, message);
      console.table(context);
      console.groupEnd();
    } else {
      console.log(prefix, `color: ${color}; font-weight: bold`, message);
    }
  }

  _logToRemote(formattedMessage) {
    // TODO: Implement remote logging service integration
    // This could send to services like LogRocket, Sentry, or custom analytics
    if (formattedMessage.level === 'ERROR') {
      // Only send errors to remote service to avoid spam
      // Implementation would go here
    }
  }

  error(message, data = {}, error = null) {
    if (!this._shouldLog('ERROR')) return;
    
    const errorData = {
      ...data,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      })
    };
    
    const formatted = this._formatMessage('ERROR', message, errorData);
    this._logToConsole('ERROR', formatted);
    this._logToRemote(formatted);
    
    return formatted;
  }

  warn(message, data = {}) {
    if (!this._shouldLog('WARN')) return;
    
    const formatted = this._formatMessage('WARN', message, data);
    this._logToConsole('WARN', formatted);
    
    return formatted;
  }

  info(message, data = {}) {
    if (!this._shouldLog('INFO')) return;
    
    const formatted = this._formatMessage('INFO', message, data);
    this._logToConsole('INFO', formatted);
    
    return formatted;
  }

  debug(message, data = {}) {
    if (!this._shouldLog('DEBUG')) return;
    
    const formatted = this._formatMessage('DEBUG', message, data);
    this._logToConsole('DEBUG', formatted);
    
    return formatted;
  }

  // Performance timing utilities
  time(label) {
    console.time(label);
    return label;
  }

  timeEnd(label, data = {}) {
    console.timeEnd(label);
    this.debug(`Performance: ${label} completed`, data);
  }

  // Quiz-specific logging methods
  quizStart(quizType, userId, config = {}) {
    this.setContext({ userId, quizType });
    this.info('Quiz session started', {
      quizType,
      userId,
      config,
      sessionId: config.sessionId
    });
  }

  quizError(operation, error, context = {}) {
    this.error(`Quiz operation failed: ${operation}`, context, error);
  }

  questionFetch(operation, result, timing = null) {
    const data = {
      operation,
      questionsFound: result?.length || 0,
      ...(timing && { duration: timing })
    };
    
    if (result?.length === 0) {
      this.warn('No questions found for fetch operation', data);
    } else {
      this.info('Questions fetched successfully', data);
    }
  }

  userHistoryUpdate(questionId, success, error = null) {
    if (success) {
      this.debug('User history updated', { questionId });
    } else {
      this.warn('User history update failed', { questionId }, error);
    }
  }

  fallbackUsed(primaryOperation, fallbackOperation, reason) {
    this.warn('Fallback strategy used', {
      primaryOperation,
      fallbackOperation,
      reason
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the class and instance
export default logger;
export { Logger, LOG_LEVELS };

// Helper functions for common quiz operations
export const withQuizLogging = (operation, userId, quizType) => {
  logger.setContext({ userId, quizType, operation });
  return logger;
};

export const logQuizError = (operation, error, context = {}) => {
  logger.quizError(operation, error, context);
};

export const logPerformance = async (label, asyncOperation) => {
  const startTime = performance.now();
  const uniqueLabel = `${label}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  logger.time(uniqueLabel);
  
  try {
    const result = await asyncOperation();
    const duration = performance.now() - startTime;
    logger.timeEnd(uniqueLabel, { duration: `${duration.toFixed(2)}ms` });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.timeEnd(uniqueLabel, { duration: `${duration.toFixed(2)}ms`, error: true });
    throw error;
  }
};