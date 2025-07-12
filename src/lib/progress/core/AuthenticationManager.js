import { supabase } from '../../supabase';

/**
 * Authentication Manager
 * Handles all authentication and security operations for user progress
 */
export class AuthenticationManager {
  constructor(userId) {
    this.userId = userId;
    this.validateUserId();
  }

  /**
   * Validate user ID against authenticated user
   */
  validateUserId() {
    if (!this.userId) {
      throw new Error('User ID is required');
    }
  }

  /**
   * Verify user authentication before any operation
   */
  async verifyUserAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('User not authenticated');
    }

    if (user.id !== this.userId) {
      throw new Error('Security violation: User ID mismatch');
    }

    return user;
  }

  /**
   * Verify session ownership to prevent unauthorized access
   */
  async verifySessionOwnership(sessionId) {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      throw new Error('Session not found or access denied');
    }

    return data;
  }

  /**
   * Enhanced security audit for testing data isolation
   */
  async performSecurityAudit() {
    await this.verifyUserAuth();

    const auditResults = {
      userId: this.userId,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Verify user can only see their own sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('user_id')
        .eq('user_id', this.userId)
        .limit(5);

      auditResults.tests.sessionIsolation = {
        passed: !sessionsError && sessions.every(s => s.user_id === this.userId),
        error: sessionsError?.message,
        sessionCount: sessions?.length || 0
      };

      // Test 2: Verify user can only see their own responses
      const { data: responses, error: responsesError } = await supabase
        .from('quiz_responses')
        .select(`
          session_id,
          quiz_sessions!inner(user_id)
        `)
        .limit(5);

      auditResults.tests.responseIsolation = {
        passed: !responsesError && responses.every(r => r.quiz_sessions.user_id === this.userId),
        error: responsesError?.message,
        responseCount: responses?.length || 0
      };

      // Test 3: Verify profile access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', this.userId)
        .single();

      auditResults.tests.profileAccess = {
        passed: !profileError && profile?.id === this.userId,
        error: profileError?.message,
        profileFound: !!profile
      };

      auditResults.overallSecurity = Object.values(auditResults.tests).every(test => test.passed);

    } catch (error) {
      auditResults.error = error.message;
      auditResults.overallSecurity = false;
    }

    return auditResults;
  }
}