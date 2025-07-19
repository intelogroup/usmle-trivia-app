import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboardData } from '../services/leaderboard/statsService';

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

// Fetch leaderboard data using the stats service
const fetchLeaderboardData = async (period = 'all') => {
  try {
    const profiles = await getLeaderboardData(period, 50);
    return await transformLeaderboardData(profiles);
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

  // Fetch leaderboard data using React Query
  const { data: rawLeaderboardData = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard', selectedPeriod],
    queryFn: () => fetchLeaderboardData(selectedPeriod),
    staleTime: 10000, // 10 seconds - more frequent updates for real-time feel
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
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