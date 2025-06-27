import { motion } from 'framer-motion'
import { getMedicalIcon } from '../../data/medicalIcons'
import { getCategoryStats, getDifficultyColor, getAccuracyColor, formatLastUsed, getProgressBarColor } from '../../utils/categoryUtils'
import { ChevronRight, Clock, Target, TrendingUp, Star } from 'lucide-react'

const CategoryListItem = ({ category, onClick, delay = 0 }) => {
  const IconComponent = getMedicalIcon(category.name, category.icon)
  const stats = getCategoryStats(category)
  const difficultyColorClass = getDifficultyColor(stats.difficulty)
  const accuracyColor = getAccuracyColor(stats.averageAccuracy)
  const progressBarColor = getProgressBarColor(stats.averageAccuracy)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ x: 5 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
    >
      <div className="flex items-center justify-between">
        {/* Left section - Icon and main info */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Category Icon */}
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {category.name}
              </h3>
              {category.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              {stats.isHighYield && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                  High-Yield
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">
              {category.description || `${stats.totalQuestions} practice questions available`}
            </p>

            {/* Stats Row */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{stats.estimatedTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span className={`font-medium ${accuracyColor}`}>
                  {stats.averageAccuracy ? `${stats.averageAccuracy}%` : 'No data'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Last: {formatLastUsed(stats.lastAttempted)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right section - Stats and controls */}
        <div className="flex items-center space-x-4">
          {/* Question Count */}
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.totalQuestions}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              questions
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColorClass}`}>
            {stats.difficulty}
          </div>

          {/* Progress Bar (if has data) */}
          {stats.averageAccuracy > 0 && (
            <div className="w-16">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${progressBarColor}`}
                  style={{ width: `${Math.min(100, stats.averageAccuracy)}%` }}
                />
              </div>
              <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                {stats.averageAccuracy}%
              </div>
            </div>
          )}

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </motion.div>
  )
}

export default CategoryListItem 