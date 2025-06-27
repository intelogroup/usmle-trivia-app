import { useState, useEffect, useCallback } from 'react';
import {
  useCreateQuizSession,
  useRecordQuizResponsesBatch,
  useUpdateUserQuestionHistoryBatch,
  useCompleteQuizSession,
} from '../hooks/useQuestionQueries';

export const useQuizSession = (user, categoryId, questionCount, isOffline) => {
  const [quizSession, setQuizSession] = useState(null);
  const [quizResponses, setQuizResponses] = useState([]);
  const [userQuestionHistoryUpdates, setUserQuestionHistoryUpdates] = useState([]);

  // Mutation hooks
  const createSessionMutation = useCreateQuizSession();
  const recordQuizResponsesBatch = useRecordQuizResponsesBatch();
  const updateUserQuestionHistoryBatch = useUpdateUserQuestionHistoryBatch();
  const completeSessionMutation = useCompleteQuizSession();

  // Create quiz session
  const createSession = useCallback(async () => {
    if (user && !quizSession && !isOffline) {
      try {
        const sessionData = await createSessionMutation.mutateAsync({
          userId: user.id,
          categoryId,
          questionCount
        });
        setQuizSession(sessionData);
        return sessionData;
      } catch (err) {
        console.error('Error creating quiz session:', err);
        return null;
      }
    }
  }, [user, quizSession, isOffline, createSessionMutation, categoryId, questionCount]);

  // Record a single response
  const recordResponse = useCallback((response) => {
    if (!isOffline && quizSession) {
      setQuizResponses(prev => [...prev, {
        session_id: quizSession.id,
        question_id: response.questionId,
        selected_option_id: response.selectedOptionId,
        is_correct: response.isCorrect,
        response_order: response.responseOrder,
        time_spent_seconds: response.timeSpent || 0
      }]);

      setUserQuestionHistoryUpdates(prev => [...prev, {
        user_id: user.id,
        question_id: response.questionId,
        last_answered_correctly: response.isCorrect,
        last_seen_at: new Date().toISOString()
      }]);
    }
  }, [isOffline, quizSession, user]);

  // Complete the quiz session
  const completeSession = useCallback(async (finalScore) => {
    try {
      if (!isOffline && quizSession) {
        // Complete the session
        await completeSessionMutation.mutateAsync({
          sessionId: quizSession.id,
          userId: user.id,
          finalScore,
        });
        
        // Record all responses
        if (quizResponses.length > 0) {
          await recordQuizResponsesBatch.mutateAsync(quizResponses);
        }
        
        // Update user question history
        if (userQuestionHistoryUpdates.length > 0) {
          await updateUserQuestionHistoryBatch.mutateAsync(userQuestionHistoryUpdates);
        }
      }
    } catch (err) {
      console.error('Error completing quiz session:', err);
    }
  }, [
    isOffline,
    quizSession,
    user,
    completeSessionMutation,
    quizResponses,
    userQuestionHistoryUpdates,
    recordQuizResponsesBatch,
    updateUserQuestionHistoryBatch
  ]);

  // Reset session data
  const resetSession = useCallback(() => {
    setQuizSession(null);
    setQuizResponses([]);
    setUserQuestionHistoryUpdates([]);
  }, []);

  return {
    quizSession,
    createSession,
    recordResponse,
    completeSession,
    resetSession,
    isLoading: createSessionMutation.isLoading,
  };
}; 