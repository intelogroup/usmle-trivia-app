import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useQuestions,
  useCacheManager
} from '../hooks/useQuestionQueries';

// Import custom hooks
import { useTimedTestState } from '../hooks/useTimedTestState';
import { useTimedTestTimer } from '../hooks/useTimedTestTimer';
import { useQuizSession } from '../hooks/useQuizSession';

// Import quiz components
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizLoading from '../components/quiz/QuizLoading';
import QuizError from '../components/quiz/QuizError';
import TimedTestTimer from '../components/quiz/TimedTestTimer';
import TimedTestResults from '../components/quiz/TimedTestResults';

// Import icons
import { CheckCircle, ChevronRight } from 'lucide-react';

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

  const { getOfflineData } = useCacheManager();

  // Fetch questions
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

  // Timed test state management
  const {
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
    handleOptionSelect,
    submitAnswer,
    nextQuestion,
    completeTest,
    resetTest,
  } = useTimedTestState(questions, questionCount);

  // Quiz session management
  const {
    quizSession,
    createSession,
    recordResponse,
    completeSession,
    resetSession,
  } = useQuizSession(user, categoryId, questionCount, isOffline);

  // Timer management
  const {
    totalTimeLeft,
    timeTaken,
    formatTime,
    getAvgTimePerQuestion,
    getEstimatedTimeForQuestion,
    isLowTime,
    isCriticalTime,
    timeLeftPercentage,
  } = useTimedTestTimer({
    totalTimeInSeconds,
    isActive: !showResults,
    onTimeUp: () => {
      handleCompleteTest();
    }
  });

  // Create session when questions are loaded
  useEffect(() => {
    if (user && questions.length > 0 && !quizSession) {
      createSession();
    }
  }, [user, questions.length, quizSession, createSession]);

  // Handle submit answer with session recording
  const handleSubmitAnswer = () => {
    const timeSpent = Math.round((totalTimeInSeconds - totalTimeLeft) / questionCount);
    const result = submitAnswer(timeSpent);
    
    if (result && quizSession && !isOffline) {
      recordResponse({
        questionId: currentQuestion.id,
        selectedOptionId: result.userAnswer.selectedOptionId,
        isCorrect: result.isCorrect,
        responseOrder: currentQuestionIndex + 1,
        timeSpent: timeSpent
      });
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    const isFinished = nextQuestion();
    if (isFinished) {
      handleCompleteTest();
    }
  };

  // Complete the test
  const handleCompleteTest = async () => {
    const result = completeTest();
    if (result && quizSession && !isOffline) {
      await completeSession(result.finalScore);
    }
  };

  // Navigate home
  const handleGoHome = () => {
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
    return (
      <TimedTestResults
        score={score}
        questionCount={questionCount}
        accuracy={accuracy}
        userAnswers={userAnswers}
        timeTaken={timeTaken}
        totalTimeLeft={totalTimeLeft}
        difficulty={difficulty}
        quizSession={quizSession}
        isOffline={isOffline}
        questions={questions}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer */}
          <TimedTestTimer
            totalTimeLeft={totalTimeLeft}
            formatTime={formatTime}
            isLowTime={isLowTime}
            isCriticalTime={isCriticalTime}
            currentQuestionIndex={currentQuestionIndex}
            questionCount={questionCount}
            getEstimatedTimeForQuestion={getEstimatedTimeForQuestion}
          />

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
                  question={currentQuestion}
                  selectedOption={selectedOption}
                  onOptionSelect={handleOptionSelect}
                  showFeedback={isAnswered}
                  showExplanation={showExplanation}
                  isAutoAdvancing={false}
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
                disabled={!canSubmit}
                className={`
                  flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all
                  ${canSubmit
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
