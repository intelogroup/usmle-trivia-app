import { supabase } from '../../supabase';
import { AuthenticationManager } from './AuthenticationManager';

/**
 * Quiz Session Manager
 * Handles quiz session lifecycle operations
 */
export class QuizSessionManager extends AuthenticationManager {
  /**
   * Record quiz session with complete user isolation
   */
  async createQuizSession(sessionData) {
    await this.verifyUserAuth();

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: this.userId,
        session_type: sessionData.session_type || 'self_paced',
        total_questions: sessionData.total_questions
        // Using DEFAULT NOW() for started_at
        // Avoiding any non-existent or problematic fields
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz session:', error);
      throw new Error(`Failed to create quiz session: ${error.message}`);
    }

    return data;
  }

  /**
   * Record quiz responses with batch processing and validation
   */
  async recordQuizResponses(sessionId, responses) {
    await this.verifyUserAuth();
    
    // Verify session ownership
    await this.verifySessionOwnership(sessionId);

    // Prepare batch insert data
    const responseRecords = responses.map((response, index) => ({
      session_id: sessionId,
      question_id: response.question_id,
      selected_option_id: response.selected_option_id,
      is_correct: response.is_correct,
      response_order: index + 1,
      time_spent_seconds: response.time_spent_seconds || 0,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('quiz_responses')
      .insert(responseRecords);

    if (error) {
      console.error('Error recording quiz responses:', error);
      throw new Error(`Failed to record quiz responses: ${error.message}`);
    }

    // Update user question history
    await this.updateQuestionHistory(responses);
  }

  /**
   * Update user question interaction history
   */
  async updateQuestionHistory(responses) {
    const historyUpdates = responses.map(response => ({
      user_id: this.userId,
      question_id: response.question_id,
      last_answered_correctly: response.is_correct,
      last_seen_at: new Date().toISOString(),
      times_seen: 1 // Will be properly incremented by database trigger or RPC
    }));

    // Use upsert to handle existing records
    const { error } = await supabase
      .from('user_question_history')
      .upsert(historyUpdates, {
        onConflict: 'user_id,question_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.warn('Warning: Failed to update question history (non-critical):', error);
      // Don't throw - this is supplementary data
    }
  }

  /**
   * Complete quiz session with scoring and analytics
   */
  async completeQuizSession(sessionId, completionData) {
    await this.verifyUserAuth();
    await this.verifySessionOwnership(sessionId);

    const { data, error } = await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: completionData.correct_answers,
        completed_at: new Date().toISOString(),
        total_time_seconds: completionData.total_time_seconds,
        points_earned: completionData.points_earned || 0
      })
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .select()
      .single();

    if (error) {
      console.error('Error completing quiz session:', error);
      throw new Error(`Failed to complete quiz session: ${error.message}`);
    }

    return data;
  }

  /**
   * Get recent quiz sessions for the user
   */
  async getRecentSessions(limit = 10) {
    await this.verifyUserAuth();

    const { data, error } = await supabase
      .from('quiz_sessions')
      .select(`
        id,
        session_type,
        total_questions,
        correct_answers,
        started_at,
        completed_at,
        total_time_seconds,
        points_earned
      `)
      .eq('user_id', this.userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent sessions:', error);
      throw new Error(`Failed to fetch recent sessions: ${error.message}`);
    }

    return data || [];
  }
}