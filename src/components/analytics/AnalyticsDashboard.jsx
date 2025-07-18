import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  Trophy, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

/**
 * Comprehensive Analytics Dashboard Component
 * Displays user performance metrics, trends, and insights
 */
const AnalyticsDashboard = () => {
  const {
    userStats,
    categoryProgress,
    performanceMetrics,
    weeklyProgress,
    isLoading,
    error,
    formatStudyTime,
    hasData,
    isEmpty
  } = useAnalytics();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">Error loading analytics</div>
        <p className="text-gray-600 text-sm">Please try refreshing the page</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-4 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Yet</h3>
        <p className="text-gray-500">Start taking quizzes to see your analytics!</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Accuracy',
      value: `${performanceMetrics?.accuracy || 0}%`,
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-50',
      change: '+2%' // Could be calculated from historical data
    },
    {
      title: 'Study Time',
      value: formatStudyTime(performanceMetrics?.totalStudyTime || 0),
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      change: '+15%'
    },
    {
      title: 'Questions Answered',
      value: userStats?.total_questions || 0,
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      change: '+8%'
    },
    {
      title: 'Current Streak',
      value: performanceMetrics?.currentStreak || 0,
      icon: Trophy,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      change: '+3'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your learning progress</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs text-green-600 font-medium">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Progress Chart */}
      {weeklyProgress && weeklyProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Weekly Progress</h3>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weeklyProgress.map((day, index) => (
              <div key={day.day} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{day.day}</div>
                <div className="relative">
                  <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min((day.sessions / 5) * 100, 100)}%` }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-gradient-to-t from-blue-500 to-purple-600 w-full absolute bottom-0"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {day.sessions} sessions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Progress */}
      {categoryProgress && categoryProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Category Progress</h3>
          </div>
          <div className="space-y-3">
            {categoryProgress.slice(0, 8).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {category.progress}% ({category.correct}/{category.total})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.progress}%` }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Performance Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Session Time</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {formatStudyTime(performanceMetrics?.averageSessionTime || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Questions per Session</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {performanceMetrics?.questionsPerSession || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Study Time per Question</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {formatStudyTime(performanceMetrics?.studyTimePerQuestion || 0)}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {performanceMetrics?.sessionsCompleted || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {performanceMetrics?.longestStreak || 0} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Questions</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {userStats?.total_questions || 0}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;