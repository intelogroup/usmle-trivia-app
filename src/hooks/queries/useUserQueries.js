import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { queryKeys } from './queryKeys';
import { getTimeAgo } from '../../utils/queryUtils';
import { withUserDataTimeout, withBackgroundTimeout } from '../../utils/queryTimeout';

/**
 * User-related React Query hooks
 * Handles user activity, stats, and progress data
 */

/**
 * Optimized hook for fetching user activity and stats
 * Uses React Query for caching and background updates
 */
export const useUserActivityQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.userActivity(userId),
    queryFn: async () => {
      if (!userId) {
        return {
          isNewUser: true,
          userStats: {
            totalQuestions: 0,
            accuracy: 0,
            studyTime: 0,
            currentStreak: 0
          },
          recentActivity: []
        };
      }

      return withUserDataTimeout(async () => {
        try {
          // Check if user has any quiz history
          const { data: quizHistory, error: historyError } = await supabase
            .from('user_question_history')
            .select('*')
            .eq('user_id', userId)
            .limit(1);

          if (historyError) throw historyError;

          const hasActivity = quizHistory && quizHistory.length > 0;
          const isNewUser = !hasActivity;

          let userStats = {
            totalQuestions: 0,
            accuracy: 0,
            studyTime: 0,
            currentStreak: 0
          };
          let recentActivity = [];

          if (hasActivity) {
            // Fetch user stats using RPC function
            const { data: statsData, error: statsError } = await supabase
              .rpc('get_user_stats', { p_user_id: userId });

            if (!statsError && statsData && statsData.length > 0) {
              const stats = statsData[0];
              userStats = {
                totalQuestions: stats.total_questions_attempted || 0,
                accuracy: stats.accuracy_percentage || 0,
                studyTime: Math.round((stats.total_questions_attempted * 2) / 60 * 10) / 10 || 0,
                currentStreak: 0 // Would need streak calculation
              };
            }

            // Fetch recent activity - simplified query without complex joins
            const { data: sessions, error: sessionsError } = await supabase
              .from('quiz_sessions')
              .select('id, session_type, total_questions, correct_answers, started_at, completed_at')
              .eq('user_id', userId)
              .order('started_at', { ascending: false })
              .limit(5);

            if (!sessionsError && sessions) {
                recentActivity = sessions.map(session => {
                  // Simplified activity data without complex category lookup
                  return {
                    id: session.id,
                    type: session.session_type || 'Quiz',
                    score: session.correct_answers || 0,
                    total: session.total_questions || 0,
                    timeAgo: getTimeAgo(session.started_at),
                    categories: ['General'] // Simplified - could be enhanced later with separate query
                  };
                });
              }
            }

          return {
            isNewUser,
            userStats,
            recentActivity
          };
        } catch (error) {
          logger.error('Error in useUserActivityQuery', { error: error.message, userId });
          throw error;
        }
      }, {
        queryType: `user-activity-${userId}`,
        fallback: {
          isNewUser: true,
          userStats: { totalQuestions: 0, accuracy: 0, studyTime: 0, currentStreak: 0 },
          recentActivity: []
        }
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes  
    enabled: !!userId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

/**
 * Hook for fetching comprehensive user statistics
 */
export const useUserStatsQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.userStats(userId),
    queryFn: async () => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase.rpc('get_user_stats', {
          p_user_id: userId
        });

        if (error) {
          logger.warn('RPC get_user_stats failed', { error, userId });
          return null;
        }

        return data?.[0] || null;
      } catch (error) {
        logger.error('Error in useUserStatsQuery', { error: error.message, userId });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!userId,
    retry: 1
  });
};

/**
 * Hook for fetching user's recent quiz sessions
 */
export const useRecentActivityQuery = (userId, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.recentActivity(userId),
    queryFn: async () => {
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .select(`
            id,
            session_type,
            total_questions,
            correct_answers,
            started_at,
            completed_at,
            total_time_seconds
          `)
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(limit);

        if (error) {
          logger.error('Error fetching recent activity', { error, userId });
          throw error;
        }

        return data || [];
      } catch (error) {
        logger.error('Error in useRecentActivityQuery', { error: error.message, userId });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
    retry: 2
  });
};