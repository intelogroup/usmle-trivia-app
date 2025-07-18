import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';

/**
 * Quiz Session Management Service
 * Handles creation and completion of quiz sessions
 */

// Map quiz mode strings to database session types
const sessionTypeMapping = {
  'quick': 'quick',
  'timed': 'timed',
  'custom': 'self_paced',
  'block': 'block',
  'self_paced': 'self_paced',
  'learn_module': 'learn_module'
};

// Create a new quiz session
export async function createQuizSession(sessionConfig) {
  const {
    userId,
    sessionType = 'self_paced',
    totalQuestions,
    categoryName = null,
    timePerQuestion = null,
    autoAdvance = false,
    showExplanations = true,
    settings = {}
  } = sessionConfig;

  logger.info('Creating quiz session', {
    userId,
    sessionType,
    totalQuestions,
    categoryName,
    timePerQuestion,
    autoAdvance,
    showExplanations
  });

  // Map session type to database enum value
  const dbSessionType = sessionTypeMapping[sessionType] || 'self_paced';

  const sessionData = {
    user_id: userId,
    session_type: dbSessionType,
    total_questions: totalQuestions,
    started_at: new Date().toISOString(),
    category_name: categoryName,
    settings: {
      timePerQuestion,
      autoAdvance,
      showExplanations,
      ...settings
    }
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    logger.error('Error creating quiz session', { error, sessionData });
    throw new Error(`CREATE_SESSION_ERROR: ${error.message}`);
  }

  logger.success('Quiz session created successfully', {
    sessionId: data.id,
    sessionType: dbSessionType,
    totalQuestions
  });

  return data;
}

// Complete a quiz session
export async function completeQuizSession(sessionId, completionData = {}) {
  const {
    correctAnswers,
    totalTimeSeconds,
    pointsEarned,
    completed = true,
    totalQuestions,
    responses = []
  } = completionData;

  logger.info('Completing quiz session', {
    sessionId,
    correctAnswers,
    totalTimeSeconds,
    pointsEarned,
    completed,
    totalQuestions
  });

  // Calculate points if not provided (2 points per correct answer)
  const calculatedPoints = pointsEarned !== undefined ? pointsEarned : (correctAnswers * 2);
  
  // Calculate score percentage
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const updateData = {
    correct_answers: correctAnswers,
    completed_at: new Date().toISOString(),
    total_time_seconds: totalTimeSeconds,
    points_earned: calculatedPoints,
    score: score,
    is_completed: completed
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    logger.error('Error completing quiz session', { error, sessionId, updateData });
    throw new Error(`COMPLETE_SESSION_ERROR: ${error.message}`);
  }

  // Update user points in profile
  if (calculatedPoints > 0) {
    try {
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionData?.user_id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            total_points: supabase.raw('total_points + ?', [calculatedPoints]),
            last_active_at: new Date().toISOString()
          })
          .eq('id', sessionData.user_id);

        if (profileError) {
          logger.warn('Failed to update user points', { error: profileError, userId: sessionData.user_id });
        }
      }
    } catch (profileUpdateError) {
      logger.warn('Error updating user profile points', { error: profileUpdateError });
    }
  }

  logger.success('Quiz session completed successfully', {
    sessionId: data.id,
    correctAnswers,
    totalTimeSeconds,
    pointsEarned: calculatedPoints,
    score
  });

  return data;
}