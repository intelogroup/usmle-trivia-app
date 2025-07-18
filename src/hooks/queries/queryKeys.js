/**
 * Query Keys for React Query
 * Centralized query key definitions for consistent caching
 */

export const queryKeys = {
  userActivity: (userId) => ['userActivity', userId],
  userStats: (userId) => ['userStats', userId],
  userPoints: (userId) => ['userPoints', userId],
  recentActivity: (userId) => ['recentActivity', userId],
  categories: () => ['categories'],
  categoriesWithProgress: (userId) => ['categories', 'withProgress', userId],
  userProgress: (userId) => ['userProgress', userId],
  questions: (categoryId, count) => ['questions', categoryId, count],
  quizSession: (sessionId) => ['quizSession', sessionId],
  
  // Analytics queries
  categoryProgress: (userId) => ['categoryProgress', userId],
  performanceMetrics: (userId) => ['performanceMetrics', userId],
  weeklyProgress: (userId) => ['weeklyProgress', userId],
  
  // Leaderboard queries
  leaderboard: (period) => ['leaderboard', period],
  userRank: (userId) => ['userRank', userId],
  
  // Feedback queries
  feedbackStats: () => ['feedbackStats'],
  userFeedbackHistory: (userId) => ['userFeedbackHistory', userId]
};