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

  // Validate required parameters
  if (!userId) {
    logger.error('Cannot create quiz session: userId is required');
    throw new Error('User ID is required to create a quiz session');
  }

  if (!totalQuestions || totalQuestions <= 0) {
    logger.error('Cannot create quiz session: totalQuestions must be positive');
    throw new Error('Total questions must be a positive number');
  }

  // Verify authentication state
  try {
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser || currentUser.id !== userId) {
      logger.error('Authentication verification failed', { 
        authError, 
        currentUserId: currentUser?.id, 
        requestedUserId: userId 
      });
      throw new Error('Authentication required to create quiz session');
    }
  } catch (error) {
    logger.error('Failed to verify authentication', { error: error.message, userId });
    throw new Error('Please log in to create a quiz session');
  }

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
    logger.error('Database error creating quiz session', { 
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      sessionData 
    });
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
export async function completeQuizSession(sessionId, completionData) {
  const {
    correctAnswers,
    totalTimeSeconds,
    pointsEarned = 0,
    completed = true
  } = completionData;

  logger.info('Completing quiz session', {
    sessionId,
    correctAnswers,
    totalTimeSeconds,
    pointsEarned,
    completed
  });

  const updateData = {
    correct_answers: correctAnswers,
    completed_at: new Date().toISOString(),
    total_time_seconds: totalTimeSeconds,
    points_earned: pointsEarned,
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

  logger.success('Quiz session completed successfully', {
    sessionId: data.id,
    correctAnswers,
    totalTimeSeconds,
    pointsEarned
  });

  return data;
}