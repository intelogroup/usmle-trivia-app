import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// Quiz mode configuration constants (from QUIZ_MODES_GUIDE.md)
const QUICK_QUIZ_CONFIG = {
  questionCount: 10,
  autoAdvance: true,
  timePerQuestion: 60,
  showExplanations: false,
  allowReview: false
};
const TIMED_TEST_CONFIG = {
  questionCount: 20,
  totalTime: 30 * 60, // 30 minutes in seconds
  autoAdvance: false,
  timePerQuestion: 90,
  showExplanations: true,
  allowReview: false
};

// Helper to get quiz mode config
const getQuizModeConfig = (quizMode) => {
  if (quizMode === 'quick') return QUICK_QUIZ_CONFIG;
  if (quizMode === 'timed') return TIMED_TEST_CONFIG;
  // Add more modes as needed
  return QUICK_QUIZ_CONFIG;
};

/**
 * Hook to manage quiz configuration based on route params and state
 * Centralizes configuration logic for all quiz modes
 */
export const useQuizConfiguration = () => {
  const location = useLocation();
  const params = useParams();

  const quizConfig = useMemo(() => {
    const stateConfig = location.state || {};
    const quizMode = stateConfig.quizMode || 'quick';
    const defaultConfig = getQuizModeConfig(quizMode);
    
    // Set explicit defaults based on quiz mode
    let questionCountDefault = defaultConfig.questionCount;
    let autoAdvanceDefault = defaultConfig.autoAdvance;
    let timePerQuestionDefault = defaultConfig.timePerQuestion;
    let showExplanationsDefault = defaultConfig.showExplanations;
    let allowReviewDefault = defaultConfig.allowReview;
    
    if (quizMode === 'quick') {
      questionCountDefault = 10;
      autoAdvanceDefault = true;
      timePerQuestionDefault = 60;
      showExplanationsDefault = false;
      allowReviewDefault = false;
    } else if (quizMode === 'timed') {
      questionCountDefault = 20;
      autoAdvanceDefault = false;
      timePerQuestionDefault = 90; // Average of 1.5 minutes per question for 20 questions in 30 minutes
      showExplanationsDefault = true;
      allowReviewDefault = false;
    }
    
    return {
      // Core settings
      categoryId: params.categoryId || stateConfig.categoryId || 'mixed',
      questionCount: stateConfig.questionCount || questionCountDefault,
      difficulty: stateConfig.difficulty || null,
      quizMode: quizMode,
      quizType: stateConfig.quizType || quizMode,
      
      // UI settings
      categoryName: stateConfig.categoryName || 'Mixed Questions',
      
      // Behavior settings
      autoAdvance: stateConfig.autoAdvance !== undefined ? stateConfig.autoAdvance : autoAdvanceDefault,
      timePerQuestion: stateConfig.timePerQuestion || timePerQuestionDefault,
      showExplanations: stateConfig.showExplanations !== undefined ? stateConfig.showExplanations : showExplanationsDefault,
      
      // Advanced settings
      shuffleQuestions: stateConfig.shuffleQuestions !== undefined ? stateConfig.shuffleQuestions : true,
      shuffleOptions: stateConfig.shuffleOptions !== undefined ? stateConfig.shuffleOptions : true,
      allowReview: stateConfig.allowReview !== undefined ? stateConfig.allowReview : allowReviewDefault,
      
      // Accessibility
      screenReader: stateConfig.screenReader || false,
      highContrast: stateConfig.highContrast || false,
      
      // Debug
      debugMode: stateConfig.debugMode || false
    };
  }, [location.state, params.categoryId]);

  return {
    config: quizConfig,
    
    // Helper functions
    isQuickQuiz: () => quizConfig.quizMode === 'quick',
    isTimedTest: () => quizConfig.quizMode === 'timed',
    isCustomQuiz: () => quizConfig.quizMode === 'custom',
    isBlockTest: () => quizConfig.quizMode === 'block',
    
    // Configuration validators
    isValid: () => {
      return quizConfig.questionCount > 0 && quizConfig.timePerQuestion > 0;
    },
    
    // Get display-friendly config
    getDisplayConfig: () => ({
      mode: quizConfig.quizMode.charAt(0).toUpperCase() + quizConfig.quizMode.slice(1),
      questions: `${quizConfig.questionCount} questions`,
      time: quizConfig.timePerQuestion ? `${quizConfig.timePerQuestion}s per question` : 'No time limit',
      category: quizConfig.categoryName,
      difficulty: quizConfig.difficulty || 'Mixed'
    })
  };
};
