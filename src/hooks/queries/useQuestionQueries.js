import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { queryKeys } from './queryKeys';
import { withQuestionTimeout, withUserDataTimeout } from '../../utils/queryTimeout';

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
      return withQuestionTimeout(async () => {
        logger.info('🔍 [QuestionsQuery] Starting questions fetch', {
          categoryId,
          questionCount
        });

        // Simplified query without complex joins to avoid timeouts
        let query = supabase
          .from('questions')
          .select(`
            id,
            question_text,
            options,
            correct_option_id,
            explanation,
            difficulty,
            image_url
          `)
          .eq('is_active', true);

        // Apply category filter if specified
        // Note: Category filtering is now handled by RPC function or fallback logic
        if (categoryId && categoryId !== 'mixed') {
          // Use RPC function for category filtering to avoid complex joins
          try {
            const { data: categoryQuestions, error: rpcError } = await supabase.rpc('get_questions_by_category', {
              p_category_id: categoryId,
              p_limit: questionCount
            });

            if (!rpcError && categoryQuestions && categoryQuestions.length > 0) {
              logger.success('Questions fetched via RPC', {
                count: categoryQuestions.length,
                categoryId
              });
              return categoryQuestions;
            } else {
              logger.warn('RPC failed, using fallback query', { rpcError });
            }
          } catch (rpcError) {
            logger.warn('RPC exception, using fallback query', { rpcError });
          }
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
      }, {
        queryType: `questions-${categoryId}`,
        fallback: []
      });
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

      return withUserDataTimeout(async () => {
        // Simplified query - fetch session first, then responses separately
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          logger.error('Error fetching quiz session', { error: sessionError, sessionId });
          throw sessionError;
        }

        // Fetch responses separately to avoid complex joins
        const { data: responses, error: responsesError } = await supabase
          .from('quiz_responses')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at');

        if (responsesError) {
          logger.warn('Error fetching quiz responses', { error: responsesError, sessionId });
          // Continue without responses rather than failing completely
        }

        // Combine the data
        const data = {
          ...session,
          quiz_responses: responses || []
        };

        return data;
      }, {
        queryType: `quiz-session-${sessionId}`,
        fallback: null
      });
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