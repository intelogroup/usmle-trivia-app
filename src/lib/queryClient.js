import { QueryClient } from '@tanstack/react-query'

// Create and configure React Query client with optimized settings for quiz app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache quiz data for 5 minutes (questions don't change often)
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Keep data in cache for 30 minutes even when not in use
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      
      // Retry failed requests 2 times
      retry: 2,
      
      // Don't refetch on window focus for quiz data (avoid interruptions)
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnect for cached quiz data
      refetchOnReconnect: 'always',
      
      // Use stale data while refetching in background
      refetchInterval: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

// Query Keys - centralized management for consistency
export const queryKeys = {
  // Categories
  categories: () => ['categories'],
  category: (id) => ['categories', id],
  
  // Questions
  questions: () => ['questions'],
  questionsByCategory: (categoryId, count) => ['questions', 'category', categoryId, count],
  questionById: (id) => ['questions', id],
  
  // User data
  userProgress: (userId, categoryId) => ['userProgress', userId, categoryId],
  userStats: (userId) => ['userStats', userId],
  quizSessions: (userId) => ['quizSessions', userId],
  
  // Leaderboard
  leaderboard: () => ['leaderboard'],
}

// Cache management utilities
export const cacheUtils = {
  // Prefetch questions for better UX
  prefetchQuestions: async (categoryId, questionCount = 10) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.questionsByCategory(categoryId, questionCount),
      queryFn: () => import('../services/questionService').then(module => 
        module.QuestionService.fetchQuestions(categoryId, questionCount)
      ),
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
      queryKeys.questionsByCategory(categoryId, questionCount)
    )
  },
} 