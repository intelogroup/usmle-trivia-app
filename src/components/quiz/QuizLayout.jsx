import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizHeader from './QuizHeader';
import QuizProgressBar from './QuizProgressBar';
import QuizTimer from './QuizTimer';

/**
 * Reusable quiz layout component
 * Provides consistent structure and animations for all quiz types
 */
const QuizLayout = ({
  // Configuration
  config,
  
  // State
  currentQuestionIndex,
  totalQuestions,
  score,
  accuracy,
  progress,
  timeLeft,
  isOffline,
  isFetching,
  userAnswers,
  
  // Timer props
  formatTime,
  isLowTime,
  progressPercentage,
  timerKey,
  
  // Content
  children,
  
  // Options
  showTimer = true,
  showHeader = true,
  showProgress = true,
  className = "",
  
  // Layout variants
  variant = "default", // default, compact, minimal
  
  // Accessibility
  liveMessage = '',
}) => {
  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20";
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} py-4`;
      case 'minimal':
        return `${baseClasses} py-2`;
      default:
        return `${baseClasses} py-8`;
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'compact':
        return "container mx-auto px-2 max-w-3xl";
      case 'minimal':
        return "container mx-auto px-1 max-w-2xl";
      default:
        return "container mx-auto px-4 max-w-4xl";
    }
  };

  const averageTime = userAnswers.length > 0 
    ? userAnswers.reduce((acc, answer) => acc + (answer.timeSpent || 0), 0) / userAnswers.length 
    : 0;

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      <div className={getContainerClasses()}>
        {/* ARIA live region for accessibility */}
        <div role="status" aria-live="polite" style={{ position: 'absolute', left: '-9999px', height: '1px', width: '1px', overflow: 'hidden' }}>
          {liveMessage}
        </div>
        {/* Timer */}
        {showTimer && timeLeft !== undefined && (
          <QuizTimer
            timeLeft={timeLeft}
            formatTime={formatTime}
            isLowTime={isLowTime}
            progressPercentage={progressPercentage}
            timerKey={timerKey}
            variant={variant}
          />
        )}

        {/* Quiz Header */}
        {showHeader && (
          <QuizHeader 
            categoryName={config.categoryName}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            score={score}
            isOffline={isOffline}
            isFetching={isFetching}
            timeLeft={timeLeft}
            isTimed={config.quizMode === 'timed'}
            quizMode={config.quizMode}
            quizType={config.quizType}
            variant={variant}
          />
        )}

        {/* Progress Bar */}
        {showProgress && (
          <QuizProgressBar 
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            progress={progress}
            score={score}
            accuracy={accuracy}
            averageTime={averageTime}
            showDetailed={variant !== 'minimal'}
            size={variant === 'compact' ? 'small' : 'normal'}
          />
        )}

        {/* Main Content Area */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${config.quizMode}-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ 
                duration: variant === 'minimal' ? 0.2 : 0.3,
                ease: "easeInOut"
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuizLayout; 