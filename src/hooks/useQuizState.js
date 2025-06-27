import { useState, useCallback } from 'react';

export const useQuizState = (questions = [], questionCount = 10) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Calculate current question and progress
  const currentQuestion = questions[currentQuestionIndex] || null;
  const progress = ((currentQuestionIndex + 1) / questionCount) * 100;
  const accuracy = userAnswers.length > 0 ? Math.round((score / userAnswers.length) * 100) : 0;

  // Handle option selection
  const handleOptionSelect = useCallback((optionId) => {
    if (selectedOption !== null || isAutoAdvancing || !currentQuestion) return;
    
    setSelectedOption(optionId);
    const isCorrect = optionId === currentQuestion.correct_option_id;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Store user answer
    const userAnswer = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion,
      selectedOptionId: optionId,
      isCorrect,
      timedOut: false,
    };
    
    setUserAnswers(prev => [...prev, userAnswer]);

    return { isCorrect, userAnswer };
  }, [selectedOption, isAutoAdvancing, currentQuestion, currentQuestionIndex]);

  // Handle timeout (when user doesn't select anything)
  const handleTimeout = useCallback(() => {
    if (selectedOption !== null || isAutoAdvancing || !currentQuestion) return;

    // Record as incorrect with timeout flag
    const userAnswer = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion,
      selectedOptionId: null,
      isCorrect: false,
      timedOut: true,
    };
    
    setUserAnswers(prev => [...prev, userAnswer]);
    return { isCorrect: false, userAnswer };
  }, [selectedOption, isAutoAdvancing, currentQuestion, currentQuestionIndex]);

  // Advance to next question
  const advanceQuestion = useCallback(() => {
    setIsAutoAdvancing(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAutoAdvancing(false);
      } else {
        completeQuiz();
      }
    }, 500);
  }, [currentQuestionIndex, questions.length]);

  // Complete the quiz
  const completeQuiz = useCallback(() => {
    setQuizCompleted(true);
    
    // Calculate final score including current question if answered
    let allAnswers = [...userAnswers];
    if (selectedOption !== null && !userAnswers.find(a => a.questionIndex === currentQuestionIndex)) {
      const isCorrect = selectedOption === currentQuestion?.correct_option_id;
      allAnswers.push({
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        selectedOptionId: selectedOption,
        isCorrect,
        timedOut: false,
      });
    }
    
    const finalScore = allAnswers.filter(answer => answer.isCorrect).length;
    setScore(finalScore);
    setUserAnswers(allAnswers);
    setShowResults(true);

    return { finalScore, allAnswers };
  }, [userAnswers, selectedOption, currentQuestionIndex, currentQuestion]);

  // Reset quiz state
  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setShowResults(false);
    setIsAutoAdvancing(false);
  }, []);

  // Check if quiz can advance (either answered or timed out)
  const canAdvance = selectedOption !== null || isAutoAdvancing;

  return {
    // State
    currentQuestionIndex,
    currentQuestion,
    selectedOption,
    score,
    userAnswers,
    quizCompleted,
    showResults,
    isAutoAdvancing,
    progress,
    accuracy,
    canAdvance,

    // Actions
    handleOptionSelect,
    handleTimeout,
    advanceQuestion,
    completeQuiz,
    resetQuiz,
  };
}; 