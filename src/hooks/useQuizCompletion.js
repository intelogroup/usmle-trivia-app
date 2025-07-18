import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queries/queryKeys';
import { completeQuizSession } from '../services/questionService';

/**
 * Hook for handling quiz completion with proper data refresh
 * Centralizes completion logic and ensures consistent point updates
 */
export function useQuizCompletion() {
  const queryClient = useQueryClient();

  const completeQuiz = useCallback(async (sessionId, completionData, userId) => {
    try {
      // Complete the quiz session
      await completeQuizSession(sessionId, completionData);
      
      // Refresh user data queries
      if (userId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.userPoints(userId)
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.userStats(userId)
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.userActivity(userId)
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.recentActivity(userId)
          })
        ]);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to complete quiz:', error);
      return false;
    }
  }, [queryClient]);

  return { completeQuiz };
}