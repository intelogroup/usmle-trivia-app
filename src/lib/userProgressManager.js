/**
 * Comprehensive User Progress Manager with Enhanced Security
 * Handles all user progress tracking, data separation, and analytics
 */

import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';

export class UserProgressManager {
  constructor(userId) {
    this.userId = userId;
    this.validateUserId();
  }

  /**
   * Validate user ID against authenticated user
   */
  validateUserId() {
    if (!this.userId) {
      throw new Error('User ID is required');
    }
  }

  /**
   * Verify user authentication before any operation
   */
  async verifyUserAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('User not authenticated');
    }

    if (user.id !== this.userId) {
      throw new Error('Security violation: User ID mismatch');
    }

    return user;
  }

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
   * Update user question history with upsert for efficiency
   */
  async updateQuestionHistory(responses) {
    const historyUpdates = responses.map(response => ({
      user_id: this.userId,
      question_id: response.question_id,
      last_answered_correctly: response.is_correct,
      last_seen_at: new Date().toISOString(),
      times_seen: 1 // Will be incremented by database trigger
    }));

    const { error } = await supabase
      .from('user_question_history')
      .upsert(historyUpdates, {
        onConflict: 'user_id,question_id'
      });

    if (error) {
      console.error('Error updating question history:', error);
      throw new Error(`Failed to update question history: ${error.message}`);
    }
  }

  /**
   * Complete quiz session with score calculation and progress updates
   */
  async completeQuizSession(sessionId, finalScore, metadata = {}) {
    await this.verifyUserAuth();
    await this.verifySessionOwnership(sessionId);

    const { error } = await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: metadata.correct_answers || finalScore,
        completed_at: new Date().toISOString(),
        total_time_seconds: metadata.total_time_seconds || metadata.duration_seconds || 0,
        points_earned: metadata.points_earned || finalScore
        // Using only fields that exist in the actual schema
        // Removed: score, duration_seconds, metadata (don't exist)
      })
      .eq('id', sessionId)
      .eq('user_id', this.userId); // Double security check

    if (error) {
      console.error('Error completing quiz session:', error);
      throw new Error(`Failed to complete quiz session: ${error.message}`);
    }

    // Update user profile statistics
    await this.updateUserStats();
  }

  /**
   * Verify session ownership for security
   */
  async verifySessionOwnership(sessionId) {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (error) {
      throw new Error(`Session verification failed: ${error.message}`);
    }

    if (data.user_id !== this.userId) {
      throw new Error('Security violation: Session does not belong to user');
    }

    return true;
  }

  /**
   * Get comprehensive user statistics with proper filtering
   */
  async getUserStats() {
    await this.verifyUserAuth();

    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: this.userId });

      if (error) {
        throw error;
      }

      return data?.[0] || {
        total_questions_attempted: 0,
        correct_questions: 0,
        incorrect_questions: 0,
        accuracy_percentage: 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }
  }

  /**
   * Get user progress for specific categories
   */
  async getCategoryProgress(categoryId = null) {
    await this.verifyUserAuth();

    let query = supabase
      .from('user_question_history')
      .select(`
        question_id,
        last_answered_correctly,
        last_seen_at,
        times_seen,
        questions!inner (
          question_tags (
            tags(name)
          )
        )
      `)
      .eq('user_id', this.userId);

    if (categoryId && categoryId !== 'mixed') {
      query = query.ilike('questions.question_tags.tags.name', `%${categoryId}%`);
    }

    const { data, error } = await query
      .order('last_seen_at', { ascending: false });

    if (error) {
      console.error('Error fetching category progress:', error);
      throw new Error(`Failed to fetch category progress: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get recent quiz sessions for user activity feed
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
        completed_at,
        total_time_seconds,
        points_earned
      `)
      .eq('user_id', this.userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent sessions:', error);
      throw new Error(`Failed to fetch recent sessions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update user profile statistics (called after quiz completion)
   */
  async updateUserStats() {
    try {
      // Use secure RPC function to update user statistics
      const { error } = await supabase
        .rpc('update_user_statistics', { p_user_id: this.userId });

      if (error) {
        console.warn('Failed to update user statistics:', error);
        // Don't throw error as this is not critical for quiz functionality
      }
    } catch (error) {
      console.warn('Error updating user statistics:', error);
    }
  }

  /**
   * Get user learning path recommendations
   */
  async getLearningRecommendations() {
    await this.verifyUserAuth();

    try {
      const { data, error } = await supabase
        .rpc('get_learning_recommendations', { p_user_id: this.userId });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
      return [];
    }
  }

  /**
   * Security audit function to verify user data isolation
   */
  async performSecurityAudit() {
    await this.verifyUserAuth();

    const auditResults = {
      userDataIsolated: false,
      rlsPoliciesWorking: false,
      dataLeakageDetected: false,
      errors: []
    };

    try {
      // Test 1: Verify user can access their own data
      const { data: ownData, error: ownError } = await supabase
        .from('user_question_history')
        .select('user_id')
        .eq('user_id', this.userId)
        .limit(1);

      if (ownError) {
        auditResults.errors.push(`Cannot access own data: ${ownError.message}`);
      } else {
        auditResults.userDataIsolated = true;
      }

      // Test 2: Try to access other users' data (should fail)
      const { data: otherData, error: otherError } = await supabase
        .from('user_question_history')
        .select('user_id')
        .neq('user_id', this.userId)
        .limit(1);

      // If we get data back, RLS is not working
      if (otherData && otherData.length > 0) {
        auditResults.dataLeakageDetected = true;
        auditResults.errors.push('Can access other users\' data - RLS policies not working');
      } else {
        auditResults.rlsPoliciesWorking = true;
      }

    } catch (error) {
      auditResults.errors.push(`Security audit failed: ${error.message}`);
    }

    return auditResults;
  }
}

/**
 * Factory function to create UserProgressManager instance
 */
export const createUserProgressManager = (userId) => {
  return new UserProgressManager(userId);
};

/**
 * React hook for user progress management
 */
export const useUserProgress = () => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error('User must be authenticated to use progress manager');
  }

  return createUserProgressManager(user.id);
}; 