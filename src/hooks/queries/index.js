/**
 * Query Hooks - Central Export Point
 * Re-exports all query hooks for easy importing and backward compatibility
 */

// Query Keys
export { queryKeys } from './queryKeys';

// User-related hooks
export {
  useUserActivityQuery,
  useUserStatsQuery,
  useRecentActivityQuery
} from './useUserQueries';

// Category-related hooks
export {
  useCategoriesQuery,
  useCategoriesOnlyQuery
} from './useCategoryQueries';

// Question-related hooks
export {
  useQuestionsQuery,
  useQuizSessionQuery,
  useSmartQuestionsQuery
} from './useQuestionQueries';