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
    totalParticipants
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

        {/* Desktop Layout: Grid with Sidebar */}
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
      </div>
    </div>
  );
};

export default Leaderboard 