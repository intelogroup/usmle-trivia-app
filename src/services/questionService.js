/**
 * Question Service - Backward Compatibility Layer
 * This file maintains backward compatibility while delegating to modular services
 * 
 * Note: This file has been refactored into smaller modules under /questions/
 * New code should import directly from the modular services for better organization
 */

// Re-export all functions from modular services
export {
  // Question Fetching
  fetchQuestions,
  fetchQuestionsForUser,
  shuffleArray,
  
  // Session Management
  createQuizSession,
  completeQuizSession,
  
  // Response Recording
  recordQuizResponse,
  recordQuestionInteraction,
  updateUserQuestionHistory,

} from './questions/index';