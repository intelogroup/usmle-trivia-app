/**
 * Questions Service - Central Entry Point
 * Re-exports all question-related services for backward compatibility
 */

// Question Fetching Service
export {
  fetchQuestions,
  fetchQuestionsForUser,
  fetchBlockQuestions,
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

// Block Test Service
export {
  createBlockTestSession,
  recordBlockResponse,
  pauseBlockSession,
  resumeBlockSession,
  completeBlockTestSession
} from './blockTestService';