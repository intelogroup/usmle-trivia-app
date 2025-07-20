import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Helper function to generate country flags
const getCountryFlag = (countryCode) => {
  if (!countryCode) return 'https://flagcdn.com/h20/us.png'; // Default to US
  return `https://flagcdn.com/h20/${countryCode.toLowerCase()}.png`;
};

// Helper function to generate avatars
const getAvatar = (userId) => {
  return `https://i.pravatar.cc/150?u=${userId}`;
};

// Helper function to get grade display
const getGradeDisplay = (gradeId) => {
  const grades = {
    1: '1st Year',
    2: '2nd Year', 
    3: '3rd Year',
    4: '4th Year',
    5: 'Resident',
    6: 'Graduate'
  };
  return grades[gradeId] || 'Student';
};

// Transform leaderboard data from service
const transformLeaderboardData = async (profiles) => {
  if (!profiles || profiles.length === 0) {
    return [];
  }

  return profiles.map(profile => {
    const stats = profile.user_stats?.[0] || {};
    
    return {
      id: profile.id,
      name: profile.display_name || profile.full_name || 'Anonymous',
      country: 'US', // Default country - could be improved with country lookup
      flag: getCountryFlag('US'),
      score: profile.total_points || 0,
      questionsAnswered: stats.total_questions_answered || 0,
      accuracy: stats.overall_accuracy || 0,
      streak: profile.current_streak || 0,
      avatar: profile.avatar_url || getAvatar(profile.id),
      school: 'Medical School', // Default school - could be added to profiles
      year: getGradeDisplay(profile.grade_id),
      subjects: [], // Could be populated from user_tag_scores
      isCurrentUser: false // Will be set later
    };
  });
};

// Optimized leaderboard data fetching for production
const fetchLeaderboardData = async (period = 'all') => {
  try {
    // Use optimized query with proper indexing
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        total_points,
        current_streak,
        avatar_url,
        grade_id,
        user_stats (
          total_quizzes_completed,
          total_questions_answered,
          overall_accuracy
        )
      `)
      .not('display_name', 'is', null)
      .order('total_points', { ascending: false })
      .order('created_at', { ascending: true }) // Tie breaker
      .limit(50); // Reasonable limit for UI

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return await transformLeaderboardData(profiles || []);
  } catch (error) {
    console.error('Error in fetchLeaderboardData:', error);
    return [];
  }
};

export const useLeaderboardData = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const { user } = useAuth();

  // Time period options
  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  // Optimized React Query for production performance
  const { data: rawLeaderboardData = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard', selectedPeriod],
    queryFn: () => fetchLeaderboardData(selectedPeriod),
    staleTime: 30000, // 30 seconds - reduce API calls for leaderboard
    cacheTime: 600000, // 10 minutes - longer cache for static-ish data
    refetchOnWindowFocus: false, // Disable for production performance
    refetchOnMount: false, // Use cached data when available
    keepPreviousData: true, // Smooth transitions
    retry: 2, // Reduced retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Processed data based on selected period
  const processedData = useMemo(() => {
    if (!rawLeaderboardData || rawLeaderboardData.length === 0) {
      return {
        leaderboardData: [],
        topThree: [],
        currentUserData: null,
        currentUserRank: 0,
        totalParticipants: 0,
        isEmpty: true
      };
    }

    // Mark current user in the data
    const leaderboardData = rawLeaderboardData.map(userData => ({
      ...userData,
      isCurrentUser: user?.id === userData.id
    }));
    
    // Extract key information
    const topThree = leaderboardData.slice(0, 3);
    const currentUserData = leaderboardData.find(userData => userData.isCurrentUser);
    const currentUserRank = leaderboardData.findIndex(userData => userData.isCurrentUser) + 1;
    
    return {
      leaderboardData,
      topThree,
      currentUserData,
      currentUserRank: currentUserRank > 0 ? currentUserRank : null,
      totalParticipants: leaderboardData.length,
      isEmpty: false
    };
  }, [rawLeaderboardData, user?.id]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    periods,
    isLoading,
    error,
    ...processedData
  };
}; 