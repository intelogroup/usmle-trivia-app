import { createClient } from '@supabase/supabase-js'
import { retryWithBackoff, circuitBreakers, gracefulDegradation } from '../utils/retryUtils.js'

// Supabase configuration with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing');
  console.error('URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('KEY:', supabaseKey ? 'OK' : 'MISSING');
  console.error('Using publishable key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'YES' : 'NO');
}

// Production-ready Supabase client configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // More secure auth flow for production
    },
    global: {
      headers: { 
        'x-application-name': 'usmle-trivia-app',
        'x-client-info': 'supabase-js-web'
      },
      // Enhanced production fetch with retry logic and circuit breaker
      fetch: async (url, options = {}) => {
        return await retryWithBackoff(
          async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
            
            try {
              const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                  ...options.headers,
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Connection': 'keep-alive'
                }
              });
              
              clearTimeout(timeoutId);
              
              // Handle rate limiting with proper retry logic
              if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || '5';
                const error = new Error(`Rate limited. Retry after ${retryAfter} seconds`);
                error.code = 'RATE_LIMIT_ERROR';
                error.retryAfter = parseInt(retryAfter);
                throw error;
              }
              
              // Handle server errors
              if (response.status >= 500) {
                const error = new Error(`Server error: ${response.status} ${response.statusText}`);
                error.code = response.status;
                throw error;
              }
              
              return response;
            } catch (error) {
              clearTimeout(timeoutId);
              
              // Enhanced error classification
              if (error.name === 'AbortError') {
                const timeoutError = new Error('Request timeout - please check your connection');
                timeoutError.code = 'TIMEOUT_ERROR';
                throw timeoutError;
              }
              
              if (error.message.includes('Failed to fetch') || 
                  error.message.includes('NetworkError') ||
                  error.message.includes('fetch')) {
                const networkError = new Error('Network error - please check your internet connection');
                networkError.code = 'NETWORK_ERROR';
                throw networkError;
              }
              
              throw error;
            }
          },
          { 
            operationName: `Supabase request to ${url}`,
            timeout: options.timeout || 30000
          },
          (error, attempt, delay) => {
            console.log(`🔄 Supabase retry ${attempt} for ${url} in ${delay}ms: ${error.message}`);
          },
          (error, attempts) => {
            console.error(`💥 Supabase request to ${url} failed after ${attempts} attempts: ${error.message}`);
          }
        );
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10 // Limit realtime events for performance
      }
    }
  }
)

// Configuration status
export const isConfigured = Boolean(supabaseUrl && supabaseKey)

// Rate limiting for production use
class RateLimiter {
  constructor(maxRequests = 60, windowMs = 60000) { // 60 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getWaitTime() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Enhanced query function with rate limiting
export const rateLimitedQuery = async (queryFn) => {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    console.warn(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`);
  }
  
  return queryFn();
};

// Test function to verify connection
export const testConnection = async () => {
  try {
    console.log('🔍 [Supabase] Testing database connection...');
    console.log('🌐 [Supabase] URL:', supabaseUrl);
    console.log('🔑 [Supabase] Key present:', !!supabaseKey);
    
    // Simple test query - use questions table which we know exists and has proper access
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ [Supabase] Connection test failed:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`,
        details: error
      };
    }
    
    console.log('✅ [Supabase] Connection test successful');
    console.log('📊 [Supabase] Sample data:', data);
    
    return {
      success: true,
      message: 'Database connection successful',
      data: data
    };
  } catch (error) {
    console.error('💥 [Supabase] Connection test exception:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      details: error
    };
  }
}

// Enhanced connection test with production considerations
export const testConnectionWithRetry = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await testConnection();
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.warn(`Connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect after ${maxRetries} attempts`);
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
};

/**
 * Enhanced Supabase wrapper with graceful degradation
 */
export class EnhancedSupabase {
  constructor(client) {
    this.client = client;
    this.setupFallbacks();
  }
  
  setupFallbacks() {
    // Register health checks
    gracefulDegradation.registerHealthCheck('database', async () => {
      const { data, error } = await this.client
        .from('questions')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { status: 'healthy', timestamp: Date.now() };
    });
    
    gracefulDegradation.registerHealthCheck('auth', async () => {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error && error.message !== 'User not found') throw error;
      return { status: 'healthy', authenticated: !!user };
    });
  }
  
  async query(tableName, operation, fallbackKey = null) {
    const serviceName = `database_${tableName}`;
    
    return await gracefulDegradation.executeWithFallback(
      serviceName,
      async () => {
        return await circuitBreakers.database.execute(
          operation,
          { operationName: `Query ${tableName}` }
        );
      },
      { tableName, fallbackKey }
    );
  }
  
  async auth(operation) {
    return await gracefulDegradation.executeWithFallback(
      'auth',
      async () => {
        return await circuitBreakers.auth.execute(
          operation,
          { operationName: 'Auth operation' }
        );
      }
    );
  }
  
  // Convenience methods with built-in fallbacks
  async getQuestions(filters = {}, limit = 10) {
    return await this.query(
      'questions',
      async () => {
        let query = this.client
          .from('questions')
          .select('*')
          .eq('is_active', true);
        
        if (filters.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
        
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        const { data, error } = await query.limit(limit);
        if (error) throw error;
        
        return { data, error: null };
      },
      'questions'
    );
  }
  
  async getLeaderboard(period = 'all', limit = 10) {
    return await this.query(
      'leaderboard',
      async () => {
        const { data, error } = await this.client
          .from('profiles')
          .select(`
            id, display_name, total_points, current_streak, avatar_url,
            user_stats (total_quizzes_completed, overall_accuracy)
          `)
          .not('display_name', 'is', null)
          .order('total_points', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        
        // Cache successful results
        if (data && data.length > 0) {
          localStorage.setItem('leaderboard_cache', JSON.stringify(data));
        }
        
        return { data, error: null };
      },
      'leaderboard'
    );
  }
  
  async getUserProfile(userId) {
    return await this.query(
      'userProfile',
      async () => {
        const { data, error } = await this.client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        return { data, error: null };
      },
      'userProfile'
    );
  }
  
  async getCurrentUser() {
    return await this.auth(async () => {
      return await this.client.auth.getUser();
    });
  }
  
  // Health check endpoint
  async checkHealth() {
    const results = await Promise.allSettled([
      gracefulDegradation.checkHealth('database'),
      gracefulDegradation.checkHealth('auth')
    ]);
    
    return {
      database: results[0].status === 'fulfilled' ? results[0].value : { healthy: false, reason: results[0].reason },
      auth: results[1].status === 'fulfilled' ? results[1].value : { healthy: false, reason: results[1].reason },
      circuitBreakers: {
        database: circuitBreakers.database.getState(),
        auth: circuitBreakers.auth.getState(),
        api: circuitBreakers.api.getState()
      }
    };
  }
}

// Export enhanced instance
export const enhancedSupabase = new EnhancedSupabase(supabase);

// Run test on module load with retry logic
if (import.meta.env.DEV) {
  testConnectionWithRetry().then(result => {
    if (result.success) {
      console.log('🎉 [Supabase] Database ready!');
    } else {
      console.error('🚨 [Supabase] Database connection failed on startup');
    }
  }).catch(error => {
    console.error('🚨 [Supabase] Connection failed after retries:', error.message);
  });
} else {
  // In production, test connection but don't log extensively
  testConnection().catch(() => {
    // Silent fail in production, but could trigger monitoring alert
  });
}
