import { supabase } from '../lib/supabase';

/**
 * Quiz Feedback Service
 * Handles user feedback submission and storage
 */

/**
 * Submit user feedback for a quiz session
 * @param {Object} feedbackData - The feedback data to submit
 * @returns {Promise<Object>} The feedback record created
 */
export const submitQuizFeedback = async (feedbackData) => {
  const {
    quizId,
    userId,
    rating,
    difficulty,
    helpfulness,
    comments,
    wouldRecommend,
    issues,
    score,
    totalQuestions,
    timestamp
  } = feedbackData;

  try {
    // Insert feedback into the database
    const { data, error } = await supabase
      .from('quiz_feedback')
      .insert([
        {
          quiz_session_id: quizId,
          user_id: userId,
          rating,
          difficulty_rating: difficulty,
          helpfulness_rating: helpfulness,
          comments,
          would_recommend: wouldRecommend,
          reported_issues: issues,
          quiz_score: score,
          total_questions: totalQuestions,
          created_at: timestamp
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in submitQuizFeedback:', error);
    throw error;
  }
};

/**
 * Get feedback statistics for analytics
 * @returns {Promise<Object>} Feedback statistics
 */
export const getFeedbackStats = async () => {
  try {
    const { data, error } = await supabase
      .from('quiz_feedback')
      .select('rating, difficulty_rating, helpfulness_rating, would_recommend, reported_issues');

    if (error) {
      console.error('Error fetching feedback stats:', error);
      throw new Error(`Failed to fetch feedback stats: ${error.message}`);
    }

    // Calculate statistics
    const stats = {
      totalFeedback: data.length,
      averageRating: data.length > 0 ? data.reduce((sum, f) => sum + f.rating, 0) / data.length : 0,
      recommendationRate: data.length > 0 ? data.filter(f => f.would_recommend).length / data.length : 0,
      difficultyDistribution: {
        too_easy: data.filter(f => f.difficulty_rating === 'too_easy').length,
        just_right: data.filter(f => f.difficulty_rating === 'just_right').length,
        too_hard: data.filter(f => f.difficulty_rating === 'too_hard').length,
        mixed: data.filter(f => f.difficulty_rating === 'mixed').length
      },
      helpfulnessDistribution: {
        very_helpful: data.filter(f => f.helpfulness_rating === 'very_helpful').length,
        somewhat_helpful: data.filter(f => f.helpfulness_rating === 'somewhat_helpful').length,
        not_helpful: data.filter(f => f.helpfulness_rating === 'not_helpful').length
      },
      commonIssues: data.reduce((acc, f) => {
        if (f.reported_issues && f.reported_issues.length > 0) {
          f.reported_issues.forEach(issue => {
            acc[issue] = (acc[issue] || 0) + 1;
          });
        }
        return acc;
      }, {})
    };

    return stats;
  } catch (error) {
    console.error('Error in getFeedbackStats:', error);
    throw error;
  }
};

/**
 * Get user's feedback history
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of user feedback records
 */
export const getUserFeedbackHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_feedback')
      .select(`
        *,
        quiz_sessions!inner(
          session_type,
          total_questions,
          correct_answers,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user feedback history:', error);
      throw new Error(`Failed to fetch feedback history: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getUserFeedbackHistory:', error);
    throw error;
  }
};