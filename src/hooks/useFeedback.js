import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { submitQuizFeedback, getFeedbackStats, getUserFeedbackHistory } from '../services/feedbackService';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys } from './queries/queryKeys';

/**
 * Hook for managing quiz feedback
 * Handles submission, stats, and user history
 */
export const useFeedback = () => {
  const { user } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentQuizData, setCurrentQuizData] = useState(null);

  // Mutation for submitting feedback
  const feedbackMutation = useMutation({
    mutationFn: submitQuizFeedback,
    onSuccess: (data) => {
      console.log('Feedback submitted successfully:', data);
      setShowFeedbackModal(false);
      setCurrentQuizData(null);
    },
    onError: (error) => {
      console.error('Failed to submit feedback:', error);
    }
  });

  // Query for feedback stats
  const { data: feedbackStats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.feedbackStats(),
    queryFn: getFeedbackStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });

  // Query for user feedback history
  const { data: userFeedbackHistory, isLoading: historyLoading } = useQuery({
    queryKey: queryKeys.userFeedbackHistory(user?.id),
    queryFn: () => getUserFeedbackHistory(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  });

  // Show feedback modal after quiz completion
  const requestFeedback = useCallback((quizData) => {
    setCurrentQuizData(quizData);
    setShowFeedbackModal(true);
  }, []);

  // Submit feedback
  const submitFeedback = useCallback(async (feedbackData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const completeData = {
      ...feedbackData,
      userId: user.id
    };

    return feedbackMutation.mutateAsync(completeData);
  }, [user?.id, feedbackMutation]);

  // Close feedback modal
  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setCurrentQuizData(null);
  }, []);

  // Check if user should be shown feedback request
  const shouldRequestFeedback = useCallback((quizData) => {
    // Only request feedback for completed quizzes
    if (!quizData?.isCompleted) return false;
    
    // Don't request feedback if user has already provided feedback for this session
    if (userFeedbackHistory?.some(f => f.quiz_session_id === quizData.sessionId)) {
      return false;
    }
    
    // Show feedback request with a probability (e.g., 30% chance)
    // This prevents overwhelming users with feedback requests
    const shouldShow = Math.random() < 0.3;
    
    // Or show feedback for specific conditions:
    // - High scores (encourage positive feedback)
    // - Low scores (gather improvement feedback)
    // - First quiz completion
    const score = quizData.score || 0;
    const totalQuestions = quizData.totalQuestions || 1;
    const accuracy = (score / totalQuestions) * 100;
    
    if (accuracy >= 80 || accuracy <= 40) {
      return true;
    }
    
    return shouldShow;
  }, [userFeedbackHistory]);

  return {
    // State
    showFeedbackModal,
    currentQuizData,
    feedbackStats,
    userFeedbackHistory,
    
    // Loading states
    isSubmitting: feedbackMutation.isPending,
    statsLoading,
    historyLoading,
    
    // Functions
    requestFeedback,
    submitFeedback,
    closeFeedbackModal,
    shouldRequestFeedback,
    
    // Computed values
    hasUserFeedback: userFeedbackHistory && userFeedbackHistory.length > 0,
    averageUserRating: userFeedbackHistory?.length > 0 
      ? userFeedbackHistory.reduce((sum, f) => sum + f.rating, 0) / userFeedbackHistory.length 
      : 0
  };
};

export default useFeedback;