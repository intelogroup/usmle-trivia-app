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
import { Timer, CheckCircle, XCircle, Star, Trophy, Target, Clock, RotateCcw, ChevronRight, BookOpen } from 'lucide-react';

const TimedTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get settings from navigation state or use defaults
  const {
    difficulty = null, // User can choose difficulty
  } = location.state || {};

  // Fixed settings for Timed Test
  const categoryId = 'mixed'; // Random questions from all categories
  const categoryName = 'Timed Test';
  const questionCount = 20;
  const totalTimeInSeconds = 1800; // 30 minutes total
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizSession, setQuizSession] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(totalTimeInSeconds);
  const [showExplanation, setShowExplanation] = useState(false);

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

  // Total timer effect
  useEffect(() => {
    if (showResults) return;

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults]);

  // Check if time is up
  useEffect(() => {
    if (totalTimeLeft === 0 && !showResults) {
      completeQuiz();
    }
  }, [totalTimeLeft, showResults]);

  const handleOptionSelect = (optionId) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    const currentQuestion = questions[currentQuestionIndex];
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
      timeSpent: Math.round((totalTimeInSeconds - totalTimeLeft) / questionCount), // Approximate time per question
    };
    
    setUserAnswers(prev => [...prev, userAnswer]);

    // Record response for backend
    if (quizSession && !isOffline) {
      setQuizResponses(prev => [...prev, {
        session_id: quizSession.id,
        question_id: currentQuestion.id,
        selected_option_id: selectedOption,
        is_correct: isCorrect,
        response_order: currentQuestionIndex + 1,
        time_spent_seconds: userAnswer.timeSpent
      }]);

      setUserQuestionHistoryUpdates(prev => [...prev, {
        user_id: user.id,
        question_id: currentQuestion.id,
        last_answered_correctly: isCorrect,
        last_seen_at: new Date().toISOString()
      }]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setShowResults(true);
    
    try {
      if (quizSession && !isOffline) {
        await completeSessionMutation.mutateAsync({
          sessionId: quizSession.id,
          userId: user.id,
          finalScore: score,
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
    const timeTaken = totalTimeInSeconds - totalTimeLeft;
    const avgTimePerQuestion = Math.round(timeTaken / questionCount);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
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
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4"
              >
                <Timer className="w-8 h-8" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Timed Test Complete!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Time taken: {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
              </p>
            </div>

            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">{score}/{questionCount}</div>
                <div className="text-gray-600 dark:text-gray-300">Questions Correct</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">{accuracy}%</div>
                <div className="text-gray-600 dark:text-gray-300">Accuracy</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
              >
                <div className="text-4xl font-bold text-green-600 mb-2">{avgTimePerQuestion}s</div>
                <div className="text-gray-600 dark:text-gray-300">Avg Time/Question</div>
              </motion.div>
            </div>

            {/* Performance Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Questions Answered</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{userAnswers.length}/{questionCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Time Remaining</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Difficulty</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{difficulty || 'Mixed'}</span>
                </div>
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
                onClick={goHome}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <span>Back to Home</span>
              </button>
              
              <button
                onClick={() => navigate('/results', {
                  state: {
                    score,
                    totalQuestions: questionCount,
                    questions: questions,
                    quizResponses: userAnswers,
                    quizType: 'timed-test',
                    sessionId: quizSession?.id,
                    isOffline,
                  }
                })}
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>View Detailed Review</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz interface
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionCount) * 100;
  const avgTimePerQuestion = 90; // 1.5 minutes
  const timeForThisQuestion = avgTimePerQuestion - Math.round((totalTimeInSeconds - totalTimeLeft) / (currentQuestionIndex + 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer at the top */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <Timer className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500">Total Time Remaining</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {questionCount}
              </div>
              <div className="text-xs text-gray-500">
                ~{timeForThisQuestion > 0 ? timeForThisQuestion : 0}s for this question
              </div>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <QuizProgressBar 
            current={currentQuestionIndex + 1}
            total={questionCount}
            progress={progress}
          />

          {/* Question Card */}
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
                  showExplanations={showExplanation}
                  isAnswered={isAnswered}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-center"
          >
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`
                  flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all
                  ${selectedOption !== null
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Submit Answer</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TimedTest;
