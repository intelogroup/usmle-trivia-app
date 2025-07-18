/**
 * Optimized Queries - Backward Compatibility Layer
 * This file maintains backward compatibility while delegating to modular query hooks
 * 
 * Note: This file has been refactored into smaller modules under /queries/
 * New code should import directly from the modular hooks for better organization
 */

// Re-export all hooks from modular structure
export {
  // Query Keys
  queryKeys,
  
  // User-related hooks
  useUserActivityQuery,
  useUserStatsQuery,
  useRecentActivityQuery,
  
  // Category-related hooks
  useCategoriesQuery,
  useCategoriesOnlyQuery,
  
  // Question-related hooks
  useQuestionsQuery,
  useQuizSessionQuery,
  useSmartQuestionsQuery
} from './queries/index';