import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

// Import custom hooks and components
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import LeaderboardPeriodSelector from '../components/leaderboard/LeaderboardPeriodSelector';
import LeaderboardPodium from '../components/leaderboard/LeaderboardPodium';
import CurrentUserStats from '../components/leaderboard/CurrentUserStats';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

const Leaderboard = () => {
  // Use custom hook for data management
  const {
    selectedPeriod,
    setSelectedPeriod,
    periods,
    leaderboardData,
    topThree,
    currentUserData,
    currentUserRank,
    totalParticipants,
    isLoading,
    error,
    isEmpty
  } = useLeaderboardData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 md:p-3 rounded-xl">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">See who's leading the way</p>
              </div>
            </div>

            {/* Period Selector */}
            <LeaderboardPeriodSelector
              periods={periods}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to load leaderboard
            </h3>
            <p className="text-red-600 dark:text-red-400">
              There was an error loading the leaderboard data. Please try again later.
            </p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              No rankings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Be the first to take a quiz and claim your spot on the leaderboard! Start with a quick quiz to begin earning points.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/quiz'}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Take Your First Quiz
            </motion.button>
          </motion.div>
        )}

        {/* Content - Only show when not loading, no error, and has data */}
        {!isLoading && !error && !isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Sidebar - Top Performers & Current User Stats */}
            <div className="lg:col-span-1 space-y-4">
              {/* Top 3 Podium */}
              <LeaderboardPodium topThree={topThree} />

              {/* Current User Stats - Only on Desktop */}
              <CurrentUserStats 
                currentUserData={currentUserData}
                currentUserRank={currentUserRank}
              />
            </div>

            {/* Main Rankings List */}
            <LeaderboardTable 
              leaderboardData={leaderboardData}
              totalParticipants={totalParticipants}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard 