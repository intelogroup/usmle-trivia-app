import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useQuestionsQuery } from './useOptimizedQueries';
import { logger } from '../utils/logger';
import { supabase } from '../lib/supabase';

// Quiz mode configuration constants (from QUIZ_MODES_GUIDE.md)
const QUICK_QUIZ_CONFIG = {
  questionCount: 10,
  autoAdvance: true,
  timePerQuestion: 60,
  showExplanations: false,
  allowReview: false
};
const TIMED_TEST_CONFIG = {
  questionCount: 20,
  totalTime: 30 * 60, // 30 minutes in seconds
  autoAdvance: false,
  timePerQuestion: 90,
  showExplanations: true,
  allowReview: false
};

// Helper to get quiz mode config
const getQuizModeConfig = (quizMode) => {
  if (quizMode === 'quick') return QUICK_QUIZ_CONFIG;
  if (quizMode === 'timed') return TIMED_TEST_CONFIG;
  // Add more modes as needed
  return QUICK_QUIZ_CONFIG;
};

/**
 * Simplified quiz controller that provides quiz configuration and question fetching
 * Individual quiz components should handle their own state management
 */
export const useQuizController = (config) => {
  const { user } = useAuth();
  
  // Destructure config for easier access
  const {
    categoryId,
    questionCount,
    difficulty,
    quizMode
  } = config;

  // Get quiz mode configuration
  const quizConfig = useMemo(() => getQuizModeConfig(quizMode), [quizMode]);

  // Questions data management using optimized queries
  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuestionsQuery(categoryId, questionCount || quizConfig.questionCount);

  // Check if we're in offline mode
  const isOffline = useMemo(() => {
    return questionsError && questions.length > 0;
  }, [questionsError, questions.length]);

  // Computed states
  const quizStatus = useMemo(() => {
    if (questionsLoading) return 'loading';
    if (questionsError && questions.length === 0) return 'error';
    if (!questionsLoading && !questionsError && questions.length === 0) return 'no-questions';
    return 'ready';
  }, [questionsLoading, questionsError, questions.length]);

  const canStart = useMemo(() => {
    return questions.length > 0 && !questionsLoading && !questionsError;
  }, [questions.length, questionsLoading, questionsError]);

  // Session creation helper
  const createQuizSession = useCallback(async (sessionConfig) => {
    if (!user?.id) {
      logger.warn('Cannot create quiz session: user not authenticated', { user });
      return null;
    }

    try {
      // Verify current authentication state
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        logger.error('Authentication verification failed during quiz session creation', { authError, currentUser });
        throw new Error('Please log in to start a quiz session');
      }

      logger.info('Creating quiz session', {
        userId: user.id,
        quizMode,
        categoryId,
        questionCount: questionCount || quizConfig.questionCount
      });

      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          session_type: 'timed',
          total_questions: questionCount || quizConfig.questionCount,
          category_name: categoryId !== 'mixed' ? categoryId : null,
          time_per_question: quizConfig.timePerQuestion,
          total_time_limit: quizConfig.totalTime,
          auto_advance: quizConfig.autoAdvance,
          show_explanations: quizConfig.showExplanations,
          settings: sessionConfig || {}
        })
        .select()
        .single();

      if (error) {
        logger.error('Database error creating quiz session', { 
          error: error.message, 
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId: user.id,
          sessionConfig 
        });
        throw error;
      }
      
      logger.event('quiz_session_created', {
        userId: user.id,
        sessionId: data.id,
        quizMode,
        categoryId,
        questionCount: questionCount || quizConfig.questionCount
      });

      return data;
    } catch (error) {
      logger.error('Failed to create quiz session', { 
        error: error.message,
        userId: user?.id,
        quizMode,
        categoryId
      });
      throw error;
    }
  }, [user, quizMode, categoryId, questionCount, quizConfig]);

  // Response recording helper
  const recordQuizResponse = useCallback(async (sessionId, responseData) => {
    if (!sessionId || !responseData) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .insert({
          session_id: sessionId,
          question_id: responseData.questionId,
          selected_option_id: responseData.selectedOptionId,
          is_correct: responseData.isCorrect,
          time_spent_seconds: responseData.timeSpent,
          response_order: responseData.responseOrder
        })
        .select()
        .single();

      if (error) throw error;
      logger.info('Quiz response recorded successfully', {
        userId: user.id,
        quizMode,
        categoryId,
        sessionId,
        questionId: responseData.questionId,
        selectedOptionId: responseData.selectedOptionId,
        isCorrect: responseData.isCorrect,
        timeSpent: responseData.timeSpent,
        responseOrder: responseData.responseOrder
      });
      return data;
    } catch (error) {
      logger.error('Failed to record quiz response', error);
      throw error;
    }
  }, [user, quizMode, categoryId]);

  return {
    // Core configuration
    config: quizConfig,
    originalConfig: config,
    
    // Questions data
    questions,
    questionsLoading,
    questionsError,
    refetchQuestions,
    
    // Status
    quizStatus,
    canStart,
    isOffline,
    
    // Helpers
    createQuizSession,
    recordQuizResponse,
    
    // Loading state
    isLoading: questionsLoading
  };
};
