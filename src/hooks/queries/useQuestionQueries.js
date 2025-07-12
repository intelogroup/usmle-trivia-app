import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { queryKeys } from './queryKeys';

/**
 * Question-related React Query hooks
 * Handles question fetching and filtering
 */

/**
 * Hook for fetching questions by category
 */
export const useQuestionsQuery = (categoryId, questionCount = 10) => {
  return useQuery({
    queryKey: queryKeys.questions(categoryId, questionCount),
    queryFn: async () => {
      try {
        logger.info('🔍 [QuestionsQuery] Starting questions fetch', { 
          categoryId, 
          questionCount 
        });

        let query = supabase
          .from('questions')
          .select(`
            id,
            question_text,
            options,
            correct_option_id,
            explanation,
            difficulty,
            image_url,
            question_tags (
              tags (
                id,
                name,
                type
              )
            )
          `)
          .eq('is_active', true);

        // Apply category filter if specified
        if (categoryId && categoryId !== 'mixed') {
          query = query.contains('question_tags', [{ id: categoryId }]);
        }

        // Limit the number of questions
        query = query.limit(questionCount);

        const { data: questions, error } = await query;

        if (error) {
          logger.error('❌ [QuestionsQuery] Error fetching questions', {
            error,
            categoryId,
            questionCount
          });
          throw error;
        }

        if (!questions || questions.length === 0) {
          logger.warn('⚠️ [QuestionsQuery] No questions found', {
            categoryId,
            questionCount
          });
          return [];
        }

        // Shuffle questions for randomization
        const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

        logger.success('✅ [QuestionsQuery] Questions fetched and shuffled', {
          count: shuffledQuestions.length,
          categoryId,
          questionCount
        });

        return shuffledQuestions;

      } catch (error) {
        logger.error('❌ [QuestionsQuery] Fatal error in questions query', {
          error: error.message,
          categoryId,
          questionCount
        });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!categoryId, // Only run when categoryId is provided
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

/**
 * Hook for fetching a specific quiz session
 */
export const useQuizSessionQuery = (sessionId) => {
  return useQuery({
    queryKey: queryKeys.quizSession(sessionId),
    queryFn: async () => {
      if (!sessionId) return null;

      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .select(`
            *,
            quiz_responses (
              *,
              questions (
                id,
                question_text,
                options,
                correct_option_id,
                explanation
              )
            )
          `)
          .eq('id', sessionId)
          .single();

        if (error) {
          logger.error('Error fetching quiz session', { error, sessionId });
          throw error;
        }

        return data;

      } catch (error) {
        logger.error('Error in useQuizSessionQuery', { 
          error: error.message, 
          sessionId 
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!sessionId,
    retry: 1
  });
};

/**
 * Hook for fetching questions with user history consideration
 */
export const useSmartQuestionsQuery = (userId, categoryId, questionCount = 10) => {
  return useQuery({
    queryKey: ['smartQuestions', userId, categoryId, questionCount],
    queryFn: async () => {
      if (!userId) {
        // Fallback to regular questions if no user
        return useQuestionsQuery(categoryId, questionCount).queryFn();
      }

      try {
        // Try to use RPC function for smart question fetching
        const { data, error } = await supabase.rpc('get_unseen_questions', {
          p_user_id: userId,
          p_category_id: categoryId === 'mixed' ? null : categoryId,
          p_limit: questionCount
        });

        if (error) {
          logger.warn('RPC get_unseen_questions failed, falling back to regular fetch', {
            error,
            userId,
            categoryId
          });
          // Fallback to regular questions
          return useQuestionsQuery(categoryId, questionCount).queryFn();
        }

        if (!data || data.length === 0) {
          logger.warn('No unseen questions found, falling back to regular fetch', {
            userId,
            categoryId
          });
          return useQuestionsQuery(categoryId, questionCount).queryFn();
        }

        logger.success('Smart questions fetched successfully', {
          count: data.length,
          userId,
          categoryId
        });

        return data;

      } catch (error) {
        logger.error('Error in useSmartQuestionsQuery, falling back', {
          error: error.message,
          userId,
          categoryId
        });
        // Fallback to regular questions
        return useQuestionsQuery(categoryId, questionCount).queryFn();
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute (fresher for smart fetching)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!categoryId,
    retry: 1
  });
};