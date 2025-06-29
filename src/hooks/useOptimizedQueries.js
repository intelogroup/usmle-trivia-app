import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import logger from '../utils/logger'

// Query keys for consistent caching
const queryKeys = {
  userActivity: (userId) => ['userActivity', userId],
  userStats: (userId) => ['userStats', userId],
  recentActivity: (userId) => ['recentActivity', userId],
  categories: () => ['categories'],
  categoriesWithProgress: (userId) => ['categories', 'withProgress', userId],
  userProgress: (userId) => ['userProgress', userId],
  questions: (categoryId, count) => ['questions', categoryId, count],
  quizSession: (sessionId) => ['quizSession', sessionId]
}

/**
 * Optimized hook for fetching user activity and stats
 * Uses React Query for caching and background updates
 */
export const useUserActivityQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.userActivity(userId),
    queryFn: async () => {
      if (!userId) {
        return {
          isNewUser: true,
          userStats: {
            totalQuestions: 0,
            accuracy: 0,
            studyTime: 0,
            currentStreak: 0
          },
          recentActivity: []
        }
      }

      try {
        // Check if user has any quiz history
        const { data: quizHistory, error: historyError } = await supabase
          .from('user_question_history')
          .select('*')
          .eq('user_id', userId)
          .limit(1)

        if (historyError) throw historyError

        const hasActivity = quizHistory && quizHistory.length > 0
        const isNewUser = !hasActivity

        let userStats = {
          totalQuestions: 0,
          accuracy: 0,
          studyTime: 0,
          currentStreak: 0
        }
        let recentActivity = []

        if (hasActivity) {
          // Fetch user stats using RPC function
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_user_stats', { p_user_id: userId })

          if (!statsError && statsData && statsData.length > 0) {
            const stats = statsData[0]
            userStats = {
              totalQuestions: stats.total_questions_attempted || 0,
              accuracy: stats.accuracy_percentage || 0,
              studyTime: Math.round((stats.total_questions_attempted * 2) / 60 * 10) / 10 || 0,
              currentStreak: 0 // Would need streak calculation
            }
          }

          // Fetch recent activity
          const { data: sessions, error: sessionsError } = await supabase
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

          if (!sessionsError && sessions) {
            recentActivity = sessions.map(session => {
              const categories = session.quiz_responses
                ?.flatMap(response => 
                  response.questions?.question_tags?.map(qt => qt.tags.name) || []
                ) || []
              
              const category = categories[0] || 'General'
              const score = `${session.correct_answers || 0}/${session.total_questions || 0}`
              const timeAgo = getTimeAgo(session.completed_at)

              return {
                category,
                score,
                time: timeAgo,
                color: getCategoryColor(category)
              }
            })
          }
        }

        return {
          isNewUser,
          userStats,
          recentActivity
        }
      } catch (error) {
        logger.error('Error fetching user activity:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!userId
  })
}

/**
 * Optimized hook for fetching categories with user progress
 * Uses React Query for caching and background updates
 */
export const useCategoriesQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.categoriesWithProgress(userId),
    queryFn: async () => {
      try {
        // Fetch active categories from tags table
        const { data: categories, error: categoriesError } = await supabase
          .from('tags')
          .select(`
            id,
            name,
            slug,
            description,
            icon_name,
            color,
            color_code,
            type,
            order_index,
            is_active,
            parent_id
          `)
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .order('name', { ascending: true })

        if (categoriesError) throw categoriesError

        // If no user, return categories without progress
        if (!userId) {
          return categories.map(category => ({
            ...category,
            title: category.name,
            questionCount: 0,
            progress: 0,
            accuracy: 0
          }))
        }

        // Fetch question counts for each category
        const categoriesWithCounts = await Promise.all(
          categories.map(async (category) => {
            try {
              // Simplified question count to avoid CORS issues
              // TODO: Implement proper category filtering after fixing CORS
              const { count: questionCount, error: countError } = await supabase
                .from('questions')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true)
                .limit(10) // Temporary: just get a sample count

              if (countError) {
                logger.warn(`Error getting question count for ${category.name}:`, countError)
              }

              // Get user progress for this category
              let progress = 0
              let accuracy = 0

              if (questionCount > 0) {
                const { data: progressData, error: progressError } = await supabase
                  .from('user_question_history')
                  .select(`
                    is_correct,
                    questions!inner (
                      question_tags!inner (
                        tag_id
                      )
                    )
                  `)
                  .eq('user_id', userId)
                  .eq('questions.question_tags.tag_id', category.id)

                if (!progressError && progressData && progressData.length > 0) {
                  const correctAnswers = progressData.filter(p => p.is_correct).length
                  const totalAttempts = progressData.length
                  progress = Math.round((totalAttempts / questionCount) * 100)
                  accuracy = Math.round((correctAnswers / totalAttempts) * 100)
                }
              }

              return {
                ...category,
                title: category.name,
                questionCount: questionCount || 0,
                progress: Math.min(progress, 100),
                accuracy: Math.min(accuracy, 100),
                icon: category.icon_name,
                color: category.color_code || category.color
              }
            } catch (error) {
              logger.error(`Error processing category ${category.name}:`, error)
              return {
                ...category,
                title: category.name,
                questionCount: 0,
                progress: 0,
                accuracy: 0,
                icon: category.icon_name,
                color: category.color_code || category.color
              }
            }
          })
        )

        return categoriesWithCounts
      } catch (error) {
        logger.error('Error fetching categories:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    enabled: true // Always enabled since we need categories even without user
  })
}

/**
 * Optimized hook for fetching questions for a specific category
 * Simplified to avoid CORS issues with complex joins
 */
export const useQuestionsQuery = (categoryId, questionCount = 10) => {
  return useQuery({
    queryKey: queryKeys.questions(categoryId, questionCount),
    queryFn: async () => {
      try {
        // For now, use a simpler query to avoid CORS issues
        // TODO: Fix Supabase CORS configuration for complex joins
        let query = supabase
          .from('questions')
          .select(`
            id,
            question_text,
            options,
            correct_option_id,
            explanation,
            difficulty,
            source,
            points,
            is_active
          `)
          .eq('is_active', true)

        const { data: questions, error } = await query
          .limit(questionCount * 3) // Get more questions to filter from
          .order('id', { ascending: false })

        if (error) {
          logger.error('Error fetching questions:', {
            error: error.message,
            categoryId,
            questionCount,
            code: error.code
          })
          throw error
        }

        // For mixed category, return random selection
        if (!categoryId || categoryId === 'mixed') {
          const shuffled = questions?.sort(() => 0.5 - Math.random()) || []
          const selected = shuffled.slice(0, questionCount)
          
          logger.info('Questions fetched successfully (mixed):', {
            categoryId: 'mixed',
            questionCount: selected.length,
            requestedCount: questionCount
          })
          
          return selected
        }

        // For specific categories, we'll implement proper filtering later
        // For now, return random questions
        const shuffled = questions?.sort(() => 0.5 - Math.random()) || []
        const selected = shuffled.slice(0, questionCount)

        logger.info('Questions fetched successfully:', {
          categoryId,
          questionCount: selected.length,
          requestedCount: questionCount
        })

        return selected
      } catch (error) {
        logger.error('Error in useQuestionsQuery:', {
          error: error.message,
          categoryId,
          questionCount
        })
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        return false
      }
      return failureCount < 2
    },
    enabled: questionCount > 0
  })
}

// Utility functions
const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

const getCategoryColor = (category) => {
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
  return colors[category] || 'text-gray-500'
}

// Export query keys for external use
export { queryKeys } 