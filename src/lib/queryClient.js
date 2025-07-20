import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

// Enhanced query client with aggressive caching for instant UI
// Production-optimized query client for 500+ concurrent users
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimized for high concurrency - less aggressive refetching
      staleTime: 5 * 60 * 1000, // 5 minutes - reduce API calls
      gcTime: 30 * 60 * 1000, // 30 minutes - longer memory retention
      
      // Reduced refetching to minimize server load
      refetchOnWindowFocus: false, // Disable for production performance
      refetchOnReconnect: true, // Keep for offline recovery
      refetchOnMount: false, // Use cached data when available
      
      // Enhanced retry configuration with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) return false;
        // Don't retry on rate limit errors
        if (error?.message?.includes('Rate limit')) return false;
        // Max 3 retries for server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = 1000 * Math.pow(2, attemptIndex);
        const jitter = Math.random() * 1000;
        return Math.min(baseDelay + jitter, 30000);
      },
      
      // Network timeout for production reliability
      networkMode: 'online',
      
      // Meta data for monitoring
      meta: {
        errorPolicy: 'soft' // Don't throw on background refetch errors
      }
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry server errors, not client errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2; // Reduced retries for mutations
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
      onError: (error, variables, context) => {
        console.error('Mutation error:', {
          error: error.message,
          variables,
          context,
          timestamp: new Date().toISOString()
        });
        
        // Could integrate with error reporting service here
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'mutation_error', {
            error_message: error.message,
            error_type: error.name
          });
        }
      }
    }
  },
  
  // Global error handler for production monitoring
  queryCache: {
    onError: (error, query) => {
      console.warn('Query error:', {
        error: error.message,
        queryKey: query.queryKey,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Mutation cache for tracking mutation errors
  mutationCache: {
    onError: (error, variables, context, mutation) => {
      console.warn('Mutation cache error:', {
        error: error.message,
        mutationKey: mutation.options.mutationKey,
        timestamp: new Date().toISOString()
      });
    }
  }
})

// Persist query cache to localStorage for instant app startup
const persister = {
  persistClient: async (client) => {
    try {
      const data = JSON.stringify({
        clientState: client,
        timestamp: Date.now()
      })
      localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', data)
    } catch (error) {
      console.warn('Failed to persist query cache:', error)
    }
  },
  
  restoreClient: async () => {
    try {
      const cached = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')
      if (!cached) return undefined
      
      const { clientState, timestamp } = JSON.parse(cached)
      
      // Expire cache after 24 hours
      const maxAge = 24 * 60 * 60 * 1000
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE')
        return undefined
      }
      
      return clientState
    } catch (error) {
      console.warn('Failed to restore query cache:', error)
      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE')
      return undefined
    }
  },
  
  removeClient: async () => {
    localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE')
  }
}

// Production persistence with performance optimization
persistQueryClient({
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  buster: '1.1.0', // Increment to invalidate all caches
  hydrateOptions: {
    // Only restore specific query types to reduce memory usage
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // Start with 10min stale time for restored data
      }
    }
  }
})

// Performance monitoring for query client
if (typeof window !== 'undefined') {
  // Monitor query cache size
  setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queryCount = cache.getAll().length;
    
    if (queryCount > 100) {
      console.warn(`High query cache count: ${queryCount}. Consider clearing old queries.`);
    }
    
    // Optional: Send metrics to monitoring service
    if (window.gtag) {
      window.gtag('event', 'query_cache_size', {
        value: queryCount,
        custom_parameter: 'performance_monitoring'
      });
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

// Query keys for consistent caching
export const queryKeys = {
  userActivity: (userId) => ['userActivity', userId],
  userStats: (userId) => ['userStats', userId],
  recentActivity: (userId) => ['recentActivity', userId],
  categories: () => ['categories'],
  categoriesWithProgress: (userId) => ['categories', 'withProgress', userId],
  userProgress: (userId) => ['userProgress', userId],
  questions: (categoryId, count) => ['questions', categoryId, count],
  quizSession: (sessionId) => ['quizSession', sessionId]
}

// Prefetch functions for proactive loading
export const prefetchQueries = {
  categories: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories(),
      queryFn: async () => {
        const { supabase } = await import('./supabase')
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
        return categories || []
      },
      staleTime: 5 * 60 * 1000 // 5 minutes
    })
  },
  
  userActivity: (userId) => {
    if (!userId) return
    queryClient.prefetchQuery({
      queryKey: queryKeys.userActivity(userId),
      queryFn: async () => {
        // Import and call the actual fetch functions
        const { supabase } = await import('./supabase')
        
        const { data: quizHistory } = await supabase
          .from('user_question_history')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          
        return { hasActivity: quizHistory?.length > 0 }
      },
      staleTime: 2 * 60 * 1000 // 2 minutes
    })
  }
}

// Production-optimized query invalidation with batching
export const invalidateQueries = {
  userData: (userId) => {
    // Batch invalidations to reduce re-renders
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const [key, id] = query.queryKey;
        return ['userActivity', 'userStats', 'recentActivity', 'userProgress'].includes(key) && id === userId;
      }
    });
  },
  
  categories: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  },
  
  leaderboard: () => {
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
  },
  
  // Selective invalidation to avoid unnecessary refetches
  quizData: (userId) => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const [key] = query.queryKey;
        return ['userStats', 'leaderboard', 'userProgress'].includes(key);
      }
    });
  },
  
  // Emergency invalidation - use sparingly
  all: () => {
    console.warn('Invalidating all queries - this may impact performance');
    queryClient.invalidateQueries();
  }
}

// Cache management utilities
export const cacheUtils = {
  // Prefetch questions for better UX
  prefetchQuestions: async (categoryId, questionCount = 10) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.questions(categoryId, questionCount),
      queryFn: async () => {
        const { supabase } = await import('./supabase')
        let query = supabase
          .from('questions')
          .select('*')
        if (categoryId !== 'mixed') {
          query = query.eq('category_id', categoryId)
        }
        query = query.limit(questionCount)
        const { data: questions } = await query
        return questions || []
      },
      staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
    })
  },
  
  // Invalidate and refetch questions when needed
  invalidateQuestions: () => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.questions(),
    })
  },
  
  // Update user progress in cache after quiz completion
  updateUserProgress: (userId, categoryId, newProgress) => {
    queryClient.setQueryData(
      queryKeys.userProgress(userId, categoryId),
      (oldData) => ({ ...oldData, ...newProgress })
    )
  },
  
  // Get cached questions without triggering a fetch
  getCachedQuestions: (categoryId, questionCount) => {
    return queryClient.getQueryData(
      queryKeys.questions(categoryId, questionCount)
    )
  },
}
