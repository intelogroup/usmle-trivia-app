import { createClient } from '@supabase/supabase-js'

// Supabase configuration with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

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
      // Production fetch with timeout and retry logic
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const fetchOptions = {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        };

        return fetch(url, fetchOptions)
          .finally(() => clearTimeout(timeoutId))
          .catch(error => {
            if (error.name === 'AbortError') {
              throw new Error('Request timeout - please check your connection');
            }
            throw error;
          });
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
    
    // Simple test query
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
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
