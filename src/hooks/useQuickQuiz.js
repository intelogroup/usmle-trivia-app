import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchQuestionsForUser, createQuizSession, recordQuizResponse, completeQuizSession } from '../services/questionService';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queries/queryKeys';

export function useQuickQuiz({ userId, categoryId = 'mixed', questionCount = 10, difficulty = null, timePerQuestion = 60 }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizSession, setQuizSession] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);

  const timerRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch questions and create session on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    console.log('Fetching questions with params:', { categoryId, questionCount, difficulty });
    
    // Use the new smart function instead of fetchQuestions
    fetchQuestionsForUser({ userId, categoryId, questionCount, difficulty })
      .then(async (qs) => {
        if (!isMounted) return;
        console.log('Fetched questions:', qs.length, qs);
        setQuestions(qs);
        if (qs.length > 0) {
          const session = await createQuizSession({
            userId,
            sessionType: 'quick', // Use 'quick' for QuickQuiz
            totalQuestions: qs.length,
            categoryName: categoryId !== 'mixed' ? categoryId : null,
            timePerQuestion,
            autoAdvance: true,
            showExplanations: false,
            settings: {}
          });
          if (isMounted) setQuizSession(session);
        }
      })
      .catch(e => {
        if (isMounted) setError(e);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [userId, categoryId, questionCount, difficulty, timePerQuestion]);

  // Timer logic
  useEffect(() => {
    if (isAnswered || isComplete || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setIsAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isAnswered, isComplete, loading]);

  // Handle answer selection
  const handleOptionSelect = useCallback((optionId) => {
    if (isAnswered || timedOut || isComplete) return;
    setSelectedOption(optionId);
    setIsAnswered(true);
    clearInterval(timerRef.current);
    const currentQuestion = questions[currentIndex];
    const isCorrect = optionId === currentQuestion.correct_option_id;
    const timeSpent = timePerQuestion - timeLeft;
    const answerData = {
      userId,
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect,
      timeSpent,
      responseOrder: currentIndex + 1,
      question: currentQuestion,
      timedOut: false
    };
    setUserAnswers(prev => [...prev, answerData]);
    if (quizSession) {
      recordQuizResponse({
        sessionId: quizSession.id,
        userId: answerData.userId,
        questionId: answerData.questionId,
        selectedOptionId: answerData.selectedOptionId,
        isCorrect: answerData.isCorrect,
        timeSpent: answerData.timeSpent,
        responseOrder: answerData.responseOrder
      }).catch(() => {});
    }
  }, [isAnswered, timedOut, isComplete, questions, currentIndex, timeLeft, timePerQuestion, quizSession]);

  // Handle timeout as incorrect answer
  useEffect(() => {
    if (timedOut && !isAnswered && !isComplete) {
      const currentQuestion = questions[currentIndex];
      const answerData = {
        userId,
        questionId: currentQuestion.id,
        selectedOptionId: null,
        isCorrect: false,
        timeSpent: timePerQuestion,
        responseOrder: currentIndex + 1,
        question: currentQuestion,
        timedOut: true
      };
      setUserAnswers(prev => [...prev, answerData]);
      setIsAnswered(true);
      if (quizSession) {
        recordQuizResponse({
          sessionId: quizSession.id,
          userId: answerData.userId,
          questionId: answerData.questionId,
          selectedOptionId: answerData.selectedOptionId,
          isCorrect: answerData.isCorrect,
          timeSpent: answerData.timeSpent,
          responseOrder: answerData.responseOrder
        }).catch(() => {});
      }
    }
  }, [timedOut, isAnswered, isComplete, questions, currentIndex, timePerQuestion, quizSession]);

  // Move to next question
  const moveToNextQuestion = useCallback(() => {
    setIsAnswered(false);
    setSelectedOption(null);
    setTimedOut(false);
    setTimeLeft(timePerQuestion);
    setCurrentIndex(idx => idx + 1);
  }, [timePerQuestion]);

  // Complete quiz
  const completeQuiz = useCallback(async () => {
    setIsComplete(true);
    clearInterval(timerRef.current);
    
    // Complete the quiz session with proper data
    if (quizSession && userId) {
      const correctCount = userAnswers.filter(a => a.isCorrect).length;
      const totalTime = questionCount * timePerQuestion;
      const pointsEarned = correctCount * 2;
      
      try {
        await completeQuizSession(quizSession.id, {
          correctAnswers: correctCount,
          totalTimeSeconds: totalTime,
          pointsEarned,
          totalQuestions: questions.length,
          responses: userAnswers
        });
        
        // Refresh user points and stats
        await queryClient.invalidateQueries({
          queryKey: queryKeys.userPoints(userId)
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.userStats(userId)
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.userActivity(userId)
        });
      } catch (error) {
        console.warn('Failed to complete quiz session:', error);
      }
    }
  }, [quizSession, userAnswers, questionCount, timePerQuestion, questions.length, userId, queryClient]);

  // Auto-advance after answer or timeout
  useEffect(() => {
    if (isAnswered && !isComplete) {
      const isLast = currentIndex === questions.length - 1;
      const timeout = setTimeout(() => {
        if (isLast) {
          completeQuiz();
        } else {
          moveToNextQuestion();
        }
      }, timedOut ? 1000 : 500);
      return () => clearTimeout(timeout);
    }
  }, [isAnswered, isComplete, currentIndex, questions.length, completeQuiz, moveToNextQuestion, timedOut]);

  return {
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    userAnswers,
    isAnswered,
    selectedOption,
    timedOut,
    loading,
    error,
    isComplete,
    timeLeft,
    handleOptionSelect,
    moveToNextQuestion,
    completeQuiz,
    quizSession
  };
}
