/**
 * Production-ready retry utilities for enhanced UX
 * Handles network failures, timeouts, and rate limits gracefully
 */

/**
 * Enhanced retry configuration for different error types
 */
export const RETRY_CONFIGS = {
  network: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  },
  timeout: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitter: false
  },
  rateLimit: {
    maxRetries: 3,
    baseDelay: 5000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true
  },
  server: {
    maxRetries: 2,
    baseDelay: 1500,
    maxDelay: 6000,
    backoffMultiplier: 2,
    jitter: true
  },
  default: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitter: true
  }
};

/**
 * Determines retry strategy based on error type
 */
export function getRetryConfig(error) {
  if (!error) return RETRY_CONFIGS.default;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code || error.status;
  
  // Network-related errors
  if (message.includes('network') || message.includes('fetch failed') || 
      message.includes('connection') || code === 'NETWORK_ERROR') {
    return RETRY_CONFIGS.network;
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('aborted') || 
      code === 'TIMEOUT_ERROR') {
    return RETRY_CONFIGS.timeout;
  }
  
  // Rate limiting
  if (message.includes('rate limit') || code === 429 || code === 'RATE_LIMIT_ERROR') {
    return RETRY_CONFIGS.rateLimit;
  }
  
  // Server errors (5xx)
  if ((code >= 500 && code < 600) || message.includes('server error')) {
    return RETRY_CONFIGS.server;
  }
  
  return RETRY_CONFIGS.default;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
export function calculateDelay(attempt, config) {
  const { baseDelay, maxDelay, backoffMultiplier, jitter } = config;
  
  let delay = baseDelay * Math.pow(backoffMultiplier, attempt);
  
  // Apply jitter to prevent thundering herd
  if (jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  return Math.min(delay, maxDelay);
}

/**
 * Enhanced retry wrapper with better error handling
 */
export async function retryWithBackoff(
  operation, 
  context = {}, 
  onRetry = null,
  onFailure = null
) {
  let lastError = null;
  let attempt = 0;
  
  while (true) {
    try {
      const result = await operation();
      
      // Log successful retry if this wasn't the first attempt
      if (attempt > 0 && context.operationName) {
        console.log(`✅ ${context.operationName} succeeded after ${attempt} retries`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      const config = getRetryConfig(error);
      
      // Check if we should retry
      if (attempt >= config.maxRetries) {
        console.error(`❌ ${context.operationName || 'Operation'} failed after ${attempt} attempts:`, error);
        
        if (onFailure) {
          onFailure(error, attempt);
        }
        
        throw new Error(`Operation failed after ${config.maxRetries} retries: ${error.message}`);
      }
      
      const delay = calculateDelay(attempt, config);
      
      console.warn(`⚠️ ${context.operationName || 'Operation'} failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(error, attempt + 1, delay);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      attempt++;
    }
  }
}

/**
 * Circuit breaker pattern for preventing cascade failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 300000; // 5 minutes
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  async execute(operation, context = {}) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        console.log(`🔄 Circuit breaker entering HALF_OPEN state for ${context.operationName || 'operation'}`);
      } else {
        throw new Error(`Circuit breaker is OPEN for ${context.operationName || 'operation'}. Try again later.`);
      }
    }
    
    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 3) {
          this.state = 'CLOSED';
          this.failures = 0;
          console.log(`✅ Circuit breaker reset to CLOSED state for ${context.operationName || 'operation'}`);
        }
      } else if (this.state === 'CLOSED') {
        this.failures = Math.max(0, this.failures - 1);
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        console.error(`🚨 Circuit breaker opened for ${context.operationName || 'operation'} after ${this.failures} failures`);
      }
      
      throw error;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      isHealthy: this.state === 'CLOSED' && this.failures < this.failureThreshold / 2
    };
  }
}

/**
 * Global circuit breakers for different service types
 */
export const circuitBreakers = {
  database: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
    monitoringPeriod: 300000 // 5 minutes
  }),
  auth: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 300000
  }),
  api: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 45000, // 45 seconds
    monitoringPeriod: 300000
  })
};

/**
 * Enhanced fetch with retry and circuit breaker
 */
export async function enhancedFetch(url, options = {}, context = {}) {
  const operation = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
  
  const circuitBreaker = circuitBreakers.api;
  
  return await circuitBreaker.execute(async () => {
    return await retryWithBackoff(
      operation,
      { ...context, operationName: `Fetch ${url}` },
      (error, attempt, delay) => {
        console.log(`🔄 Retrying fetch to ${url} (attempt ${attempt}) in ${delay}ms due to: ${error.message}`);
      },
      (error, attempts) => {
        console.error(`💥 Fetch to ${url} failed permanently after ${attempts} attempts`);
      }
    );
  }, context);
}

/**
 * Graceful degradation utility
 */
export class GracefulDegradation {
  constructor() {
    this.fallbacks = new Map();
    this.healthChecks = new Map();
  }
  
  registerFallback(serviceName, fallbackFunction) {
    this.fallbacks.set(serviceName, fallbackFunction);
  }
  
  registerHealthCheck(serviceName, healthCheckFunction) {
    this.healthChecks.set(serviceName, healthCheckFunction);
  }
  
  async executeWithFallback(serviceName, primaryFunction, context = {}) {
    try {
      // Try primary function first
      return await primaryFunction();
    } catch (error) {
      console.warn(`⚠️ Primary service ${serviceName} failed, attempting fallback:`, error.message);
      
      const fallback = this.fallbacks.get(serviceName);
      if (fallback) {
        try {
          const result = await fallback(error, context);
          console.log(`✅ Fallback for ${serviceName} succeeded`);
          return result;
        } catch (fallbackError) {
          console.error(`💥 Fallback for ${serviceName} also failed:`, fallbackError.message);
          throw new Error(`Both primary and fallback failed for ${serviceName}`);
        }
      }
      
      throw error;
    }
  }
  
  async checkHealth(serviceName) {
    const healthCheck = this.healthChecks.get(serviceName);
    if (!healthCheck) return { healthy: true, reason: 'No health check configured' };
    
    try {
      const result = await healthCheck();
      return { healthy: true, ...result };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  }
}

/**
 * Global graceful degradation instance
 */
export const gracefulDegradation = new GracefulDegradation();

// Register common fallbacks
gracefulDegradation.registerFallback('leaderboard', (error, context) => {
  console.log('Using cached leaderboard data');
  try {
    // Handle both browser and Node.js environments
    const cachedData = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('leaderboard_cache') || '[]'
      : '[]';
    return {
      data: JSON.parse(cachedData),
      cached: true,
      error: error.message
    };
  } catch {
    return {
      data: [],
      cached: false,
      error: error.message
    };
  }
});

gracefulDegradation.registerFallback('userProfile', (error, context) => {
  console.log('Using minimal user profile');
  return {
    data: {
      display_name: 'Guest User',
      total_points: 0,
      current_streak: 0
    },
    fallback: true,
    error: error.message
  };
});

gracefulDegradation.registerFallback('questions', (error, context) => {
  console.log('Using sample questions for offline mode');
  return {
    data: [
      {
        id: 'offline-1',
        question_text: 'This is a sample question for offline mode.',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_option_id: 0,
        points: 10,
        difficulty: 'medium',
        offline: true
      }
    ],
    offline: true,
    error: error.message
  };
});