import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

// Enhanced query client with aggressive caching for instant UI
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve stale data immediately while refetching in background
      staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory
      
      // Instant UI: show cached data immediately, refetch in background
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
      
      // Retry configuration for reliability
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (auth, not found, etc.)
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error)
      }
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

// Initialize persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  buster: '1.0.0' // Increment to invalidate all caches
})

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

// Utility to invalidate related queries
export const invalidateQueries = {
  userData: (userId) => {
    queryClient.invalidateQueries({ queryKey: ['userActivity', userId] })
    queryClient.invalidateQueries({ queryKey: ['userStats', userId] })
    queryClient.invalidateQueries({ queryKey: ['recentActivity', userId] })
    queryClient.invalidateQueries({ queryKey: ['userProgress', userId] })
  },
  
  categories: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  },
  
  all: () => {
    queryClient.invalidateQueries()
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
