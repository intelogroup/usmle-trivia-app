import { useState, useEffect, useCallback } from 'react';

export const useTimedTestTimer = ({
  totalTimeInSeconds = 1800, // 30 minutes
  isActive = true,
  onTimeUp
}) => {
  const [totalTimeLeft, setTotalTimeLeft] = useState(totalTimeInSeconds);

  // Timer countdown effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  // Format time as MM:SS
  const formatTime = useCallback(() => {
    const minutes = Math.floor(totalTimeLeft / 60);
    const seconds = totalTimeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [totalTimeLeft]);

  // Calculate time taken
  const timeTaken = totalTimeInSeconds - totalTimeLeft;

  // Calculate average time per question answered
  const getAvgTimePerQuestion = useCallback((questionsAnswered) => {
    if (questionsAnswered === 0) return 0;
    return Math.round(timeTaken / questionsAnswered);
  }, [timeTaken]);

  // Estimate time for current question based on pace
  const getEstimatedTimeForQuestion = useCallback((currentQuestionIndex, totalQuestions) => {
    const avgTimePerQuestion = 90; // 1.5 minutes target
    const timeUsedSoFar = timeTaken;
    const questionsRemaining = totalQuestions - currentQuestionIndex;
    const timeRemaining = totalTimeLeft;
    
    if (questionsRemaining === 0) return 0;
    
    // Calculate how much time we have per remaining question
    const timePerRemainingQuestion = Math.floor(timeRemaining / questionsRemaining);
    
    return Math.max(0, timePerRemainingQuestion);
  }, [totalTimeLeft, timeTaken]);

  // Check if time is running low (less than 5 minutes)
  const isLowTime = totalTimeLeft <= 300;

  // Check if time is critically low (less than 1 minute)
  const isCriticalTime = totalTimeLeft <= 60;

  // Get time left percentage
  const timeLeftPercentage = (totalTimeLeft / totalTimeInSeconds) * 100;

  return {
    totalTimeLeft,
    timeTaken,
    formatTime,
    getAvgTimePerQuestion,
    getEstimatedTimeForQuestion,
    isLowTime,
    isCriticalTime,
    timeLeftPercentage,
  };
}; 