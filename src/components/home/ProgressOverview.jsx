import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Trophy, Target, Clock, Book, Award, ChevronRight } from 'lucide-react'

const ProgressOverview = ({ userStats, isNewUser }) => {
  const navigate = useNavigate()

  if (isNewUser) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="text-center py-8">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Your Journey Starts Here!
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Complete your first quiz to unlock detailed progress tracking, performance analytics, and personalized study recommendations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy Tracking</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Progress Analytics</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Award className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-500 dark:text-gray-400">Achievement System</div>
            </div>
          </div>
          
          <motion.button
            onClick={() => navigate('/quick-quiz')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Take Your First Quiz</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  const getProgressSummary = () => {
    return {
      weeklyGoal: {
        current: Math.round(userStats.studyTime),
        target: 14,
        unit: 'hours',
        percentage: Math.min(100, (userStats.studyTime / 14) * 100)
      },
      accuracyGoal: {
        current: Math.round(userStats.accuracy),
        target: 85,
        unit: '%',
        percentage: (userStats.accuracy / 85) * 100
      },
      streakGoal: {
        current: userStats.currentStreak,
        target: 30,
        unit: 'days',
        percentage: (userStats.currentStreak / 30) * 100
      }
    }
  }

  const progress = getProgressSummary()

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Overview</h3>
        <motion.button
          onClick={() => navigate('/profile')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
          whileHover={{ scale: 1.05 }}
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Weekly Study Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Weekly Study Goal</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {progress.weeklyGoal.current}/{progress.weeklyGoal.target} {progress.weeklyGoal.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress.weeklyGoal.percentage)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Accuracy Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Accuracy Goal</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {progress.accuracyGoal.current}/{progress.accuracyGoal.target}{progress.accuracyGoal.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-green-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress.accuracyGoal.percentage)}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>

        {/* Streak Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Streak Goal</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {progress.streakGoal.current}/{progress.streakGoal.target} {progress.streakGoal.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress.streakGoal.percentage)}%` }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* Recent Achievement */}
      {userStats.currentStreak >= 7 && (
        <motion.div 
          className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-400 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-900" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">🔥 On Fire!</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {userStats.currentStreak} day study streak - keep it going!
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ProgressOverview 