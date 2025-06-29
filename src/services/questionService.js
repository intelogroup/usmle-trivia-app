import { supabase } from '../lib/supabase';
import logger, { logPerformance } from '../utils/logger';
import { showError, withRetry } from '../utils/notifications';

// Fetch questions for QuickQuiz or other quiz modes (LEGACY - doesn't consider user history)
export async function fetchQuestions({ categoryId = 'mixed', questionCount = 10, difficulty = null }) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('is_active', true);

  if (categoryId && categoryId !== 'mixed') {
    query = query.contains('question_tags', [{ id: categoryId }]);
  }
  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  query = query.limit(questionCount);

  const startTime = performance.now();
  const { data, error } = await query;
  const duration = performance.now() - startTime;

  if (error) {
    console.error('❌ [QuizService] Error fetching questions:', {
      message: error.message,
      details: error.details,
      categoryId,
      questionCount,
      difficulty,
      duration: `${duration.toFixed(2)}ms`
    });
    throw new Error(`FETCH_QUESTIONS_ERROR: ${error.message}`);
  }

  console.log('✅ [QuizService] Successfully fetched questions:', {
    count: data.length,
    categoryId,
    difficulty,
    duration: `${duration.toFixed(2)}ms`
  });
  return data;
}

// Fisher-Yates (aka Knuth) Shuffle utility
function shuffleArray(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// NEW: Smart question fetching that considers user history
export async function fetchQuestionsForUser({ 
  userId, 
  categoryId = 'mixed', 
  questionCount = 10, 
  difficulty = null 
}) {
  logger.setContext({ userId, operation: 'fetchQuestionsForUser' });
  if (!userId) {
    logger.warn('No userId provided, falling back to basic fetchQuestions', {
      categoryId,
      questionCount,
      difficulty
    });
    return fetchQuestions({ categoryId, questionCount, difficulty });
  }
  logger.info('Starting smart question fetch for user (using RPC)', {
    userId,
    categoryId,
    questionCount,
    difficulty
  });
  return await logPerformance('fetchQuestionsForUser', async () => {
    try {
      // Use the new RPC to get unseen questions
      const { data: unseenQuestions, error: rpcError } = await supabase.rpc('get_unseen_questions', {
        p_user_id: userId,
        p_category_id: categoryId === 'mixed' ? null : categoryId,
        p_difficulty: difficulty,
        p_limit: questionCount * 2 // get more for shuffling
      });
      if (rpcError) {
        logger.error('Error fetching unseen questions via RPC', { error: rpcError });
        logger.warn('Falling back to basic fetch due to RPC error', { error: rpcError.message });
        console.error('[RPC ERROR] get_unseen_questions:', rpcError);
        return fetchQuestions({ categoryId, questionCount, difficulty });
      }
      logger.info('Fetched unseen questions via RPC', { count: unseenQuestions?.length, data: unseenQuestions });
      console.log('[RPC DATA] get_unseen_questions:', unseenQuestions);
      if (unseenQuestions && unseenQuestions.length >= questionCount) {
        const shuffled = shuffleArray([...unseenQuestions]); // Use Fisher-Yates shuffle
        logger.info('Using unseen questions for user (RPC)', {
          userId,
          selectedCount: questionCount,
          totalAvailable: unseenQuestions.length
        });
        return shuffled.slice(0, questionCount);
      }
      // If not enough, fall back to basic fetch
      logger.warn('Not enough unseen questions from RPC, using fallback', {
        userId,
        available: unseenQuestions?.length || 0,
        requested: questionCount
      });
      return fetchQuestions({ categoryId, questionCount, difficulty });
    } catch (error) {
      logger.error('Error in fetchQuestionsForUser (RPC)', { error });
      return fetchQuestions({ categoryId, questionCount, difficulty });
    }
  });
}

// Create a new quiz session
export async function createQuizSession({ userId, sessionType = 'timed', totalQuestions, categoryName = null, timePerQuestion = 60, totalTimeLimit = null, autoAdvance = true, showExplanations = false, settings = {} }) {
  // Map sessionType to valid database values (timed, self_paced, learn_module)
  let mappedSessionType = sessionType;
  if (sessionType === 'timed_test' || sessionType === 'timed') {
    mappedSessionType = 'timed';
  } else if (sessionType === 'custom' || sessionType === 'self_paced') {
    mappedSessionType = 'self_paced';
  } else if (sessionType === 'quick' || sessionType === 'blitz') {
    mappedSessionType = 'timed'; // Map quick/blitz to timed (since they're timed quizzes)
  } else if (sessionType === 'learn_module') {
    mappedSessionType = 'learn_module';
  } else {
    // Default fallback
    mappedSessionType = 'self_paced';
  }
  
  // Only include columns that exist in the database schema
  const payload = {
    user_id: userId,
    session_type: mappedSessionType,
    total_questions: totalQuestions
    // Note: category_tag_id could be added if we have a way to map categoryName to tag_id
    // Other fields like time_per_question, auto_advance, etc. don't exist in current schema
  };
  console.log('🔍 [QuizService] Creating quiz session with payload:', JSON.stringify(payload, null, 2));
  console.log('ℹ️ [QuizService] Mapped session_type from', sessionType, 'to', mappedSessionType);
  
  const startTime = performance.now();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(payload)
    .select()
    .single();
  const duration = performance.now() - startTime;
  
  if (error) {
    console.error('❌ [QuizService] Error creating quiz session:', {
      message: error.message,
      details: error.details,
      userId,
      sessionType: mappedSessionType,
      duration: `${duration.toFixed(2)}ms`
    });
    throw new Error(`SESSION_CREATION_ERROR: ${error.message}`);
  }
  
  console.log('✅ [QuizService] Successfully created quiz session:', {
    sessionId: data.id,
    userId,
    sessionType: mappedSessionType,
    duration: `${duration.toFixed(2)}ms`
  });
  return data;
}

// Add this function to update user question history
export async function updateUserQuestionHistory({ userId, questionId, isCorrect }) {
  try {
    const startTime = performance.now();
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
    const duration = performance.now() - startTime;

    if (error) {
      console.error('❌ [QuizService] Error updating user question history:', {
        message: error.message,
        details: error.details,
        userId,
        questionId,
        duration: `${duration.toFixed(2)}ms`
      });
      // Don't throw - this is not critical for quiz functionality
    } else {
      console.log('✅ [QuizService] Successfully updated user question history:', {
        userId,
        questionId,
        isCorrect,
        duration: `${duration.toFixed(2)}ms`
      });
    }
  } catch (error) {
    console.error('❌ [QuizService] Unexpected error updating user question history:', {
      message: error.message,
      userId,
      questionId
    });
    // Don't throw - this is not critical for quiz functionality
  }
}

// Add this function to record question interaction using the new RPC
export async function recordQuestionInteraction({ userId, questionId, isCorrect }) {
  const { error } = await supabase.rpc('record_question_interaction', {
    p_user_id: userId,
    p_question_id: questionId,
    p_answered_correctly: isCorrect
  });
  if (error) {
    console.error('❌ [QuizService] Error recording question interaction:', error);
  }
}

// Update recordQuizResponse to use recordQuestionInteraction
export async function recordQuizResponse(sessionId, answerData) {
  if (!answerData || !answerData.questionId) {
    console.error('❌ [QuizService] recordQuizResponse: questionId is undefined! answerData:', answerData);
    return { error: 'Missing questionId in answerData.' };
  }
  
  const startTime = performance.now();
  const { data, error } = await supabase
    .from('quiz_responses')
    .insert({
      session_id: sessionId,
      question_id: answerData.questionId,
      selected_option_id: answerData.selectedOptionId,
      is_correct: answerData.isCorrect,
      time_spent_seconds: answerData.timeSpent,
      response_order: answerData.responseOrder
    })
    .select()
    .single();
  const duration = performance.now() - startTime;
    
  if (error) {
    console.error('❌ [QuizService] Error recording quiz response:', {
      message: error.message,
      details: error.details,
      sessionId,
      questionId: answerData.questionId,
      duration: `${duration.toFixed(2)}ms`
    });
    throw new Error(`RESPONSE_RECORDING_ERROR: ${error.message}`);
  }
  
  console.log('✅ [QuizService] Successfully recorded quiz response:', {
    sessionId,
    questionId: answerData.questionId,
    isCorrect: answerData.isCorrect,
    duration: `${duration.toFixed(2)}ms`
  });
  
  // Also update user question history (non-blocking)
  if (answerData.userId) {
    await recordQuestionInteraction({
      userId: answerData.userId,
      questionId: answerData.questionId,
      isCorrect: answerData.isCorrect
    });
  } else {
    console.warn('⚠️ [QuizService] No userId provided for history update', {
      sessionId,
      questionId: answerData.questionId
    });
  }
  
  return data;
}

// Mark a quiz session as completed
export async function completeQuizSession(sessionId) {
  const startTime = performance.now();
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();
  const duration = performance.now() - startTime;
  
  if (error) {
    console.error('❌ [QuizService] Error completing quiz session:', {
      message: error.message,
      details: error.details,
      sessionId,
      duration: `${duration.toFixed(2)}ms`
    });
    throw new Error(`SESSION_COMPLETION_ERROR: ${error.message}`);
  }
  
  console.log('✅ [QuizService] Successfully completed quiz session:', {
    sessionId,
    duration: `${duration.toFixed(2)}ms`
  });
  return data;
}

/**
 * Create a new Block Test session (multi-block exam simulation)
 * @param {Object} params - { userId, numBlocks, questionsPerBlock, totalQuestions, settings }
 * @returns {Promise<Object>} The created block test session
 */
export async function createBlockTestSession({ userId, numBlocks, questionsPerBlock, totalQuestions, settings = {} }) {
  // TODO: Implement DB schema for multi-block sessions if needed
  // For now, create a quiz_session with block metadata in settings
  const payload = {
    user_id: userId,
    session_type: 'block',
    total_questions: totalQuestions,
    settings: {
      ...settings,
      numBlocks,
      questionsPerBlock
    }
  };
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`BLOCK_SESSION_CREATION_ERROR: ${error.message}`);
  return data;
}

/**
 * Fetch questions for a specific block in a Block Test
 * @param {Object} params - { userId, blockIndex, questionsPerBlock, difficulty }
 * @returns {Promise<Array>} Questions for the block
 */
export async function fetchBlockQuestions({ userId, blockIndex, questionsPerBlock, difficulty = null }) {
  // TODO: Implement block-specific question selection (ensure no repeats across blocks)
  // For now, fallback to fetchQuestionsForUser
  return fetchQuestionsForUser({
    userId,
    categoryId: 'mixed',
    questionCount: questionsPerBlock,
    difficulty
  });
}

/**
 * Record a response for a question in a Block Test
 * @param {string} sessionId
 * @param {Object} answerData
 * @param {number} blockIndex
 * @returns {Promise<Object>} The recorded response
 */
export async function recordBlockResponse(sessionId, answerData, blockIndex) {
  // TODO: Optionally store blockIndex in quiz_responses if schema allows
  // For now, use recordQuizResponse
  return recordQuizResponse(sessionId, { ...answerData, blockIndex });
}

/**
 * Pause a Block Test session
 * @param {string} sessionId
 * @param {Object} pauseData - { currentBlock, currentQuestion, timeLeft, ... }
 * @returns {Promise<Object>} The updated session
 */
export async function pauseBlockSession(sessionId, pauseData) {
  // TODO: Store pause state in quiz_sessions.settings or dedicated columns
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      settings: pauseData,
      paused_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw new Error(`BLOCK_SESSION_PAUSE_ERROR: ${error.message}`);
  return data;
}

/**
 * Resume a paused Block Test session
 * @param {string} sessionId
 * @returns {Promise<Object>} The updated session
 */
export async function resumeBlockSession(sessionId) {
  // TODO: Clear paused_at and update settings as needed
  const { data, error } = await supabase
    .from('quiz_sessions')
    .update({
      paused_at: null
    })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw new Error(`BLOCK_SESSION_RESUME_ERROR: ${error.message}`);
  return data;
}

/**
 * Complete a Block Test session
 * @param {string} sessionId
 * @returns {Promise<Object>} The completed session
 */
export async function completeBlockTestSession(sessionId) {
  // Mark session as completed (reuse existing logic)
  return completeQuizSession(sessionId);
}
