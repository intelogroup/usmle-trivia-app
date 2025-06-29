import React, { useEffect, useState } from 'react';
import QuizLoading from './QuizLoading';
import QuizError from './QuizError';
import QuizResults from './QuizResults';
import QuestionCard from './QuestionCard';
import QuizLayout from './QuizLayout';

/**
 * Component that renders appropriate UI based on quiz state
 * Centralizes state-based rendering logic
 */
const QuizStateRenderer = ({
  // Quiz controller data
  quizStatus,
  config,
  currentQuestion,
  currentQuestionIndex,
  selectedOption,
  score,
  accuracy,
  progress,
  userAnswers,
  isOffline,
  error,
  
  // Timer data
  timeLeft,
  formatTime,
  isLowTime,
  progressPercentage,
  timerKey,
  
  // Handlers
  handleOptionSelect,
  handleRestart,
  refetchQuestions,
  
  // Navigation
  navigation
}) => {
  // Accessibility: ARIA live region message
  const [liveMessage, setLiveMessage] = useState('');

  // Update live region on question change or timer expiration
  useEffect(() => {
    if (timeLeft === 0 && selectedOption === null) {
      setLiveMessage("Time's up! Moving to next question.");
    } else if (currentQuestionIndex !== undefined && config?.questionCount) {
      setLiveMessage(`Question ${currentQuestionIndex + 1} of ${config.questionCount}`);
    }
  }, [timeLeft, selectedOption, currentQuestionIndex, config?.questionCount]);

  // Loading state
  if (quizStatus === 'loading') {
    return (
      <QuizLoading 
        loadingText="Preparing your quiz..."
        subText={`Fetching ${config.questionCount} questions from ${config.categoryName || 'mixed categories'}`}
        showProgress={true}
        estimatedTime="2-3 seconds"
      />
    );
  }

  // Error state
  if (quizStatus === 'error') {
    return (
      <QuizError 
        error={error} 
        onRetry={refetchQuestions}
        onGoHome={navigation.goHome}
        categoryId={config.categoryId}
        questionCount={config.questionCount}
        showOfflineOption={isOffline}
        config={config}
      />
    );
  }

  // No questions state
  if (quizStatus === 'no-questions') {
    return (
      <QuizError 
        error={{ 
          message: 'No questions found',
          details: `No questions available for ${config.categoryName} with the selected difficulty level.`
        }}
        onRetry={refetchQuestions}
        onGoHome={navigation.goHome}
        categoryId={config.categoryId}
        questionCount={config.questionCount}
        suggestions={[
          'Try selecting a different category',
          'Change the difficulty level',
          'Use mixed categories for more options'
        ]}
      />
    );
  }

  // Results state
  if (quizStatus === 'results') {
    return (
      <QuizResults
        score={score}
        questionCount={config.questionCount}
        accuracy={accuracy}
        userAnswers={userAnswers}
        quizConfig={config}
        timeSpent={userAnswers.reduce((total, answer) => total + (answer.timeSpent || 0), 0)}
        onRestart={handleRestart}
        onGoHome={navigation.goHome}
        onShareResults={navigation.shareResults}
        navigation={navigation}
      />
    );
  }

  // Active quiz state
  if (quizStatus === 'active' && currentQuestion) {
    return (
      <QuizLayout
        config={config}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={config.questionCount}
        score={score}
        accuracy={accuracy}
        progress={progress}
        timeLeft={timeLeft}
        isOffline={isOffline}
        isFetching={false}
        userAnswers={userAnswers}
        formatTime={formatTime}
        isLowTime={isLowTime}
        progressPercentage={progressPercentage}
        timerKey={timerKey}
        variant={config.quizMode === 'quick' ? 'default' : 'compact'}
        liveMessage={liveMessage}
      >
        <QuestionCard
          currentQuestion={currentQuestion}
          selectedOption={selectedOption}
          isAnswered={selectedOption !== null}
          handleOptionSelect={handleOptionSelect}
          showExplanations={config.showExplanations}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={config.questionCount}
          timeSpent={config.timePerQuestion ? (config.timePerQuestion - timeLeft) : 0}
          difficulty={config.difficulty || 'medium'}
          quizMode={config.quizMode}
          timedOut={timeLeft === 0 && selectedOption === null}
        />
      </QuizLayout>
    );
  }

  // Fallback state
  return (
    <QuizError 
      error={{ 
        message: 'Unknown quiz state',
        details: `Quiz is in an unexpected state: ${quizStatus}`
      }}
      onRetry={refetchQuestions}
      onGoHome={navigation.goHome}
    />
  );
};

export default QuizStateRenderer; 