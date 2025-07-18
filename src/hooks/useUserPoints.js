import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys } from './queries/queryKeys';

/**
 * Hook for managing user points with real-time updates
 * Provides points data and refresh functionality
 */
export function useUserPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for user points
  const { data: userPoints, isLoading, error } = useQuery({
    queryKey: queryKeys.userPoints(user?.id),
    queryFn: async () => {
      if (!user?.id) return { total_points: 0 };

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('total_points, current_streak, best_streak')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn('Error fetching user points:', error);
          return { total_points: 0, current_streak: 0, best_streak: 0 };
        }

        return data || { total_points: 0, current_streak: 0, best_streak: 0 };
      } catch (err) {
        console.error('Error in useUserPoints:', err);
        return { total_points: 0, current_streak: 0, best_streak: 0 };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000
  });

  // Function to refresh points (call after quiz completion)
  const refreshPoints = async () => {
    if (user?.id) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.userPoints(user.id)
      });
      // Also refresh user stats and activity
      await queryClient.invalidateQueries({
        queryKey: queryKeys.userStats(user.id)
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.userActivity(user.id)
      });
    }
  };

  // Function to manually update points (optimistic update)
  const updatePoints = (pointsToAdd) => {
    if (user?.id && pointsToAdd > 0) {
      queryClient.setQueryData(queryKeys.userPoints(user.id), (old) => ({
        ...old,
        total_points: (old?.total_points || 0) + pointsToAdd
      }));
    }
  };

  return {
    points: userPoints?.total_points || 0,
    currentStreak: userPoints?.current_streak || 0,
    bestStreak: userPoints?.best_streak || 0,
    isLoading,
    error,
    refreshPoints,
    updatePoints
  };
}