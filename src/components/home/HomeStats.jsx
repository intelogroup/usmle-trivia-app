import { motion } from 'framer-motion'
import { Target, Clock, TrendingUp } from 'lucide-react'
import StatsCard from '../ui/StatsCard'

const HomeStats = ({ userStats, isNewUser, isLoading }) => {
  // Define enhanced stats data based on user state
  const getStatsData = () => {
    if (isNewUser) {
      return [
        { 
          icon: Target, 
          value: '0%', 
          label: 'Accuracy', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-700', 
          iconColor: 'text-red-500',
          trend: { value: 0, direction: 'neutral', period: 'week' },
          goal: { current: 0, target: 75, unit: '%' },
          subtitle: 'No data yet',
          detailed: 'Complete your first quiz to track accuracy'
        },
        { 
          icon: Clock, 
          value: '0h', 
          label: 'Study Time', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-700', 
          iconColor: 'text-blue-500',
          trend: { value: 0, direction: 'neutral', period: 'week' },
          goal: { current: 0, target: 2, unit: 'hrs/day' },
          subtitle: 'Ready to start',
          detailed: 'Recommended: 2 hours daily study time'
        },
        { 
          icon: TrendingUp, 
          value: '0', 
          label: 'Streak', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-700', 
          iconColor: 'text-purple-500',
          trend: { value: 0, direction: 'neutral', period: 'all time' },
          goal: { current: 0, target: 7, unit: 'days' },
          subtitle: 'Build momentum',
          detailed: 'Start your first study streak today'
        }
      ]
    } else {
      const accuracyTrend = userStats.accuracy > 70 ? 'up' : userStats.accuracy > 50 ? 'neutral' : 'down'
      const streakTrend = userStats.currentStreak > userStats.longestStreak - 3 ? 'up' : 'neutral'
      
      return [
        { 
          icon: Target, 
          value: `${Math.round(userStats.accuracy)}%`, 
          label: 'Accuracy', 
          color: 'text-green-600 dark:text-green-400', 
          bgColor: 'bg-green-100 dark:bg-green-900/30', 
          iconColor: 'text-green-600',
          trend: { value: Math.max(0, Math.round(userStats.accuracy - 70)), direction: accuracyTrend, period: 'this week' },
          goal: { current: Math.round(userStats.accuracy), target: 85, unit: '%' },
          subtitle: accuracyTrend === 'up' ? `+${Math.max(0, Math.round(userStats.accuracy - 70))}% this week` : 'Room for improvement',
          detailed: `${userStats.totalQuestions} questions answered, ${Math.round(userStats.accuracy * userStats.totalQuestions / 100)} correct`
        },
        { 
          icon: Clock, 
          value: `${userStats.studyTime}h`, 
          label: 'Study Time', 
          color: 'text-blue-600 dark:text-blue-400', 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
          iconColor: 'text-blue-600',
          trend: { value: Math.max(0, Math.round(userStats.studyTime / 7 * 10) / 10), direction: 'up', period: 'this week' },
          goal: { current: userStats.studyTime, target: 50, unit: 'hours' },
          subtitle: `+${Math.max(0, Math.round(userStats.studyTime / 7 * 10) / 10)}h this week`,
          detailed: `${Math.round(userStats.studyTime / 7 * 10) / 10}h daily average, ${50 - userStats.studyTime}h to goal`
        },
        { 
          icon: TrendingUp, 
          value: `${userStats.currentStreak}`, 
          label: 'Day Streak', 
          color: 'text-purple-600 dark:text-purple-400', 
          bgColor: 'bg-purple-100 dark:bg-purple-900/30', 
          iconColor: 'text-purple-600',
          trend: { value: userStats.currentStreak - Math.max(0, userStats.longestStreak - 5), direction: streakTrend, period: 'personal best' },
          goal: { current: userStats.currentStreak, target: Math.max(30, userStats.longestStreak + 5), unit: 'days' },
          subtitle: userStats.currentStreak >= userStats.longestStreak ? 'Personal best!' : `Best: ${userStats.longestStreak} days`,
          detailed: `${userStats.currentStreak >= 7 ? '🔥' : ''} ${userStats.currentStreak >= userStats.longestStreak ? 'New record!' : `${Math.max(30, userStats.longestStreak + 5) - userStats.currentStreak} days to goal`}`
        }
      ]
    }
  }

  const statsData = getStatsData()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <StatsCard
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            color={stat.color}
            bgColor={stat.bgColor}
            iconColor={stat.iconColor}
            trend={stat.trend}
            goal={stat.goal}
            subtitle={stat.subtitle}
            detailed={stat.detailed}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default HomeStats 