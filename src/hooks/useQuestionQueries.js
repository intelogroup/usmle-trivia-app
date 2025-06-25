import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, cacheUtils } from '../lib/queryClient'
import { QuestionService } from '../services/questionService'

// Local storage utilities for offline support
const CACHE_PREFIX = 'usmle_quiz_cache_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

const localStorageCache = {
  set: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_EXPIRY
      }
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to cache data locally:', error)
    }
  },
  
  get: (key) => {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key)
      if (!cached) return null
      
      const cacheData = JSON.parse(cached)
      if (Date.now() > cacheData.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key)
        return null
      }
      
      return cacheData.data
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error)
      return null
    }
  },
  
  clear: (pattern) => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX + (pattern || ''))) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }
}

// Custom hook for fetching questions with caching
export function useQuestions(categoryId, questionCount = 10, options = {}) {
  const cacheKey = `questions_${categoryId}_${questionCount}`
  
  return useQuery({
    queryKey: queryKeys.questionsByCategory(categoryId, questionCount),
    queryFn: async () => {
      try {
        const questions = await QuestionService.fetchQuestions(categoryId, questionCount)
        
        // Cache to local storage for offline support
        localStorageCache.set(cacheKey, questions)
        
        return questions
      } catch (error) {
        // Try to get from local storage if network fails
        const cachedQuestions = localStorageCache.get(cacheKey)
        if (cachedQuestions) {
          console.info('Using cached questions due to network error')
          return cachedQuestions
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    ...options
  })
}

// Custom hook for fetching categories with caching
export function useCategories(options = {}) {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      try {
        const categories = await QuestionService.fetchCategories()
        
        // Cache categories locally
        localStorageCache.set('categories', categories)
        
        return categories
      } catch (error) {
        // Try to get from local storage if network fails
        const cachedCategories = localStorageCache.get('categories')
        if (cachedCategories) {
          console.info('Using cached categories due to network error')
          return cachedCategories
        }
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    ...options
  })
}

// Custom hook for user progress with optimistic updates
export function useUserProgress(userId, categoryId, options = {}) {
  return useQuery({
    queryKey: queryKeys.userProgress(userId, categoryId),
    queryFn: () => QuestionService.getUserProgress(userId, categoryId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!userId && !!categoryId,
    ...options
  })
}

// Mutation hooks for quiz operations with cache updates
export function useCreateQuizSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, categoryId, questionCount }) => 
      QuestionService.createQuizSession(userId, categoryId, questionCount),
    onSuccess: (data, variables) => {
      // Update quiz sessions cache
      queryClient.setQueryData(
        queryKeys.quizSessions(variables.userId),
        (oldSessions) => [...(oldSessions || []), data]
      )
    }
  })
}

export function useRecordQuizResponse() {
  return useMutation({
    mutationFn: ({ sessionId, questionId, selectedOptionId, isCorrect, responseOrder }) =>
      QuestionService.recordQuizResponse(sessionId, questionId, selectedOptionId, isCorrect, responseOrder),
    // Optimistic updates can be added here if needed
  })
}

export function useUpdateQuestionHistory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, questionId, selectedOptionId, isCorrect }) =>
      QuestionService.updateUserQuestionHistory(userId, questionId, selectedOptionId, isCorrect),
    onSuccess: (data, variables) => {
      // Invalidate user progress queries to reflect updated history
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProgress(variables.userId)
      })
    }
  })
}

export function useCompleteQuizSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, userId, finalScore }) =>
      QuestionService.completeQuizSession(sessionId, userId, finalScore),
    onSuccess: (data, variables) => {
      // Update user stats and progress
      queryClient.invalidateQueries({
        queryKey: queryKeys.userStats(variables.userId)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProgress(variables.userId)
      })
    }
  })
}

// Utility hook for prefetching related questions
export function usePrefetchQuestions() {
  const queryClient = useQueryClient()
  
  const prefetchCategory = async (categoryId, questionCount = 10) => {
    return cacheUtils.prefetchQuestions(categoryId, questionCount)
  }
  
  const prefetchPopularCategories = async (categories) => {
    // Prefetch questions for the most popular categories
    const popularCategories = categories
      .sort((a, b) => (b.question_count || 0) - (a.question_count || 0))
      .slice(0, 5)
    
    return Promise.all(
      popularCategories.map(category => 
        prefetchCategory(category.id, 15)
      )
    )
  }
  
  return {
    prefetchCategory,
    prefetchPopularCategories
  }
}

// Hook for managing cache and offline support
export function useCacheManager() {
  const queryClient = useQueryClient()
  
  const clearCache = (pattern) => {
    localStorageCache.clear(pattern)
    if (pattern) {
      queryClient.removeQueries({ queryKey: [pattern] })
    } else {
      queryClient.clear()
    }
  }
  
  const getCacheSize = () => {
    try {
      let size = 0
      for (let key in localStorage) {
        if (key.startsWith(CACHE_PREFIX)) {
          size += localStorage[key].length
        }
      }
      return size
    } catch {
      return 0
    }
  }
  
  const getOfflineData = (categoryId, questionCount) => {
    const cacheKey = `questions_${categoryId}_${questionCount}`
    return localStorageCache.get(cacheKey)
  }
  
  return {
    clearCache,
    getCacheSize,
    getOfflineData
  }
}
