/**
 * Query Keys for React Query
 * Centralized query key definitions for consistent caching
 */

export const queryKeys = {
  userActivity: (userId) => ['userActivity', userId],
  userStats: (userId) => ['userStats', userId],
  recentActivity: (userId) => ['recentActivity', userId],
  categories: () => ['categories'],
  categoriesWithProgress: (userId) => ['categories', 'withProgress', userId],
  userProgress: (userId) => ['userProgress', userId],
  questions: (categoryId, count) => ['questions', categoryId, count],
  quizSession: (sessionId) => ['quizSession', sessionId]
};