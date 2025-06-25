import { supabase } from '../lib/supabase';

/**
 * Optimized Question Service with performance improvements
 */
export class OptimizedQuestionService {
  /**
   * Fetch questions with minimal fields and optimized queries
   */
  static async fetchQuestions(categoryId, questionCount = 10) {
    try {
      // Start with base query selecting only essential fields
      let query = supabase
        .from('questions')
        .select(`
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option_id,
          explanation,
          difficulty,
          created_at
        `);

      // Optimize for mixed vs specific category
      if (categoryId !== 'mixed') {
        // Use EXISTS for better performance with large datasets
        query = query.filter(
          'id',
          'in',
          `(SELECT question_id FROM question_tags WHERE tag_id = ${categoryId})`
        );
      }

      // Apply random sampling at database level for better performance
      const { data, error } = await query
        .limit(questionCount * 2) // Get more questions for better randomization
        .order('random()'); // PostgreSQL random ordering

      if (error) {
        console.error('Supabase error fetching questions:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No questions found for this category');
      }

      // Client-side shuffle and limit to exact count
      return data
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  /**
   * Batch record multiple quiz responses for better performance
   */
  static async recordQuizResponsesBatch(responses) {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .insert(responses);

      if (error) {
        console.error('Error recording quiz responses batch:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error recording quiz responses batch:', error);
      throw error;
    }
  }

  /**
   * Batch update user question history for better performance
   */
  static async updateUserQuestionHistoryBatch(historyUpdates) {
    try {
      const { error } = await supabase
        .from('user_question_history')
        .upsert(historyUpdates, {
          onConflict: 'user_id,question_id'
        });

      if (error) {
        console.error('Error updating user question history batch:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating user question history batch:', error);
      throw error;
    }
  }

  /**
   * Optimized categories fetch with only essential fields
   */
  static async fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('tag_question_counts')
        .select(`
          id,
          name,
          slug,
          icon_name,
          color_code,
          question_count
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(50); // Reasonable limit

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Prefetch and cache questions for multiple categories
   */
  static async prefetchCategoriesQuestions(categoryIds, questionCount = 15) {
    try {
      const prefetchPromises = categoryIds.map(categoryId =>
        this.fetchQuestions(categoryId, questionCount)
      );

      const results = await Promise.allSettled(prefetchPromises);
      
      return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled') {
          acc[categoryIds[index]] = result.value;
        }
        return acc;
      }, {});
    } catch (error) {
      console.error('Error prefetching category questions:', error);
      return {};
    }
  }

  /**
   * Get user statistics with optimized aggregation
   */
  static async getUserStats(userId) {
    try {
      // Use a single query with aggregation functions
      const { data, error } = await supabase
        .rpc('get_user_quiz_stats', { user_id: userId });

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return data?.[0] || {
        total_questions: 0,
        correct_answers: 0,
        accuracy: 0,
        quizzes_completed: 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Optimized leaderboard fetch
   */
  static async getLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard', { result_limit: limit });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Connection pooling and health check
   */
  static async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
} 