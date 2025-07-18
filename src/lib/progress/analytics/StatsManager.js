import { supabase } from '../../supabase';
import { AuthenticationManager } from '../core/AuthenticationManager';

/**
 * Statistics Manager
 * Handles user statistics and analytics operations
 */
export class StatsManager extends AuthenticationManager {
  /**
   * Get comprehensive user statistics using RPC
   */
  async getUserStats() {
    await this.verifyUserAuth();

    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: this.userId
      });

      if (error) {
        console.warn('RPC get_user_stats failed, falling back to manual calculation:', error);
        return await this.calculateStatsManually();
      }

      return data || this.getDefaultStats();
    } catch (error) {
      console.warn('Error getting user stats, returning defaults:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Manual stats calculation fallback
   */
  async calculateStatsManually() {
    const [sessionsResult, responsesResult] = await Promise.allSettled([
      supabase
        .from('quiz_sessions')
        .select('correct_answers, total_questions, total_time_seconds')
        .eq('user_id', this.userId)
        .not('completed_at', 'is', null),
      
      supabase
        .from('quiz_responses')
        .select(`
          is_correct,
          quiz_sessions!inner(user_id)
        `)
        .eq('quiz_sessions.user_id', this.userId)
    ]);

    const sessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value.data : [];
    const responses = responsesResult.status === 'fulfilled' ? responsesResult.value.data : [];

    const totalQuestions = responses.length;
    const correctAnswers = responses.filter(r => r.is_correct).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const studyTime = sessions.reduce((sum, s) => sum + (s.total_time_seconds || 0), 0);

    return {
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      accuracy_percentage: accuracy,
      total_study_time_seconds: studyTime,
      sessions_completed: sessions.length,
      current_streak: 0, // Would need more complex calculation
      longest_streak: 0,
      average_session_time: sessions.length > 0 ? Math.round(studyTime / sessions.length) : 0
    };
  }

  /**
   * Get default stats structure
   */
  getDefaultStats() {
    return {
      total_questions: 0,
      correct_answers: 0,
      accuracy_percentage: 0,
      total_study_time_seconds: 0,
      sessions_completed: 0,
      current_streak: 0,
      longest_streak: 0,
      average_session_time: 0
    };
  }

  /**
   * Update user profile statistics
   */
  async updateUserStats() {
    await this.verifyUserAuth();

    try {
      const stats = await this.getUserStats();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          total_questions_answered: stats.total_questions,
          correct_answers: stats.correct_answers,
          accuracy_percentage: stats.accuracy_percentage,
          total_study_time_seconds: stats.total_study_time_seconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.userId);

      if (error) {
        console.error('Error updating user stats:', error);
        throw new Error(`Failed to update user stats: ${error.message}`);
      }

      return stats;
    } catch (error) {
      console.error('Error in updateUserStats:', error);
      throw error;
    }
  }

  /**
   * Get category-specific progress data
   */
  async getCategoryProgress() {
    await this.verifyUserAuth();

    const { data, error } = await supabase
      .from('quiz_responses')
      .select(`
        is_correct,
        questions!inner(
          question_tags!inner(
            tags!inner(name, type)
          )
        )
      `)
      .eq('quiz_sessions.user_id', this.userId);

    if (error) {
      console.error('Error fetching category progress:', error);
      return [];
    }

    // Group by category and calculate progress
    const categoryMap = new Map();
    
    data.forEach(response => {
      response.questions.question_tags.forEach(qt => {
        const categoryName = qt.tags.name;
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            name: categoryName,
            type: qt.tags.type,
            total: 0,
            correct: 0
          });
        }
        
        const category = categoryMap.get(categoryName);
        category.total++;
        if (response.is_correct) {
          category.correct++;
        }
      });
    });

    // Convert to array and add progress percentage
    return Array.from(categoryMap.values()).map(category => ({
      ...category,
      progress: category.total > 0 ? Math.round((category.correct / category.total) * 100) : 0
    }));
  }
}