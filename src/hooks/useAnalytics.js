import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { StatsManager } from '../lib/progress/analytics/StatsManager';
import { queryKeys } from './queries/queryKeys';

/**
 * Hook for comprehensive user analytics data
 * Provides detailed statistics and progress tracking
 */
export const useAnalytics = () => {
  const { user } = useAuth();

  // User statistics query
  const { data: userStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: queryKeys.userStats(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const statsManager = new StatsManager();
        const stats = await statsManager.getUserStats();
        return stats;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Category progress query
  const { data: categoryProgress, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: queryKeys.categoryProgress(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const statsManager = new StatsManager();
        const progress = await statsManager.getCategoryProgress();
        return progress;
      } catch (error) {
        console.error('Error fetching category progress:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Performance metrics query
  const { data: performanceMetrics, isLoading: performanceLoading, error: performanceError } = useQuery({
    queryKey: queryKeys.performanceMetrics(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const statsManager = new StatsManager();
        const stats = await statsManager.getUserStats();
        
        // Calculate performance metrics
        const metrics = {
          accuracy: stats.accuracy_percentage || 0,
          averageSessionTime: stats.average_session_time || 0,
          totalStudyTime: stats.total_study_time_seconds || 0,
          sessionsCompleted: stats.sessions_completed || 0,
          currentStreak: stats.current_streak || 0,
          longestStreak: stats.longest_streak || 0,
          questionsPerSession: stats.sessions_completed > 0 
            ? Math.round((stats.total_questions || 0) / stats.sessions_completed)
            : 0,
          studyTimePerQuestion: stats.total_questions > 0 
            ? Math.round((stats.total_study_time_seconds || 0) / stats.total_questions)
            : 0
        };

        return metrics;
      } catch (error) {
        console.error('Error calculating performance metrics:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Weekly progress query
  const { data: weeklyProgress, isLoading: weeklyLoading, error: weeklyError } = useQuery({
    queryKey: queryKeys.weeklyProgress(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { supabase } = await import('../lib/supabase');
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data, error } = await supabase
          .from('quiz_sessions')
          .select('completed_at, correct_answers, total_questions, total_time_seconds')
          .eq('user_id', user.id)
          .gte('completed_at', oneWeekAgo.toISOString())
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: true });

        if (error) {
          console.error('Error fetching weekly progress:', error);
          return [];
        }

        // Group by day
        const dailyStats = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize with zeros
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = days[date.getDay()];
          dailyStats[dayName] = {
            day: dayName,
            sessions: 0,
            questions: 0,
            correct: 0,
            accuracy: 0,
            studyTime: 0
          };
        }

        // Fill with actual data
        data.forEach(session => {
          const date = new Date(session.completed_at);
          const dayName = days[date.getDay()];
          
          if (dailyStats[dayName]) {
            dailyStats[dayName].sessions++;
            dailyStats[dayName].questions += session.total_questions || 0;
            dailyStats[dayName].correct += session.correct_answers || 0;
            dailyStats[dayName].studyTime += session.total_time_seconds || 0;
          }
        });

        // Calculate accuracy for each day
        Object.values(dailyStats).forEach(day => {
          day.accuracy = day.questions > 0 ? Math.round((day.correct / day.questions) * 100) : 0;
        });

        return Object.values(dailyStats);
      } catch (error) {
        console.error('Error fetching weekly progress:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Format study time helper
  const formatStudyTime = (seconds) => {
    if (!seconds || seconds < 60) return `${seconds || 0}s`;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Calculate improvement trend
  const calculateTrend = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return 0;
    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  };

  const isLoading = statsLoading || categoryLoading || performanceLoading || weeklyLoading;
  const error = statsError || categoryError || performanceError || weeklyError;

  return {
    // Raw data
    userStats,
    categoryProgress: categoryProgress || [],
    performanceMetrics,
    weeklyProgress: weeklyProgress || [],
    
    // Loading states
    isLoading,
    error,
    
    // Helpers
    formatStudyTime,
    calculateTrend,
    
    // Computed values
    hasData: !isLoading && !error && userStats,
    isEmpty: !isLoading && !error && (!userStats || userStats.total_questions === 0)
  };
};