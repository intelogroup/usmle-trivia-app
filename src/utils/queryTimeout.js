import logger from './logger';

/**
 * Query Timeout Utilities
 * Provides timeout wrappers and retry logic for database queries
 */

/**
 * Default timeout configurations for different query types
 */
export const TIMEOUT_CONFIG = {
  // Fast queries (simple selects)
  FAST: 8000,      // 8 seconds (increased from 5s)

  // Standard queries (with basic joins)
  STANDARD: 12000, // 12 seconds (increased from 10s)

  // Complex queries (multiple joins, aggregations)
  COMPLEX: 18000,  // 18 seconds (increased from 15s)

  // Critical queries (authentication, user data)
  CRITICAL: 30000, // 30 seconds (increased from 20s)

  // Background queries (analytics, non-critical)
  BACKGROUND: 45000 // 45 seconds (increased from 30s)
};

/**
 * Retry configuration with exponential backoff
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 10000,      // 10 seconds
  backoffFactor: 2
};

/**
 * Wraps a query with timeout and retry logic
 * @param {Function} queryFn - The query function to execute
 * @param {Object} options - Configuration options
 * @returns {Promise} - Promise that resolves with query result or rejects with timeout/error
 */
export const withTimeout = async (queryFn, options = {}) => {
  const {
    timeout = TIMEOUT_CONFIG.STANDARD,
    retries = RETRY_CONFIG.maxAttempts,
    retryDelay = RETRY_CONFIG.baseDelay,
    queryType = 'unknown',
    fallback = null,
    onRetry = null
  } = options;

  let lastError = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout after ${timeout}ms (${queryType})`));
        }, timeout);
      });

      // Race the query against the timeout
      const result = await Promise.race([
        queryFn(),
        timeoutPromise
      ]);

      // Success - log and return result
      if (attempt > 1) {
        logger.success(`Query succeeded on attempt ${attempt}`, { 
          queryType, 
          attempt, 
          timeout 
        });
      }

      return result;

    } catch (error) {
      lastError = error;
      
      // Log the error
      logger.warn(`Query attempt ${attempt} failed`, {
        queryType,
        attempt,
        error: error.message,
        timeout,
        willRetry: attempt < retries
      });

      // If this is the last attempt, don't retry
      if (attempt >= retries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, error, delay);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  logger.error(`Query failed after ${retries} attempts`, {
    queryType,
    timeout,
    finalError: lastError?.message
  }, lastError);

  // Return fallback if provided, otherwise throw
  if (fallback !== null) {
    logger.info(`Using fallback value for failed query`, { queryType, fallback });
    return fallback;
  }

  throw lastError;
};

/**
 * Specialized timeout wrapper for authentication queries
 */
export const withAuthTimeout = (queryFn, options = {}) => {
  return withTimeout(queryFn, {
    timeout: TIMEOUT_CONFIG.CRITICAL,
    retries: 1, // Single retry for auth to fail faster
    queryType: 'authentication',
    fallback: null, // Return null instead of throwing for auth failures
    ...options
  });
};

/**
 * Specialized timeout wrapper for user data queries
 */
export const withUserDataTimeout = (queryFn, options = {}) => {
  return withTimeout(queryFn, {
    timeout: TIMEOUT_CONFIG.STANDARD,
    retries: 3,
    queryType: 'user-data',
    fallback: null, // User data should fail rather than return incorrect data
    ...options
  });
};

/**
 * Specialized timeout wrapper for question queries
 */
export const withQuestionTimeout = (queryFn, options = {}) => {
  return withTimeout(queryFn, {
    timeout: TIMEOUT_CONFIG.FAST,
    retries: 2,
    queryType: 'questions',
    fallback: [], // Return empty array if questions fail to load
    ...options
  });
};

/**
 * Specialized timeout wrapper for category queries
 */
export const withCategoryTimeout = (queryFn, options = {}) => {
  return withTimeout(queryFn, {
    timeout: TIMEOUT_CONFIG.FAST,
    retries: 3,
    queryType: 'categories',
    fallback: [], // Return empty array if categories fail to load
    ...options
  });
};

/**
 * Specialized timeout wrapper for background/analytics queries
 */
export const withBackgroundTimeout = (queryFn, options = {}) => {
  return withTimeout(queryFn, {
    timeout: TIMEOUT_CONFIG.BACKGROUND,
    retries: 1, // Don't retry background queries aggressively
    queryType: 'background',
    fallback: null, // Background queries can fail silently
    ...options
  });
};

/**
 * Utility to check if an error is a timeout error
 */
export const isTimeoutError = (error) => {
  return error?.message?.includes('timeout') || 
         error?.message?.includes('Timeout') ||
         error?.code === 'TIMEOUT';
};

/**
 * Utility to check if an error is retryable
 */
export const isRetryableError = (error) => {
  // Network errors, timeouts, and temporary server errors are retryable
  const retryablePatterns = [
    'timeout',
    'network',
    'fetch',
    'connection',
    'temporary',
    '503', // Service Unavailable
    '502', // Bad Gateway
    '504'  // Gateway Timeout
  ];

  const errorMessage = error?.message?.toLowerCase() || '';
  return retryablePatterns.some(pattern => errorMessage.includes(pattern));
};

export default {
  withTimeout,
  withAuthTimeout,
  withUserDataTimeout,
  withQuestionTimeout,
  withCategoryTimeout,
  withBackgroundTimeout,
  isTimeoutError,
  isRetryableError,
  TIMEOUT_CONFIG,
  RETRY_CONFIG
};
