import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys } from './queries/queryKeys';

/**
 * Hook for fetching real leaderboard data from the database
 * Replaces hardcoded data with actual user statistics
 */
export const useRealLeaderboardData = () => {
  const { user } = useAuth();

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: queryKeys.leaderboard('all'),
    queryFn: async () => {
      try {
        // Get leaderboard data from profiles with quiz statistics
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            display_name,
            full_name,
            avatar_url,
            total_points,
            current_streak,
            best_streak,
            last_active_at,
            created_at
          `)
          .order('total_points', { ascending: false })
          .limit(50);

        if (profilesError) {
          console.error('Error fetching leaderboard:', profilesError);
          return [];
        }

        // Get quiz statistics for each user
        const leaderboardWithStats = await Promise.all(
          profiles.map(async (profile, index) => {
            // Get user's quiz statistics
            const { data: quizStats, error: statsError } = await supabase
              .from('quiz_sessions')
              .select('total_questions, correct_answers, completed_at')
              .eq('user_id', profile.id)
              .not('completed_at', 'is', null);

            let questionsAnswered = 0;
            let totalCorrect = 0;
            let accuracy = 0;

            if (!statsError && quizStats) {
              questionsAnswered = quizStats.reduce((sum, session) => sum + (session.total_questions || 0), 0);
              totalCorrect = quizStats.reduce((sum, session) => sum + (session.correct_answers || 0), 0);
              accuracy = questionsAnswered > 0 ? Math.round((totalCorrect / questionsAnswered) * 100) : 0;
            }

            return {
              id: profile.id,
              name: profile.full_name || profile.display_name || 'Anonymous User',
              email: profile.email,
              score: profile.total_points || 0,
              questionsAnswered,
              accuracy,
              streak: profile.current_streak || 0,
              bestStreak: profile.best_streak || 0,
              avatar: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.id}`,
              rank: index + 1,
              isCurrentUser: profile.id === user?.id,
              lastActive: profile.last_active_at,
              joinedAt: profile.created_at,
              // Default values for UI compatibility
              country: 'Unknown',
              flag: 'https://flagcdn.com/h20/us.png',
              school: 'Medical School',
              year: 'Student',
              subjects: []
            };
          })
        );

        return leaderboardWithStats;
      } catch (error) {
        console.error('Error in leaderboard query:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Process data for UI components
  const processedData = {
    leaderboardData: leaderboardData || [],
    topThree: (leaderboardData || []).slice(0, 3),
    currentUserData: (leaderboardData || []).find(user => user.isCurrentUser),
    currentUserRank: (leaderboardData || []).findIndex(user => user.isCurrentUser) + 1,
    totalParticipants: (leaderboardData || []).length
  };

  // If current user not found in top 50, get their specific rank
  const { data: currentUserRank } = useQuery({
    queryKey: queryKeys.userRank(user?.id),
    queryFn: async () => {
      if (!user?.id || processedData.currentUserData) return null;

      try {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .single();

        if (error || !userProfile) return null;

        // Count users with higher points
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('total_points', userProfile.total_points);

        if (countError) return null;

        return count + 1; // Add 1 for current user's rank
      } catch (error) {
        console.error('Error getting user rank:', error);
        return null;
      }
    },
    enabled: !!user?.id && !processedData.currentUserData,
    staleTime: 5 * 60 * 1000
  });

  return {
    ...processedData,
    isLoading,
    error,
    actualUserRank: currentUserRank || processedData.currentUserRank || null,
    isEmpty: !isLoading && (!leaderboardData || leaderboardData.length === 0)
  };
};