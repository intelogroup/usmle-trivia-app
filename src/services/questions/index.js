/**
 * Questions Service - Central Entry Point
 * Re-exports all question-related services for backward compatibility
 */

// Question Fetching Service
export {
  fetchQuestions,
  fetchQuestionsForUser,
  shuffleArray
} from './questionFetchService';

// Session Service
export {
  createQuizSession,
  completeQuizSession
} from './sessionService';

// Response Service
export {
  recordQuizResponse,
  recordQuestionInteraction,
  updateUserQuestionHistory
} from './responseService';

