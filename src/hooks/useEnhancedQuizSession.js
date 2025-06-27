import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedQuestionService } from '../services/enhancedQuestionService';
import { UserProgressManager } from '../lib/userProgressManager';

/**
 * Enhanced quiz session hook that properly aligns with database schema
 * and supports all quiz modes from the quiz modes guide
 */
export const useEnhancedQuizSession = (user, quizConfig, isOffline = false) => {
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const queryClient = useQueryClient();
  const progressManager = new UserProgressManager(user?.id);

  // Create quiz session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (config) => {
      if (isOffline) return null;
      return EnhancedQuestionService.createQuizSession({
        userId: user.id,
        quizMode: config.quizMode,
        categoryId: config.categoryId,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        timerConfig: {
          timePerQuestion: config.timePerQuestion,
          totalTime: config.totalTime
        },
        settings: config
      });
    },
    onSuccess: (data) => {
      setSession(data);
      setStartTime(Date.now());
    },
    onError: (error) => {
      console.error('Enhanced session creation failed:', error);
    }
  });

  // Record responses mutation  
  const recordResponsesMutation = useMutation({
    mutationFn: async ({ sessionId, responses }) => {
      if (isOffline) return;
      return EnhancedQuestionService.recordQuizResponses(sessionId, responses);
    }
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async ({ sessionId, completionData }) => {
      if (isOffline) return;
      
      // Record all responses first
      if (responses.length > 0) {
        await EnhancedQuestionService.recordQuizResponses(sessionId, responses);
      }
      
      // Then complete the session
      return EnhancedQuestionService.completeQuizSession(sessionId, completionData);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['user-stats', user?.id]);
      queryClient.invalidateQueries(['quiz-history', user?.id]);
    }
  });

  // Create session when component mounts
  const createSession = useCallback(async () => {
    if (!user || session || isOffline) return null;
    
    try {
      const sessionData = await createSessionMutation.mutateAsync(quizConfig);
      return sessionData;
    } catch (error) {
      console.error('Failed to create enhanced quiz session:', error);
      return null;
    }
  }, [user, session, isOffline, createSessionMutation, quizConfig]);

  // Record a single response
  const recordResponse = useCallback((response) => {
    const responseRecord = {
      questionId: response.questionId,
      selectedOptionId: response.selectedOptionId,
      isCorrect: response.isCorrect,
      timeSpent: response.timeSpent || 0,
      answeredAt: new Date().toISOString()
    };
    
    setResponses(prev => [...prev, responseRecord]);
  }, []);

  // Complete the quiz session
  const completeSession = useCallback(async (results) => {
    if (!session || isOffline) return;
    
    const totalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    const completionData = {
      correctAnswers: results.score,
      totalTimeSeconds: totalTime,
      pointsEarned: results.score * 10, // 10 points per correct answer
      userId: user.id
    };
    
    try {
      await completeSessionMutation.mutateAsync({
        sessionId: session.id,
        completionData
      });
      
      // Reset local state
      setSession(null);
      setResponses([]);
      setStartTime(null);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to complete enhanced quiz session:', error);
      return { success: false, error };
    }
  }, [session, isOffline, startTime, user, completeSessionMutation]);

  // Reset session state
  const resetSession = useCallback(() => {
    setSession(null);
    setResponses([]);
    setStartTime(null);
  }, []);

  // Auto-create session when config changes
  useEffect(() => {
    if (user && !session && !isOffline && quizConfig) {
      createSession();
    }
  }, [user, session, isOffline, quizConfig, createSession]);

  return {
    // Session data
    session,
    responses,
    startTime,
    
    // Actions
    createSession,
    recordResponse,
    completeSession,
    resetSession,
    
    // Status
    isCreating: createSessionMutation.isLoading,
    isRecording: recordResponsesMutation.isLoading,
    isCompleting: completeSessionMutation.isLoading,
    
    // Errors
    createError: createSessionMutation.error,
    recordError: recordResponsesMutation.error,
    completeError: completeSessionMutation.error
  };
}; 