import { supabase } from '../../lib/supabase';

/**
 * Service for managing leaderboard statistics and real-time updates
 */

/**
 * Calculate and update user statistics from quiz sessions
 * @param {string} userId - The user ID to update stats for
 * @returns {Promise<Object>} Updated stats object or error
 */
export const updateUserStats = async (userId) => {
  try {
    // Get all completed quiz sessions for user
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (sessionsError) {
      console.error('Error fetching quiz sessions:', sessionsError);
      return { success: false, error: sessionsError };
    }

    if (!sessions || sessions.length === 0) {
      // No completed sessions, initialize with empty stats
      const emptyStats = {
        user_id: userId,
        total_quizzes_completed: 0,
        total_questions_answered: 0,
        total_correct_answers: 0,
        total_points_earned: 0,
        total_time_spent_seconds: 0,
        overall_accuracy: 0,
        average_quiz_score: 0,
        best_quiz_score: 0,
        current_streak: 0,
        longest_streak: 0,
        last_quiz_date: null,
        streak_start_date: null,
        category_stats: {},
        difficulty_stats: {}
      };

      const { data: upsertData, error: upsertError } = await supabase
        .from('user_stats')
        .upsert(emptyStats, { onConflict: 'user_id' })
        .select()
        .single();

      return { success: true, data: upsertData };
    }

    // Calculate aggregated statistics
    const stats = {
      user_id: userId,
      total_quizzes_completed: sessions.length,
      total_questions_answered: sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0),
      total_correct_answers: sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0),
      total_points_earned: sessions.reduce((sum, s) => sum + (s.score || 0), 0),
      total_time_spent_seconds: sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0),
      last_quiz_date: sessions[sessions.length - 1]?.completed_at
    };

    // Calculate derived statistics
    stats.overall_accuracy = stats.total_questions_answered > 0 
      ? Math.round((stats.total_correct_answers / stats.total_questions_answered) * 100) 
      : 0;

    stats.average_quiz_score = sessions.length > 0 
      ? Math.round(stats.total_points_earned / sessions.length) 
      : 0;

    stats.best_quiz_score = sessions.length > 0 
      ? Math.max(...sessions.map(s => s.score || 0)) 
      : 0;

    // Calculate streak (simplified - consecutive days)
    const sortedSessions = sessions
      .filter(s => s.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

    let currentStreak = 0;
    let longestStreak = 0;
    let streakStartDate = null;

    if (sortedSessions.length > 0) {
      // Simple streak calculation - consecutive sessions
      currentStreak = 1; // At least one session
      longestStreak = 1;
      streakStartDate = sortedSessions[0].completed_at;

      for (let i = 1; i < sortedSessions.length; i++) {
        const currentDate = new Date(sortedSessions[i-1].completed_at);
        const prevDate = new Date(sortedSessions[i].completed_at);
        const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          break;
        }
      }
    }

    stats.current_streak = currentStreak;
    stats.longest_streak = longestStreak;
    stats.streak_start_date = streakStartDate;

    // Category and difficulty stats (placeholder for now)
    stats.category_stats = {};
    stats.difficulty_stats = {};

    // Upsert the calculated stats
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_stats')
      .upsert(stats, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting user stats:', upsertError);
      return { success: false, error: upsertError };
    }

    // Also update the profile's total_points and current_streak
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        total_points: stats.total_points_earned,
        current_streak: stats.current_streak,
        best_streak: stats.longest_streak,
        last_active_date: new Date(stats.last_quiz_date).toISOString().split('T')[0],
        last_active_at: stats.last_quiz_date
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    return { success: true, data: upsertData };

  } catch (error) {
    console.error('Error in updateUserStats:', error);
    return { success: false, error };
  }
};

/**
 * Update stats for all users (useful for backfilling)
 * @returns {Promise<Object>} Result object
 */
export const updateAllUserStats = async () => {
  try {
    // Get all user IDs who have completed quizzes
    const { data: userIds, error } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching user IDs:', error);
      return { success: false, error };
    }

    const uniqueUserIds = [...new Set(userIds.map(item => item.user_id))];
    console.log(`Updating stats for ${uniqueUserIds.length} users...`);

    const results = await Promise.all(
      uniqueUserIds.map(userId => updateUserStats(userId))
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Updated stats for ${successful} users, ${failed} failed`,
      results
    };

  } catch (error) {
    console.error('Error in updateAllUserStats:', error);
    return { success: false, error };
  }
};

/**
 * Hook into quiz completion to automatically update stats
 * @param {string} userId - User ID
 * @param {string} sessionId - Quiz session ID
 * @returns {Promise<Object>} Result object
 */
export const onQuizCompleted = async (userId, sessionId) => {
  try {
    console.log(`Quiz completed for user ${userId}, session ${sessionId}`);
    
    // Update user stats immediately
    const result = await updateUserStats(userId);
    
    if (result.success) {
      console.log('User stats updated successfully after quiz completion');
    } else {
      console.error('Failed to update user stats after quiz completion:', result.error);
    }

    return result;
  } catch (error) {
    console.error('Error in onQuizCompleted:', error);
    return { success: false, error };
  }
};

/**
 * Get leaderboard data with fresh statistics
 * @param {string} period - Time period filter
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Leaderboard data
 */
export const getLeaderboardData = async (period = 'all', limit = 50) => {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        full_name,
        avatar_url,
        country_id,
        grade_id,
        total_points,
        current_streak,
        best_streak,
        created_at,
        user_stats (
          total_quizzes_completed,
          total_questions_answered,
          total_correct_answers,
          overall_accuracy,
          average_quiz_score,
          best_quiz_score,
          last_quiz_date
        )
      `)
      .not('display_name', 'is', null)
      .order('total_points', { ascending: false })
      .limit(limit);

    // Add period filtering if needed
    if (period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }

    return profiles || [];

  } catch (error) {
    console.error('Error in getLeaderboardData:', error);
    return [];
  }
};