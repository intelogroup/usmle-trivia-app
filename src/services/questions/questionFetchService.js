import { supabase } from '../../lib/supabase';
import logger, { logPerformance } from '../../utils/logger';

/**
 * Question Fetching Service
 * Handles all question fetching logic including smart user-aware fetching
 */

// Fisher-Yates (aka Knuth) Shuffle utility
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

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

// Fetch questions for QuickQuiz or other quiz modes (LEGACY - doesn't consider user history)
export async function fetchQuestions({ categoryId = 'mixed', questionCount = 10, difficulty = null }) {
  let query;
  
  if (categoryId && categoryId !== 'mixed') {
    // Use join query to filter by tag
    query = supabase
      .from('questions')
      .select(`
        *,
        question_tags!inner(
          tag_id,
          tags!inner(
            id,
            name
          )
        )
      `)
      .eq('is_active', true)
      .eq('question_tags.tag_id', categoryId);
  } else {
    // Simple query for mixed/all questions
    query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true);
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  query = query.limit(questionCount * 2); // Get more for better randomization

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

  // Shuffle and limit to requested count
  const shuffledQuestions = shuffleArray([...data]);
  const limitedQuestions = shuffledQuestions.slice(0, questionCount);

  console.log('✅ [QuizService] Successfully fetched questions:', {
    totalFound: data.length,
    returned: limitedQuestions.length,
    categoryId,
    difficulty,
    duration: `${duration.toFixed(2)}ms`
  });
  return limitedQuestions;
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

      if (!unseenQuestions || unseenQuestions.length === 0) {
        logger.warn('No unseen questions found, falling back to basic fetch');
        return fetchQuestions({ categoryId, questionCount, difficulty });
      }

      // Shuffle and limit questions
      const shuffledQuestions = shuffleArray([...unseenQuestions]);
      const selectedQuestions = shuffledQuestions.slice(0, questionCount);

      logger.success('Successfully fetched smart questions for user', {
        totalUnseen: unseenQuestions.length,
        selected: selectedQuestions.length,
        categoryId,
        difficulty
      });

      return selectedQuestions;

    } catch (error) {
      logger.error('Exception in fetchQuestionsForUser, falling back to basic fetch', {
        error: error.message,
        stack: error.stack
      });
      return fetchQuestions({ categoryId, questionCount, difficulty });
    }
  });
}

// Fetch questions for specific blocks in Block Tests
export async function fetchBlockQuestions(blockConfig) {
  const { categoryId, questionCount, difficulty, excludeQuestionIds = [] } = blockConfig;
  
  logger.info('Fetching block questions', blockConfig);
  
  let query;
  
  if (categoryId && categoryId !== 'mixed') {
    // Use join query to filter by tag
    query = supabase
      .from('questions')
      .select(`
        *,
        question_tags!inner(
          tag_id,
          tags!inner(
            id,
            name
          )
        )
      `)
      .eq('is_active', true)
      .eq('question_tags.tag_id', categoryId);
  } else {
    // Simple query for mixed/all questions
    query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true);
  }
  
  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  
  if (excludeQuestionIds.length > 0) {
    query = query.not('id', 'in', `(${excludeQuestionIds.join(',')})`);
  }
  
  query = query.limit(questionCount);

  const { data, error } = await query;
  
  if (error) {
    logger.error('Error fetching block questions', { error, blockConfig });
    throw new Error(`FETCH_BLOCK_QUESTIONS_ERROR: ${error.message}`);
  }

  const shuffledQuestions = shuffleArray([...data]);
  logger.success('Successfully fetched block questions', {
    count: shuffledQuestions.length,
    blockConfig
  });
  
  return shuffledQuestions;
}

export { shuffleArray };