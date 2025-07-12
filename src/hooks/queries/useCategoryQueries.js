import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { queryKeys } from './queryKeys';
import { getCategoryColor } from '../../utils/queryUtils';

/**
 * Category-related React Query hooks
 * Handles category data with user progress
 */

/**
 * Hook for fetching categories with user progress
 */
export const useCategoriesQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.categoriesWithProgress(userId),
    queryFn: async () => {
      try {
        logger.info('🔍 [CategoriesQuery] Starting categories fetch', { userId });

        // Fetch all active categories
        const { data: categories, error: categoriesError } = await supabase
          .from('tags')
          .select('id, name, type, is_active')
          .eq('is_active', true)
          .eq('type', 'subject') // Only fetch subject-type categories
          .order('name');

        if (categoriesError) {
          logger.error('❌ [CategoriesQuery] Error fetching categories', { 
            error: categoriesError, 
            userId 
          });
          throw categoriesError;
        }

        if (!categories || categories.length === 0) {
          logger.warn('⚠️ [CategoriesQuery] No categories found', { userId });
          return [];
        }

        logger.success('✅ [CategoriesQuery] Categories fetched successfully', {
          count: categories.length,
          userId
        });

        // If no user, return categories without progress
        if (!userId) {
          return categories.map(category => ({
            ...category,
            progress: 0,
            questionsAnswered: 0,
            totalQuestions: 0,
            accuracy: 0,
            color: getCategoryColor(category.name)
          }));
        }

        // Fetch user progress for each category
        const categoriesWithProgress = await Promise.all(
          categories.map(async (category) => {
            try {
              // Get question count for this category
              const { count: totalQuestions, error: countError } = await supabase
                .from('question_tags')
                .select('*', { count: 'exact', head: true })
                .eq('tag_id', category.id);

              if (countError) {
                logger.warn('⚠️ [CategoriesQuery] Error counting questions for category', {
                  categoryId: category.id,
                  error: countError
                });
              }

              // Get user's responses for this category
              const { data: userResponses, error: responsesError } = await supabase
                .from('quiz_responses')
                .select(`
                  is_correct,
                  questions!inner(
                    question_tags!inner(tag_id)
                  )
                `)
                .eq('questions.question_tags.tag_id', category.id);

              if (responsesError) {
                logger.warn('⚠️ [CategoriesQuery] Error fetching user responses for category', {
                  categoryId: category.id,
                  error: responsesError
                });
              }

              const questionsAnswered = userResponses?.length || 0;
              const correctAnswers = userResponses?.filter(r => r.is_correct).length || 0;
              const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
              const progress = totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0;

              return {
                ...category,
                progress: Math.min(progress, 100), // Cap at 100%
                questionsAnswered,
                totalQuestions: totalQuestions || 0,
                accuracy,
                color: getCategoryColor(category.name)
              };

            } catch (error) {
              logger.error('❌ [CategoriesQuery] Error processing category progress', {
                categoryId: category.id,
                error: error.message
              });

              return {
                ...category,
                progress: 0,
                questionsAnswered: 0,
                totalQuestions: 0,
                accuracy: 0,
                color: getCategoryColor(category.name)
              };
            }
          })
        );

        logger.success('✅ [CategoriesQuery] Categories with progress calculated', {
          totalCategories: categoriesWithProgress.length,
          userId
        });

        return categoriesWithProgress;

      } catch (error) {
        logger.error('❌ [CategoriesQuery] Fatal error in categories query', {
          error: error.message,
          userId
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: true, // Always enabled since we handle userId logic inside
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

/**
 * Hook for fetching basic categories without progress
 */
export const useCategoriesOnlyQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('id, name, type, is_active')
          .eq('is_active', true)
          .eq('type', 'subject')
          .order('name');

        if (error) {
          logger.error('Error fetching categories only', { error });
          throw error;
        }

        return data?.map(category => ({
          ...category,
          color: getCategoryColor(category.name)
        })) || [];

      } catch (error) {
        logger.error('Error in useCategoriesOnlyQuery', { error: error.message });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};