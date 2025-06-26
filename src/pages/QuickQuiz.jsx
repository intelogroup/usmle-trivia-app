import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useQuestions,
  useCreateQuizSession,
  useRecordQuizResponsesBatch,
  useUpdateUserQuestionHistoryBatch,
  useCompleteQuizSession,
  useCacheManager
} from '../hooks/useQuestionQueries';

// Import quiz components
import QuizHeader from '../components/quiz/QuizHeader';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizLoading from '../components/quiz/QuizLoading';
import QuizError from '../components/quiz/QuizError';

// Import icons
import { Zap, CheckCircle, XCircle, Star, Trophy, Target, Clock, RotateCcw } from 'lucide-react';

// Import gamification components
import Confetti from '../components/ui/Confetti';

const QuickQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get quiz settings from navigation state or use defaults
  const {
    categoryId = 'mixed',
    categoryName = 'Quick Quiz',
    questionCount = 10,
    difficulty = null,
    quizType = 'quick',
    isAutoAdvance = true,
    showExplanations = false,
    isTimed = false,
    isBlitzMode = false
  } = location.state || {};
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizSession, setQuizSession] = useState(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  const [timerKey, setTimerKey] = useState(0); // Key to reset timer

  // Hook calls
  const { getOfflineData } = useCacheManager();

  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError,
    isError: hasQuestionsError,
  } = useQuestions(categoryId, questionCount, difficulty, {
    enabled: !!user,
    retry: (failureCount, error) => {
      const offlineData = getOfflineData(categoryId, questionCount);
      return !offlineData && failureCount < 2;
    }
  });

  const isOffline = useMemo(() => {
    return hasQuestionsError && questions.length > 0;
  }, [hasQuestionsError, questions.length]);

  const createSessionMutation = useCreateQuizSession();
  const recordQuizResponsesBatch = useRecordQuizResponsesBatch();
  const updateUserQuestionHistoryBatch = useUpdateUserQuestionHistoryBatch();
  const completeSessionMutation = useCompleteQuizSession();

  const [quizResponses, setQuizResponses] = useState([]);
  const [userQuestionHistoryUpdates, setUserQuestionHistoryUpdates] = useState([]);

  // Create quiz session
  useEffect(() => {
    const createSession = async () => {
      if (user && questions.length > 0 && !quizSession) {
        try {
          const sessionData = await createSessionMutation.mutateAsync({
            userId: user.id,
            categoryId,
            questionCount
          });
          setQuizSession(sessionData);
        } catch (err) {
          console.error('Error creating quiz session:', err);
        }
      }
    };

    createSession();
  }, [user, questions.length, quizSession, createSessionMutation]);

  // Timer effect
  useEffect(() => {
    if (showResults || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto advance to next question
          handleTimeUp();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResults, quizCompleted, timerKey]);

  const handleTimeUp = () => {
    if (selectedOption === null && !isAutoAdvancing) {
      // User didn't select anything - record as incorrect
      const currentQuestion = questions[currentQuestionIndex];
      
      const userAnswer = {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        selectedOptionId: null,
        isCorrect: false,
        timedOut: true,
      };
      
      setUserAnswers(prev => [...prev, userAnswer]);

      // Record response for backend
      if (quizSession && !isOffline) {
        setQuizResponses(prev => [...prev, {
          session_id: quizSession.id,
          question_id: currentQuestion.id,
          selected_option_id: null,
          is_correct: false,
          response_order: currentQuestionIndex + 1,
          time_spent_seconds: 60
        }]);

        setUserQuestionHistoryUpdates(prev => [...prev, {
          user_id: user.id,
          question_id: currentQuestion.id,
          last_answered_correctly: false,
          last_seen_at: new Date().toISOString()
        }]);
      }

      // Auto-advance
      setIsAutoAdvancing(true);
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedOption(null);
          setIsAutoAdvancing(false);
          setTimeLeft(60);
          setTimerKey(prev => prev + 1);
        } else {
          completeQuiz();
        }
      }, 500);
    }
  };

  const handleOptionSelect = (optionId) => {
    if (selectedOption !== null || isAutoAdvancing) return;
    
    setSelectedOption(optionId);
    const currentQuestion = questions[currentQuestionIndex];
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
    };
    
    setUserAnswers(prev => [...prev, userAnswer]);

    // Record response for backend
    if (quizSession && !isOffline) {
      setQuizResponses(prev => [...prev, {
        session_id: quizSession.id,
        question_id: currentQuestion.id,
        selected_option_id: optionId,
        is_correct: isCorrect,
        response_order: currentQuestionIndex + 1,
        time_spent_seconds: 0
      }]);

      setUserQuestionHistoryUpdates(prev => [...prev, {
        user_id: user.id,
        question_id: currentQuestion.id,
        last_answered_correctly: isCorrect,
        last_seen_at: new Date().toISOString()
      }]);
    }

    // Auto-advance after 0.5s delay
    setIsAutoAdvancing(true);
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsAutoAdvancing(false);
        setTimeLeft(60);
        setTimerKey(prev => prev + 1);
      } else {
        completeQuiz();
      }
    }, 500);
  };

  const completeQuiz = async () => {
    setQuizCompleted(true);
    
    // Calculate final score from userAnswers for accuracy
    // Include the current question if it was answered
    let allAnswers = [...userAnswers];
    if (selectedOption !== null && !userAnswers.find(a => a.questionIndex === currentQuestionIndex)) {
      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = selectedOption === currentQuestion.correct_option_id;
      allAnswers.push({
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        selectedOptionId: selectedOption,
        isCorrect,
      });
    }
    
    const finalScore = allAnswers.filter(answer => answer.isCorrect).length;
    setScore(finalScore);
    setUserAnswers(allAnswers);
    
    try {
      if (quizSession && !isOffline) {
        await completeSessionMutation.mutateAsync({
          sessionId: quizSession.id,
          userId: user.id,
          finalScore: finalScore,
        });
        
        if (quizResponses.length > 0) {
          await recordQuizResponsesBatch.mutateAsync(quizResponses);
        }
        
        if (userQuestionHistoryUpdates.length > 0) {
          await updateUserQuestionHistoryBatch.mutateAsync(userQuestionHistoryUpdates);
        }
      }
    } catch (err) {
      console.error('Error completing quiz:', err);
    }

    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setUserAnswers([]);
    setQuizCompleted(false);
    setShowResults(false);
    setIsAutoAdvancing(false);
    setQuizResponses([]);
    setUserQuestionHistoryUpdates([]);
    setQuizSession(null);
    setTimeLeft(60);
    setTimerKey(prev => prev + 1);
  };

  const goHome = () => {
    navigate('/');
  };

  // Loading state
  if (questionsLoading) {
    return <QuizLoading />;
  }

  // Error state
  if (hasQuestionsError && questions.length === 0) {
    return <QuizError error={questionsError} onRetry={() => window.location.reload()} />;
  }

  // Results screen
  if (showResults) {
    const accuracy = Math.round((score / questionCount) * 100);
    const getPerformanceData = () => {
      if (accuracy >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100', message: 'Excellent!' };
      if (accuracy >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100', message: 'Good job!' };
      if (accuracy >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100', message: 'Not bad!' };
      return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-100', message: 'Keep practicing!' };
    };

    const performance = getPerformanceData();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <Confetti trigger={accuracy >= 80} duration={4000} />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Results Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-4 ${
                  accuracy >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-purple-600'
                }`}
              >
                {accuracy >= 80 ? (
                  <Trophy className="w-8 h-8" />
                ) : (
                  <Zap className="w-8 h-8" />
                )}
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {accuracy >= 80 ? '🎉 Outstanding! 🎉' : 'Quick Quiz Complete!'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {accuracy >= 80 ? 'You absolutely crushed it!' : performance.message}
              </p>
              {accuracy >= 80 && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-purple-600 dark:text-purple-400 mt-2"
                >
                  🌟 You're ready for the real thing! 🌟
                </motion.p>
              )}
            </div>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`${performance.bgColor} rounded-2xl p-4 sm:p-8 mb-8 text-center`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-4 sm:space-y-0">
                <div className="text-center">
                  <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
                    {score}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    out of {questionCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
                    {accuracy}%
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    accuracy
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
                    {performance.grade}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    grade
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white">
                  {score >= 8 ? 'Quiz Master!' : score >= 6 ? 'Good Work!' : 'Keep Going!'}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white">
                  {accuracy >= 80 ? 'Sharpshooter' : accuracy >= 60 ? 'On Target' : 'Practice Makes Perfect'}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white">
                  Quick & Focused
                </div>
              </div>
            </motion.div>

            {/* Detailed Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Detailed Review
              </h2>
              
              <div className="space-y-6">
                {userAnswers.map((answer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        answer.isCorrect 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : answer.timedOut
                          ? 'bg-orange-100 dark:bg-orange-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : answer.timedOut ? (
                          <Clock className="w-5 h-5 text-orange-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Question {index + 1}
                          </h3>
                          {answer.timedOut && (
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                              Time ran out
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {answer.question.question_text}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          {answer.question.options.map((option) => {
                            const isSelected = option.id === answer.selectedOptionId;
                            const isCorrect = option.id === answer.question.correct_option_id;
                            
                            return (
                              <div
                                key={option.id}
                                className={`p-3 rounded-lg border-2 ${
                                  isSelected && isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : isSelected && !isCorrect
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : isCorrect
                                    ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                  <span className="text-gray-900 dark:text-white">
                                    {option.text}
                                  </span>
                                  <div className="flex space-x-2">
                                    {isSelected && (
                                      <span className="text-xs sm:text-sm font-medium text-blue-600">
                                        Your Answer
                                      </span>
                                    )}
                                    {isCorrect && (
                                      <span className="text-xs sm:text-sm font-medium text-green-600">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {answer.question.explanation && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                              Explanation
                            </h4>
                            <p className="text-blue-800 dark:text-blue-200">
                              {answer.question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={restartQuiz}
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={goHome}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <span>Back to Home</span>
              </button>
              
              {accuracy >= 80 && (
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'USMLE Quick Quiz Results',
                        text: `Just scored ${score}/${questionCount} (${accuracy}%) on a USMLE Quick Quiz! 🎉`,
                        url: window.location.origin
                      });
                    } else {
                      // Fallback to clipboard
                      navigator.clipboard.writeText(`Just scored ${score}/${questionCount} (${accuracy}%) on a USMLE Quick Quiz! 🎉 Check it out at ${window.location.origin}`);
                      alert('Results copied to clipboard!');
                    }
                  }}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  <Star className="w-5 h-5" />
                  <span>Share Success!</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz interface
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer at the top */}
          <motion.div
            key={timerKey}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <div className={`
              relative inline-flex items-center justify-center p-6 rounded-full
              ${timeLeft <= 10 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-white dark:bg-gray-800'}
              shadow-lg transition-all duration-300
            `}>
              {/* Circular progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={timeLeft <= 10 ? "#ef4444" : "#8b5cf6"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(timeLeft / 60) * 283} 283`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              
              {/* Timer display */}
              <div className="relative z-10 text-center">
                <div className={`text-3xl font-bold tabular-nums ${
                  timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-800 dark:text-white'
                }`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {timeLeft <= 10 ? 'Hurry!' : 'Time Left'}
                </div>
              </div>
              
              {/* Clock icon */}
              <Clock className={`absolute top-2 right-2 w-4 h-4 ${
                timeLeft <= 10 ? 'text-red-500' : 'text-purple-500'
              }`} />
            </div>
          </motion.div>

          {/* Quiz Header */}
          <QuizHeader 
            title={categoryName}
            subtitle={`Question ${currentQuestionIndex + 1} of ${questionCount}`}
            onExit={goHome}
            showTimer={false}
          />

          {/* Progress Bar */}
          <QuizProgressBar 
            current={currentQuestionIndex + 1}
            total={questionCount}
            progress={progress}
          />

          {/* Question Card with improved styling */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <QuestionCard
                  currentQuestion={currentQuestion}
                  selectedOption={selectedOption}
                  handleOptionSelect={handleOptionSelect}
                  showExplanations={false}
                  isAnswered={selectedOption !== null}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Auto-advancing indicator */}
          {isAutoAdvancing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-6 py-3 shadow-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5"
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">
                  {currentQuestionIndex < questions.length - 1 ? 'Next question...' : 'Calculating results...'}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickQuiz; 