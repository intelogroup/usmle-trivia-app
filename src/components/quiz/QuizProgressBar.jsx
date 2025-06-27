import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Target, TrendingUp } from 'lucide-react';

const QuizProgressBar = ({ 
  current, 
  total, 
  progress,
  score = 0,
  accuracy = 0,
  averageTime = 0,
  showDetailed = true,
  size = 'normal' // 'compact', 'normal', 'detailed'
}) => {
  // Calculate various metrics
  const progressPercentage = Math.max(0, Math.min(100, (current / total) * 100));
  const accuracyPercentage = Math.max(0, Math.min(100, accuracy));
  const questionsRemaining = total - current;

  // Get progress color based on accuracy
  const getProgressColor = () => {
    if (accuracyPercentage >= 80) return 'from-green-500 to-emerald-600';
    if (accuracyPercentage >= 60) return 'from-blue-500 to-blue-600';
    if (accuracyPercentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  // Get accuracy color for text
  const getAccuracyColor = () => {
    if (accuracyPercentage >= 80) return 'text-green-600 dark:text-green-400';
    if (accuracyPercentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (accuracyPercentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Size-based styling
  const getSizeStyles = () => {
    switch (size) {
      case 'compact':
        return {
          container: 'py-2',
          progressHeight: 'h-2',
          text: 'text-sm',
          icons: 'w-4 h-4',
          spacing: 'space-y-1'
        };
      case 'detailed':
        return {
          container: 'py-6',
          progressHeight: 'h-4',
          text: 'text-base',
          icons: 'w-5 h-5',
          spacing: 'space-y-4'
        };
      default: // normal
        return {
          container: 'py-4',
          progressHeight: 'h-3',
          text: 'text-sm',
          icons: 'w-4 h-4',
          spacing: 'space-y-2'
        };
    }
  };

  const styles = getSizeStyles();

  // Generate dots for each question
  const generateQuestionDots = () => {
    return Array.from({ length: total }, (_, index) => {
      const questionNumber = index + 1;
      const isCompleted = questionNumber < current;
      const isCurrent = questionNumber === current;
      const isUpcoming = questionNumber > current;

      return (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="relative"
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center"
            >
              <CheckCircle className={`${styles.icons} text-green-500`} />
            </motion.div>
          ) : isCurrent ? (
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center"
            >
              <Circle className={`${styles.icons} text-blue-500 fill-current`} />
            </motion.div>
          ) : (
            <Circle className={`${styles.icons} text-gray-300 dark:text-gray-600`} />
          )}
          
          {/* Question number tooltip */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
            {questionNumber}
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 ${styles.container}`}>
      {/* Header with main stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className={`font-semibold text-gray-900 dark:text-white ${styles.text}`}>
            Progress
          </h3>
          <span className={`font-bold ${styles.text} text-blue-600 dark:text-blue-400`}>
            {current} / {total}
          </span>
        </div>
        
        {showDetailed && (
          <div className="flex items-center space-x-4 text-sm">
            {/* Score */}
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Score: <span className="text-purple-600 dark:text-purple-400">{score}</span>
              </span>
            </div>
            
            {/* Accuracy */}
            {accuracy > 0 && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Accuracy: <span className={getAccuracyColor()}>{Math.round(accuracyPercentage)}%</span>
                </span>
              </div>
            )}
            
            {/* Average time */}
            {averageTime > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Avg: <span className="text-orange-600 dark:text-orange-400">{Math.round(averageTime)}s</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Progress Bar */}
      <div className={`relative bg-gray-200 dark:bg-gray-700 rounded-full ${styles.progressHeight} overflow-hidden mb-4`}>
        <motion.div
          className={`${styles.progressHeight} bg-gradient-to-r ${getProgressColor()} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          
          {/* Progress percentage text */}
          {progressPercentage > 15 && (
            <div className="absolute inset-0 flex items-center justify-end pr-2">
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </motion.div>
        
        {/* Current position indicator */}
        <motion.div
          className="absolute top-0 h-full w-1 bg-white shadow-lg"
          initial={{ left: 0 }}
          animate={{ left: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Question Dots (for smaller quizzes) */}
      {total <= 20 && size !== 'compact' && (
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 flex-wrap gap-1 pb-6">
            {generateQuestionDots()}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {showDetailed && size === 'detailed' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {questionsRemaining}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Remaining
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {score}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Correct
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className={`text-lg font-bold ${getAccuracyColor()}`}>
              {Math.round(accuracyPercentage)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Accuracy
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {averageTime > 0 ? `${Math.round(averageTime)}s` : '--'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Avg Time
            </div>
          </div>
        </div>
      )}

      {/* Motivational message */}
      {showDetailed && size !== 'compact' && (
        <div className="mt-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {progressPercentage >= 75 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                🎉 Almost there! You're doing great!
              </span>
            ) : progressPercentage >= 50 ? (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                🚀 Halfway done! Keep up the momentum!
              </span>
            ) : progressPercentage >= 25 ? (
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                💪 Good progress! Stay focused!
              </span>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">
                🌟 Just getting started! You've got this!
              </span>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuizProgressBar;
