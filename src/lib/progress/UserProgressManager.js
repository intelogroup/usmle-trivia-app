import { AuthenticationManager } from './core/AuthenticationManager';
import { QuizSessionManager } from './core/QuizSessionManager';
import { StatsManager } from './analytics/StatsManager';
import { LearningManager } from './recommendations/LearningManager';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Main User Progress Manager
 * Orchestrates all progress-related functionality while maintaining backward compatibility
 */
export class UserProgressManager {
  constructor(userId) {
    this.userId = userId;
    
    // Initialize component managers
    this.auth = new AuthenticationManager(userId);
    this.sessions = new QuizSessionManager(userId);
    this.stats = new StatsManager(userId);
    this.learning = new LearningManager(userId);
  }

  // Authentication methods
  async verifyUserAuth() {
    return this.auth.verifyUserAuth();
  }

  async verifySessionOwnership(sessionId) {
    return this.auth.verifySessionOwnership(sessionId);
  }

  async performSecurityAudit() {
    return this.auth.performSecurityAudit();
  }

  // Session management methods
  async createQuizSession(sessionData) {
    return this.sessions.createQuizSession(sessionData);
  }

  async recordQuizResponses(sessionId, responses) {
    return this.sessions.recordQuizResponses(sessionId, responses);
  }

  async completeQuizSession(sessionId, completionData) {
    return this.sessions.completeQuizSession(sessionId, completionData);
  }

  async getRecentSessions(limit = 10) {
    return this.sessions.getRecentSessions(limit);
  }

  // Statistics methods
  async getUserStats() {
    return this.stats.getUserStats();
  }

  async updateUserStats() {
    return this.stats.updateUserStats();
  }

  async getCategoryProgress() {
    return this.stats.getCategoryProgress();
  }

  // Learning recommendation methods
  async getLearningRecommendations() {
    return this.learning.getLearningRecommendations();
  }
}

/**
 * Factory function to create UserProgressManager instances
 */
export function createUserProgressManager(userId) {
  return new UserProgressManager(userId);
}

/**
 * React hook for user progress management
 */
export function useUserProgress() {
  const { user } = useAuth();
  
  if (!user?.id) {
    return null;
  }
  
  return new UserProgressManager(user.id);
}