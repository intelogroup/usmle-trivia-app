import { supabase } from '../lib/supabase';

/**
 * Service for handling question-related database operations
 */
export class QuestionService {
  /**
   * Fetch questions for a specific category or mixed questions
   */
  static async fetchQuestions(categoryId, questionCount = 10) {
    try {
      let query = supabase
        .from('questions')
        .select(`
          *,
          question_tags!inner (
            tag_id,
            tags (
              name,
              type
            )
          )
        `);

      // Handle mixed category vs specific category
      if (categoryId !== 'mixed') {
        query = query.eq('question_tags.tag_id', categoryId);
      }

      const { data, error } = await query.limit(questionCount);

      if (error) {
        console.error('Supabase error fetching questions:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No questions found for this category');
      }

      // Shuffle questions for variety
      return data.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  /**
   * Fetch categories with question counts
   */
  static async fetchCategories() {
    try {
      // First, try to fetch from the view
      const { data, error } = await supabase
        .from('tag_question_counts')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching from tag_question_counts view:', error);
        
        // Fallback: fetch directly from tags table and manually count questions
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select(`
            id,
            name,
            slug,
            description,
            icon_name,
            color,
            color_code,
            parent_id,
            type,
            order_index,
            is_active,
            created_at,
            updated_at
          `)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (tagsError) {
          throw tagsError;
        }

        // Manually count questions for each tag
        const categoriesWithCounts = await Promise.all(
          (tagsData || []).map(async (tag) => {
            const { count, error: countError } = await supabase
              .from('question_tags')
              .select('*', { count: 'exact', head: true })
              .eq('tag_id', tag.id);

            if (countError) {
              console.warn(`Error counting questions for tag ${tag.id}:`, countError);
            }

            return {
              ...tag,
              question_count: count || 0
            };
          })
        );

        return categoriesWithCounts;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create a new quiz session
   */
  static async createQuizSession(userId, categoryId, questionCount) {
    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: userId,
          quiz_type: 'practice',
          total_questions: questionCount,
          settings: {
            category_id: categoryId !== 'mixed' ? categoryId : null,
            is_mixed: categoryId === 'mixed'
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating quiz session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating quiz session:', error);
      throw error;
    }
  }

  /**
   * Record a quiz response
   */
  static async recordQuizResponse(sessionId, questionId, selectedOptionId, isCorrect, responseOrder = 0) {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
          response_order: responseOrder,
          time_spent_seconds: 0 // TODO: Add timing functionality
        });

      if (error) {
        console.error('Error recording quiz response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error recording quiz response:', error);
      throw error;
    }
  }

  /**
   * Update user question history
   */
  static async updateUserQuestionHistory(userId, questionId, selectedOptionId, isCorrect) {
    try {
      const { error } = await supabase
        .from('user_question_history')
        .upsert({
          user_id: userId,
          question_id: questionId,
          last_answered_correctly: isCorrect,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,question_id'
        });

      if (error) {
        console.error('Error updating user question history:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating user question history:', error);
      throw error;
    }
  }

  /**
   * Complete a quiz session
   */
  static async completeQuizSession(sessionId, userId, finalScore) {
    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          correct_answers: finalScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId); // Security: ensure user can only update their own session

      if (error) {
        console.error('Error completing quiz session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error completing quiz session:', error);
      throw error;
    }
  }

  /**
   * Get user progress for a specific category
   */
  static async getUserProgress(userId, categoryId) {
    if (!userId || !categoryId) return 0;
    
    try {
      // Get user's question history for this category
      const { data, error } = await supabase
        .from('user_question_history')
        .select(`
          last_answered_correctly,
          questions!inner (
            question_tags!inner (
              tag_id
            )
          )
        `)
        .eq('user_id', userId)
        .eq('questions.question_tags.tag_id', categoryId);

      if (error) {
        console.warn('Error getting user progress:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Calculate progress based on correct answers percentage
      const correctAnswers = data.filter(item => item.last_answered_correctly).length;
      const totalAttempts = data.length;
      
      return Math.round((correctAnswers / totalAttempts) * 100);
    } catch (error) {
      console.error('Error getting user progress:', error);
      // Return 0 progress if there's any error to prevent UI from breaking
      return 0;
    }
  }

  /**
   * Test database connection
   */
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('count(*)')
        .limit(1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
