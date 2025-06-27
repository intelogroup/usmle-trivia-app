import { useState, useEffect, useCallback } from 'react';

export const useQuizTimer = ({
  initialTime = 60,
  isActive = true,
  onTimeUp,
  resetTrigger = 0
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [timerKey, setTimerKey] = useState(0);

  // Reset timer when resetTrigger changes
  useEffect(() => {
    setTimeLeft(initialTime);
    setTimerKey(prev => prev + 1);
  }, [resetTrigger, initialTime]);

  // Timer countdown effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return initialTime; // Reset for next question
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp, initialTime, timerKey]);

  // Manual reset function
  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setTimerKey(prev => prev + 1);
  }, [initialTime]);

  // Format time as MM:SS
  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Get timer state
  const isLowTime = timeLeft <= 10;
  const progressPercentage = (timeLeft / initialTime) * 100;

  return {
    timeLeft,
    timerKey,
    formatTime,
    resetTimer,
    isLowTime,
    progressPercentage,
  };
}; 