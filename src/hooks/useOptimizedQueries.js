import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, invalidateQueries } from '../lib/queryClient'
import { QuestionService } from '../services/questionService'
import { supabase } from '../lib/supabase'

/**
 * Optimized user activity hook with instant cache-first rendering
 */
export const useUserActivityQuery = (userId) => {
  const queryClient = useQueryClient()
  
  // User activity check (fast query)
  const activityQuery = useQuery({
    queryKey: queryKeys.userActivity(userId),
    queryFn: async () => {
      if (!userId) return { isNewUser: true }
      
      const { data: quizHistory, error } = await supabase
        .from('user_question_history')
        .select('*')
        .eq('user_id', userId)
        .limit(1)

      if (error) throw error
      
      return {
        isNewUser: !quizHistory || quizHistory.length === 0,
        hasActivity: quizHistory && quizHistory.length > 0
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // User stats (heavier query)
  const statsQuery = useQuery({
    queryKey: queryKeys.userStats(userId),
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: userId })

      if (error) {
        // Silently handle error in production, stats are not critical
        return null
      }

      if (data && data.length > 0) {
        const stats = data[0]
        return {
          totalQuestions: stats.total_questions_attempted || 0,
          accuracy: stats.accuracy_percentage || 0,
          studyTime: Math.round((stats.total_questions_attempted * 2) / 60 * 10) / 10 || 0,
          currentStreak: 0
        }
      }
      return null
    },
    enabled: !!userId && activityQuery.data?.hasActivity,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Recent activity (heavy query)
  const recentActivityQuery = useQuery({
    queryKey: queryKeys.recentActivity(userId),
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          quiz_responses (
            questions (
              question_tags (
                tags (name)
              )
            )
          )
        `)
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(4)

      if (error) throw error

      return data?.map(session => {
        const categories = session.quiz_responses
          ?.flatMap(response => 
            response.questions?.question_tags?.map(qt => qt.tags.name) || []
          ) || []
        
        const category = categories[0] || 'General'
        const score = `${session.correct_answers || 0}/${session.total_questions || 0}`
        
        const date = new Date(session.completed_at)
        const now = new Date()
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
        const timeAgo = diffInHours < 24 ? `${diffInHours}h ago` : `${Math.floor(diffInHours / 24)}d ago`

        const colors = {
          'Cardiology': 'text-red-500',
          'Neurology': 'text-purple-500',
          'Pharmacology': 'text-green-500',
          'Anatomy': 'text-blue-500',
          'Pathology': 'text-orange-500',
          'Biochemistry': 'text-teal-500',
          'Physiology': 'text-indigo-500',
          'General': 'text-gray-500'
        }

        return {
          category,
          score,
          time: timeAgo,
          color: colors[category] || 'text-gray-500'
        }
      }) || []
    },
    enabled: !!userId && activityQuery.data?.hasActivity,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    isLoading: activityQuery.isLoading,
    isError: activityQuery.isError || statsQuery.isError || recentActivityQuery.isError,
    error: activityQuery.error || statsQuery.error || recentActivityQuery.error,
    
    // Data with smart defaults
    isNewUser: activityQuery.data?.isNewUser ?? true,
    userStats: statsQuery.data || {
      totalQuestions: 0,
      accuracy: 0,
      studyTime: 0,
      currentStreak: 0
    },
    recentActivity: recentActivityQuery.data || [],
    
    // Cache status
    isFromCache: activityQuery.isStale || statsQuery.isStale || recentActivityQuery.isStale,
    isRefreshing: activityQuery.isFetching || statsQuery.isFetching || recentActivityQuery.isFetching,
    
    // Actions
    refetch: () => {
      activityQuery.refetch()
      if (activityQuery.data?.hasActivity) {
        statsQuery.refetch()
        recentActivityQuery.refetch()
      }
    },
    invalidate: () => invalidateQueries.userData(userId)
  }
}

/**
 * Optimized categories hook with instant cache-first rendering
 */
export const useCategoriesQuery = (userId, includeProgress = true) => {
  const queryClient = useQueryClient()
  
  // Categories query (fast)
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => QuestionService.fetchCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  })

  // User progress query (slower, optional)
  const progressQuery = useQuery({
    queryKey: queryKeys.userProgress(userId),
    queryFn: () => QuestionService.getProgressMap(userId),
    enabled: !!userId && includeProgress && categoriesQuery.isSuccess,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Combine data with comprehensive error handling
  const combinedData = useMemo(() => {
    if (!categoriesQuery.data || !Array.isArray(categoriesQuery.data)) {
      console.warn('Categories data is not available or not an array');
      return [];
    }
    
    const progressMap = progressQuery.data || {};
    
    return categoriesQuery.data.map((category) => {
      // Ensure all required fields exist
      if (!category || typeof category !== 'object') {
        console.warn('Invalid category data:', category);
        return null;
      }

      return {
        id: category.id || `category-${Math.random()}`,
        title: category.name || category.title || 'Unknown Category',
        name: category.name || category.title || 'Unknown Category', // Compatibility
        description: category.description || `Study ${(category.name || 'this').toLowerCase()} concepts and practice questions`,
        icon: category.icon_name || 'BookOpen',
        color: category.color_code || category.color, // Don't set default color here - let CategoryCard handle it
        type: category.type || 'subject',
        questionCount: Math.max(0, category.question_count || 0),
        difficulty: category.question_count >= 50 ? 'Advanced' : 
                   category.question_count >= 20 ? 'Intermediate' : 'Beginner',
        isPopular: (category.question_count || 0) > 20,
        progress: progressMap[category.id] ?? 0,
        // Add missing fields that components expect
        accuracy: 0,
        completionRate: 0,
        lastUsed: null,
        isFavorite: false,
        isHighYield: (category.question_count || 0) > 50
      };
    }).filter(Boolean).filter(cat => {
      // Only show categories with questions, except in development mode
      const hasQuestions = (cat.questionCount || 0) > 0;
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // In development, show all categories, in production only show those with questions
      return hasQuestions || isDevelopment;
    });
  }, [categoriesQuery.data, progressQuery.data])

  return {
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError || progressQuery.isError,
    error: categoriesQuery.error || progressQuery.error,
    
    // Data
    data: combinedData,
    
    // Cache status
    isFromCache: categoriesQuery.isStale || progressQuery.isStale,
    isRefreshing: categoriesQuery.isFetching || progressQuery.isFetching,
    
    // Actions
    refetch: () => {
      categoriesQuery.refetch()
      if (includeProgress && userId) {
        progressQuery.refetch()
      }
    },
    invalidate: () => invalidateQueries.categories()
  }
}

/**
 * Optimized questions hook for quiz pages
 */
export const useQuestionsQuery = (categoryId, questionCount = 10) => {
  return useQuery({
    queryKey: queryKeys.questions(categoryId, questionCount),
    queryFn: () => QuestionService.fetchQuestions(categoryId, questionCount),
    enabled: !!categoryId,
    staleTime: 15 * 60 * 1000, // 15 minutes - questions are stable
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

/**
 * Mutation for quiz completion with optimistic updates
 */
export const useQuizCompletionMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sessionId, userId, finalScore }) => {
      return QuestionService.completeQuizSession(sessionId, userId, finalScore)
    },
    onSuccess: (data, variables) => {
      // Invalidate user stats to reflect new completion
      invalidateQueries.userData(variables.userId)
    },
    onError: (error) => {
      // Error handling will be done at component level
    }
  })
} 