import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { fetchBlockQuestions } from './questionFetchService';
import { recordQuizResponse } from './responseService';

/**
 * Block Test Service
 * Handles Block Test specific functionality including multi-block sessions
 */

// Create a new Block Test session
export async function createBlockTestSession(blockTestConfig) {
  const {
    userId,
    totalBlocks = 2,
    questionsPerBlock = 20,
    timePerBlock = 30 * 60, // 30 minutes in seconds
    categories = [],
    difficulty = null,
    breakTime = 5 * 60 // 5 minutes in seconds
  } = blockTestConfig;

  logger.info('Creating Block Test session', {
    userId,
    totalBlocks,
    questionsPerBlock,
    timePerBlock,
    categories,
    difficulty,
    breakTime
  });

  const sessionData = {
    user_id: userId,
    session_type: 'block',
    total_questions: totalBlocks * questionsPerBlock,
    started_at: new Date().toISOString(),
    settings: {
      totalBlocks,
      questionsPerBlock,
      timePerBlock,
      categories,
      difficulty,
      breakTime,
      currentBlock: 1,
      isOnBreak: false,
      blockStartTimes: [],
      blockEndTimes: []
    }
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    logger.error('Error creating Block Test session', { error, sessionData });
    throw new Error(`CREATE_BLOCK_SESSION_ERROR: ${error.message}`);
  }

  logger.success('Block Test session created successfully', {
    sessionId: data.id,
    totalBlocks,
    questionsPerBlock,
    totalQuestions: data.total_questions
  });

  return data;
}

// Record a response for Block Test
export async function recordBlockResponse(responseData) {
  const {
    sessionId,
    blockNumber,
    questionId,
    selectedOptionId,
    isCorrect,
    timeSpent,
    responseOrder,
    userId
  } = responseData;

  logger.info('Recording Block Test response', {
    sessionId,
    blockNumber,
    questionId,
    selectedOptionId,
    isCorrect,
    timeSpent,
    responseOrder,
    userId
  });

  // Use the standard response recording but with block-specific metadata
  const blockResponseData = {
    sessionId,
    questionId,
    selectedOptionId,
    isCorrect,
    timeSpent,
    responseOrder,
    userId,
    blockNumber // Additional metadata for Block Test
  };

  try {
    const response = await recordQuizResponse(blockResponseData);

    logger.success('Block Test response recorded successfully', {
      responseId: response.id,
      blockNumber,
      questionId,
      isCorrect
    });

    return response;

  } catch (error) {
    logger.error('Error recording Block Test response', {
      error: error.message,
      blockResponseData
    });
    throw error;
  }
}

// Pause a Block Test session (for breaks)
export async function pauseBlockSession(sessionId, pauseData) {
  const {
    currentBlock,
    pauseReason = 'break',
    pauseStartTime = new Date().toISOString()
  } = pauseData;

  logger.info('Pausing Block Test session', {
    sessionId,
    currentBlock,
    pauseReason,
    pauseStartTime
  });

  // Get current session settings
  const { data: session, error: fetchError } = await supabase
    .from('quiz_sessions')
    .select('settings')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    logger.error('Error fetching session for pause', { error: fetchError, sessionId });
    throw new Error(`FETCH_SESSION_ERROR: ${fetchError.message}`);
  }

  // Update session settings with pause information
  const updatedSettings = {
    ...session.settings,
    currentBlock,
    isOnBreak: true,
    pauseStartTime,
    pauseReason
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({ settings: updatedSettings })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    logger.error('Error pausing Block Test session', { error, sessionId, pauseData });
    throw new Error(`PAUSE_BLOCK_SESSION_ERROR: ${error.message}`);
  }

  logger.success('Block Test session paused successfully', {
    sessionId,
    currentBlock,
    pauseReason
  });

  return data;
}

// Resume a paused Block Test session
export async function resumeBlockSession(sessionId, resumeData) {
  const {
    resumeTime = new Date().toISOString()
  } = resumeData;

  logger.info('Resuming Block Test session', {
    sessionId,
    resumeTime
  });

  // Get current session settings
  const { data: session, error: fetchError } = await supabase
    .from('quiz_sessions')
    .select('settings')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    logger.error('Error fetching session for resume', { error: fetchError, sessionId });
    throw new Error(`FETCH_SESSION_ERROR: ${fetchError.message}`);
  }

  // Calculate break duration
  const pauseStartTime = session.settings.pauseStartTime;
  const breakDuration = pauseStartTime ? 
    (new Date(resumeTime) - new Date(pauseStartTime)) / 1000 : 0;

  // Update session settings to resume
  const updatedSettings = {
    ...session.settings,
    isOnBreak: false,
    resumeTime,
    breakDuration,
    totalBreakTime: (session.settings.totalBreakTime || 0) + breakDuration,
    pauseStartTime: null,
    pauseReason: null
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({ settings: updatedSettings })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    logger.error('Error resuming Block Test session', { error, sessionId, resumeData });
    throw new Error(`RESUME_BLOCK_SESSION_ERROR: ${error.message}`);
  }

  logger.success('Block Test session resumed successfully', {
    sessionId,
    breakDuration: `${breakDuration}s`,
    totalBreakTime: `${updatedSettings.totalBreakTime}s`
  });

  return data;
}

// Complete a Block Test session
export async function completeBlockTestSession(sessionId, completionData) {
  const {
    correctAnswers,
    totalTimeSeconds,
    blockResults = [],
    pointsEarned = 0
  } = completionData;

  logger.info('Completing Block Test session', {
    sessionId,
    correctAnswers,
    totalTimeSeconds,
    blockResults: blockResults.length,
    pointsEarned
  });

  // Get current session settings to preserve block data
  const { data: session, error: fetchError } = await supabase
    .from('quiz_sessions')
    .select('settings')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    logger.error('Error fetching session for completion', { error: fetchError, sessionId });
    throw new Error(`FETCH_SESSION_ERROR: ${fetchError.message}`);
  }

  const updatedSettings = {
    ...session.settings,
    blockResults,
    completedAt: new Date().toISOString()
  };

  const updateData = {
    correct_answers: correctAnswers,
    completed_at: new Date().toISOString(),
    total_time_seconds: totalTimeSeconds,
    points_earned: pointsEarned,
    is_completed: true,
    settings: updatedSettings
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    logger.error('Error completing Block Test session', { error, sessionId, updateData });
    throw new Error(`COMPLETE_BLOCK_SESSION_ERROR: ${error.message}`);
  }

  logger.success('Block Test session completed successfully', {
    sessionId: data.id,
    correctAnswers,
    totalTimeSeconds,
    blocksCompleted: blockResults.length,
    pointsEarned
  });

  return data;
}