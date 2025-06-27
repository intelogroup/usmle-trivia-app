import { Suspense, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useQuestions,
  useCacheManager
} from '../hooks/useQuestionQueries';
import { useEnhancedQuestions, useQuestionPerformance } from '../hooks/useEnhancedQuestionQueries';
import { QuestionService } from '../services/questionService';
import { EnhancedQuestionService } from '../services/enhancedQuestionService';

// Import custom hooks
import { useQuizState } from '../hooks/useQuizState';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { useEnhancedQuizSession } from '../hooks/useEnhancedQuizSession';

// Import quiz components
import QuizHeader from '../components/quiz/QuizHeader';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizLoading from '../components/quiz/QuizLoading';
import EnhancedQuizLoading from '../components/quiz/EnhancedQuizLoading';
import QuizError from '../components/quiz/QuizError';
import QuizTimer from '../components/quiz/QuizTimer';
import QuizResults from '../components/quiz/QuizResults';

const QuickQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  
  // Enhanced quiz configuration from state or defaults
  const quizConfig = useMemo(() => {
    const stateConfig = location.state || {};
    const defaultConfig = EnhancedQuestionService.getQuizModeConfig(stateConfig.quizMode || 'quick');
    
    return {
      categoryId: params.categoryId || stateConfig.categoryId || 'mixed',
      questionCount: stateConfig.questionCount || defaultConfig.questionCount,
      difficulty: stateConfig.difficulty || null,
      quizMode: stateConfig.quizMode || 'quick',
      quizType: stateConfig.quizType || 'quick',
      autoAdvance: stateConfig.autoAdvance !== undefined ? stateConfig.autoAdvance : defaultConfig.autoAdvance,
      timePerQuestion: stateConfig.timePerQuestion || defaultConfig.timePerQuestion,
      showExplanations: stateConfig.showExplanations || defaultConfig.showExplanations
    };
  }, [location.state, params.categoryId]);

  const { categoryId, questionCount, difficulty, quizMode, quizType, autoAdvance, timePerQuestion, showExplanations } = quizConfig;

  const { getOfflineData } = useCacheManager();

  // Enhanced questions query using the new service
  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuery({
    queryKey: ['questions', categoryId, questionCount, difficulty],
    queryFn: () => EnhancedQuestionService.getQuestionsForQuiz({
      categoryId: categoryId,
      questionCount: questionCount,
      difficulty: difficulty,
      quizMode: quizMode
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Performance monitoring
  const { metrics: performanceStats } = useQuestionPerformance();

  const isOffline = useMemo(() => {
    return questionsError && questions.length > 0;
  }, [questionsError, questions.length]);

  // Quiz state management
  const {
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
    handleOptionSelect,
    handleTimeout,
    advanceQuestion,
    completeQuiz,
    resetQuiz,
  } = useQuizState(questions, questionCount);

  // Enhanced quiz session management
  const {
    session: quizSession,
    recordResponse,
    completeSession,
    resetSession,
    isCreating: sessionCreating,
    isCompleting: sessionCompleting,
  } = useEnhancedQuizSession(user, quizConfig, isOffline);

  // Timer management
  const {
    timeLeft,
    timerKey,
    formatTime,
    resetTimer,
    isLowTime,
    progressPercentage,
  } = useQuizTimer({
    initialTime: 60,
    isActive: !showResults && !quizCompleted && !!currentQuestion,
    onTimeUp: () => {
      const result = handleTimeout();
      if (result) {
        recordResponse({
          questionId: currentQuestion.id,
          selectedOptionId: null,
          isCorrect: false,
          responseOrder: currentQuestionIndex + 1,
          timeSpent: 60
        });
      }
      advanceQuestion();
    },
    resetTrigger: currentQuestionIndex
  });

  // Create session when questions are loaded
  useEffect(() => {
    if (user && questions.length > 0 && !quizSession) {
      createSession();
    }
  }, [user, questions.length, quizSession, createSession]);

  // Handle option selection with session recording
  const handleOptionSelectWithRecording = (optionId) => {
    const result = handleOptionSelect(optionId);
    if (result) {
      recordResponse({
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        isCorrect: result.isCorrect,
        responseOrder: currentQuestionIndex + 1,
        timeSpent: 60 - timeLeft
      });
      
      // Auto-advance after delay (0.5s as per docs)
      setTimeout(() => {
        advanceQuestion();
      }, 500);
    }
  };

  // Handle quiz completion with session recording
  const handleCompleteQuiz = async () => {
    const result = completeQuiz();
    if (result) {
      await completeSession(result.finalScore);
    }
  };

  // Handle restart
  const handleRestart = () => {
    resetQuiz();
    resetSession();
    resetTimer();
  };

  // Handle navigation
  const handleGoHome = () => {
    navigate('/');
  };

  // Enhanced loading state
  if (questionsLoading) {
    return (
      <EnhancedQuizLoading 
        preloadStatus={preloadStatus}
        cacheStats={cacheStats}
        isPreloading={isPreloading}
        estimatedTime={performanceMetrics?.loadTime ? `${Math.round(performanceMetrics.loadTime / 1000)}s` : null}
        loadingStage="questions"
        showDetailedProgress={true}
      />
    );
  }

  // Enhanced error state with better options
  if (questionsError && questions.length === 0) {
    return (
      <QuizError 
        error={questionsError} 
        onRetry={() => window.location.reload()} 
        categoryId={categoryId}
        questionCount={questionCount}
        getOfflineData={getOfflineData}
        showOfflineOption={true}
      />
    );
  }

  // Fallback to demo questions if no questions loaded but no error
  if (!questionsLoading && !questionsError && questions.length === 0) {
    console.log('No questions loaded, this might indicate a data issue');
  }

  // Results screen
  if (showResults) {
    return (
      <QuizResults
        score={score}
        questionCount={questionCount}
        accuracy={accuracy}
        userAnswers={userAnswers}
        quizSession={quizSession}
        quizConfig={quizConfig}
        timeSpent={userAnswers.reduce((total, answer) => total + (answer.timeSpent || 0), 0)}
        onRestart={handleRestart}
        onGoHome={handleGoHome}
      />
    );
  }

  // Quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer */}
          <QuizTimer
            timeLeft={timeLeft}
            formatTime={formatTime}
            isLowTime={isLowTime}
            progressPercentage={progressPercentage}
            timerKey={timerKey}
          />

          {/* Quiz Header */}
          <QuizHeader 
            categoryName={quizConfig.categoryName || categoryId}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questionCount}
            score={score}
            isOffline={isOffline}
            isFetching={questionsLoading}
            timeLeft={timeLeft}
            isTimed={quizConfig.quizMode === 'timed'}
            quizMode={quizConfig.quizMode}
            quizType={quizConfig.quizType}
          />

          {/* Progress Bar */}
          <QuizProgressBar 
            current={currentQuestionIndex + 1}
            total={questionCount}
            progress={progress}
            score={score}
            accuracy={accuracy}
            averageTime={userAnswers.length > 0 ? userAnswers.reduce((acc, answer) => acc + (answer.timeSpent || 0), 0) / userAnswers.length : 0}
            showDetailed={true}
            size="normal"
          />

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestion && (
                <QuestionCard
                  currentQuestion={currentQuestion}
                  selectedOption={selectedOption}
                  isAnswered={selectedOption !== null}
                  handleOptionSelect={handleOptionSelectWithRecording}
                  showExplanations={true}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questionCount}
                  timeSpent={60 - timeLeft}
                  difficulty={difficulty || 'medium'}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuickQuiz; 