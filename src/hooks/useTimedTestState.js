import { useState, useCallback } from 'react';

export const useTimedTestState = (questions = [], questionCount = 20) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Calculate current question and progress
  const currentQuestion = questions[currentQuestionIndex] || null;
  const progress = ((currentQuestionIndex + 1) / questionCount) * 100;
  const accuracy = userAnswers.length > 0 ? Math.round((score / userAnswers.length) * 100) : 0;

  // Handle option selection
  const handleOptionSelect = useCallback((optionId) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
  }, [isAnswered]);

  // Submit answer
  const submitAnswer = useCallback((timeSpent = 0) => {
    if (selectedOption === null || isAnswered || !currentQuestion) return null;
    
    const isCorrect = selectedOption === currentQuestion.correct_option_id;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    setIsAnswered(true);
    setShowExplanation(true);

    // Store user answer
    const userAnswer = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion,
      selectedOptionId: selectedOption,
      isCorrect,
      timeSpent,
    };
    
    setUserAnswers(prev => [...prev, userAnswer]);

    return { isCorrect, userAnswer };
  }, [selectedOption, isAnswered, currentQuestion, currentQuestionIndex]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
      return false; // Not finished
    } else {
      return true; // Test finished
    }
  }, [currentQuestionIndex, questions.length]);

  // Complete the test
  const completeTest = useCallback(() => {
    setShowResults(true);
    return { finalScore: score, allAnswers: userAnswers };
  }, [score, userAnswers]);

  // Reset test state
  const resetTest = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers([]);
    setShowResults(false);
    setShowExplanation(false);
  }, []);

  // Check if can submit (has selection and not answered)
  const canSubmit = selectedOption !== null && !isAnswered;

  // Check if can proceed to next question
  const canProceed = isAnswered;

  return {
    // State
    currentQuestionIndex,
    currentQuestion,
    selectedOption,
    isAnswered,
    score,
    userAnswers,
    showResults,
    showExplanation,
    progress,
    accuracy,
    canSubmit,
    canProceed,

    // Actions
    handleOptionSelect,
    submitAnswer,
    nextQuestion,
    completeTest,
    resetTest,
  };
}; 