import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';

/**
 * Quiz Response and User History Service
 * Handles recording quiz responses and updating user question history
 */

// Record a quiz response and update user history
export async function recordQuizResponse(responseData) {
  const {
    sessionId,
    questionId,
    selectedOptionId,
    isCorrect,
    timeSpent,
    responseOrder,
    userId
  } = responseData;

  logger.info('Recording quiz response', {
    sessionId,
    questionId,
    selectedOptionId,
    isCorrect,
    timeSpent,
    responseOrder,
    userId
  });

  try {
    // Insert quiz response
    const { data: response, error: responseError } = await supabase
      .from('quiz_responses')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent,
        response_order: responseOrder
      })
      .select()
      .single();

    if (responseError) {
      logger.error('Error recording quiz response', { 
        error: responseError, 
        responseData 
      });
      throw new Error(`RECORD_RESPONSE_ERROR: ${responseError.message}`);
    }

    // Update user question history using RPC (non-blocking)
    if (userId && questionId) {
      recordQuestionInteraction({
        userId,
        questionId,
        answeredCorrectly: isCorrect
      }).catch(error => {
        // Don't throw - history update is non-critical
        logger.warn('Failed to update user question history (non-critical)', {
          error: error.message,
          userId,
          questionId,
          isCorrect
        });
      });
    }

    logger.success('Quiz response recorded successfully', {
      responseId: response.id,
      questionId,
      isCorrect,
      timeSpent
    });

    return response;

  } catch (error) {
    logger.error('Exception in recordQuizResponse', {
      error: error.message,
      stack: error.stack,
      responseData
    });
    throw error;
  }
}

// Record question interaction using RPC function
export async function recordQuestionInteraction({ userId, questionId, answeredCorrectly }) {
  logger.info('Recording question interaction via RPC', {
    userId,
    questionId,
    answeredCorrectly
  });

  try {
    const { data, error } = await supabase.rpc('record_question_interaction', {
      p_user_id: userId,
      p_question_id: questionId,
      p_answered_correctly: answeredCorrectly
    });

    if (error) {
      logger.error('Error recording question interaction via RPC', {
        error,
        userId,
        questionId,
        answeredCorrectly
      });
      throw new Error(`RECORD_INTERACTION_ERROR: ${error.message}`);
    }

    logger.success('Question interaction recorded successfully', {
      userId,
      questionId,
      answeredCorrectly,
      result: data
    });

    return data;

  } catch (error) {
    logger.error('Exception in recordQuestionInteraction', {
      error: error.message,
      userId,
      questionId,
      answeredCorrectly
    });
    throw error;
  }
}

// Legacy function: Update user question history directly (fallback)
export async function updateUserQuestionHistory({ userId, questionId, answeredCorrectly }) {
  logger.info('Updating user question history (legacy method)', {
    userId,
    questionId,
    answeredCorrectly
  });

  try {
    // Check if history record exists
    const { data: existingHistory, error: checkError } = await supabase
      .from('user_question_history')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is expected for new records
      logger.error('Error checking existing history', {
        error: checkError,
        userId,
        questionId
      });
      throw checkError;
    }

    const now = new Date().toISOString();

    if (existingHistory) {
      // Update existing record
      const updateData = {
        last_answered_correctly: answeredCorrectly,
        last_seen_at: now,
        times_seen: existingHistory.times_seen + 1
      };

      const { data, error } = await supabase
        .from('user_question_history')
        .update(updateData)
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating existing history', {
          error,
          userId,
          questionId,
          updateData
        });
        throw error;
      }

      logger.success('User question history updated', {
        userId,
        questionId,
        answeredCorrectly,
        timesSeen: data.times_seen
      });

      return data;

    } else {
      // Create new record
      const insertData = {
        user_id: userId,
        question_id: questionId,
        last_answered_correctly: answeredCorrectly,
        last_seen_at: now,
        times_seen: 1
      };

      const { data, error } = await supabase
        .from('user_question_history')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating new history record', {
          error,
          userId,
          questionId,
          insertData
        });
        throw error;
      }

      logger.success('New user question history created', {
        userId,
        questionId,
        answeredCorrectly
      });

      return data;
    }

  } catch (error) {
    logger.error('Exception in updateUserQuestionHistory', {
      error: error.message,
      userId,
      questionId,
      answeredCorrectly
    });
    throw error;
  }
}