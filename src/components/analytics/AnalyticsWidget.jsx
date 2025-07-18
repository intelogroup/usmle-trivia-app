import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Trophy, BarChart3 } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

/**
 * Compact Analytics Widget Component
 * Shows key metrics in a compact format for embedding in other views
 */
const AnalyticsWidget = ({ showTitle = true, compact = false }) => {
  const {
    userStats,
    performanceMetrics,
    isLoading,
    error,
    formatStudyTime,
    hasData,
    isEmpty
  } = useAnalytics();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || isEmpty) {
    return (
      <div className="text-center py-4">
        <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {error ? 'Error loading analytics' : 'No data yet'}
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Accuracy',
      value: `${performanceMetrics?.accuracy || 0}%`,
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Study Time',
      value: formatStudyTime(performanceMetrics?.totalStudyTime || 0),
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Questions',
      value: userStats?.total_questions || 0,
      icon: BarChart3,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Streak',
      value: performanceMetrics?.currentStreak || 0,
      icon: Trophy,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {showTitle && (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Your Progress
          </h3>
        </div>
      )}

      <div className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-2'} gap-3`}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional insights for non-compact mode */}
      {!compact && hasData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sessions Completed</span>
              <span className="text-gray-800 dark:text-white font-medium">
                {performanceMetrics?.sessionsCompleted || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Avg. Session Time</span>
              <span className="text-gray-800 dark:text-white font-medium">
                {formatStudyTime(performanceMetrics?.averageSessionTime || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Questions per Session</span>
              <span className="text-gray-800 dark:text-white font-medium">
                {performanceMetrics?.questionsPerSession || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsWidget;