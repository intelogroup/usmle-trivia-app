import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuickQuiz } from '../hooks/useQuickQuiz';
import { useQuizSounds } from '../hooks/useQuizSounds';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizTimer from '../components/quiz/QuizTimer';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuizResults from '../components/quiz/QuizResults';
import QuizLoading from '../components/quiz/QuizLoading';
import QuizError from '../components/quiz/QuizError';

const QuickQuiz = () => {
  const { state: config } = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Don't start quiz if auth is still loading or user is not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  const {
    questions,
    currentIndex,
    currentQuestion,
    userAnswers,
    isAnswered,
    selectedOption,
    timedOut,
    loading,
    error,
    isComplete,
    timeLeft,
    handleOptionSelect,
    quizSession
  } = useQuickQuiz({
    userId: user.id, // Now guaranteed to be non-null
    categoryId: config?.categoryId || 'mixed',
    questionCount: config?.questionCount || 10,
    difficulty: config?.difficulty || null,
    timePerQuestion: 60
  });

  const [isMuted, setIsMuted] = React.useState(() => {
    return localStorage.getItem('quizMuted') === 'true';
  });
  const toggleMute = () => {
    setIsMuted(m => {
      localStorage.setItem('quizMuted', !m);
      return !m;
    });
  };
  const { playCorrect, playWrong, playTimesUp, playNext, playComplete } = useQuizSounds(isMuted);

  // Play sound effects on answer, timeout, next, complete
  React.useEffect(() => {
    if (isAnswered && !timedOut) {
      if (selectedOption === currentQuestion?.correct_option_id) playCorrect();
      else playWrong();
    }
    if (timedOut) playTimesUp();
  }, [isAnswered, timedOut, selectedOption, currentQuestion, playCorrect, playWrong, playTimesUp]);

  React.useEffect(() => {
    if (isComplete) playComplete();
  }, [isComplete, playComplete]);

  const isLastQuestion = currentIndex === questions.length - 1;

  // Navigation handlers
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');
  const handleRestart = () => {
    navigate('/quick-quiz', { state: config, replace: true });
    window.location.reload();
  };

  // Results
  const score = userAnswers.filter(answer => answer.isCorrect).length;
  const accuracy = Math.round((score / Math.max(1, userAnswers.length)) * 100);
  const totalTimeSpent = userAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);

  if (loading) return <QuizLoading message="" />;
  if (error && questions.length === 0) return <QuizError error={error} onRetry={() => window.location.reload()} onGoBack={handleGoBack} />;
  if (questions.length === 0) return <QuizError error={{ code: 'NO_QUESTIONS', message: 'No questions available.' }} onRetry={() => window.location.reload()} onGoBack={handleGoBack} />;
  if (isComplete) return (
    <QuizResults
      score={score}
      questionCount={questions.length}
      accuracy={accuracy}
      userAnswers={userAnswers}
      quizSession={quizSession}
      quizConfig={{ ...config, quizMode: 'quick' }}
      timeSpent={totalTimeSpent}
      onRestart={handleRestart}
      onGoHome={handleGoHome}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      {/* Minimal Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={handleGoBack} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Quiz</h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2 rounded" title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={handleGoHome} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded">
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Timer and Progress */}
      <div className="container mx-auto px-4 pt-8 pb-2 flex flex-col items-center">
        <QuizTimer
          timeLeft={timeLeft}
          formatTime={s => `${s}s`}
          isLowTime={timeLeft <= 15}
          progressPercentage={(timeLeft / 60) * 100}
          timerKey={currentIndex}
          initialTime={60}
          showProgressBar={false}
          size="small"
        />
        <QuizProgressBar
          current={currentIndex + 1}
          total={questions.length}
          progress={(currentIndex + 1) / questions.length}
          showDetailed={false}
          size="small"
        />
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionCard
                key={currentQuestion.id}
                currentQuestion={currentQuestion}
                isAnswered={isAnswered}
                selectedOption={selectedOption}
                handleOptionSelect={handleOptionSelect}
                showExplanations={false}
                timedOut={timedOut}
                secondsLeft={timeLeft}
              />
            </motion.div>
          ) : (
            !loading && (
              <div className="text-center text-gray-600 dark:text-gray-400 py-10">
                <p>No question available to display. Please try again or select a different category.</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuickQuiz;
