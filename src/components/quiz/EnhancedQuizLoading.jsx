import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import LoadingStageIndicator from './LoadingStageIndicator';
import LoadingProgressBar from './LoadingProgressBar';
import LoadingDetails from './LoadingDetails';
import useQuizLoading from '../../hooks/useQuizLoading';

const EnhancedQuizLoading = ({ 
  preloadStatus = 'loading',
  cacheStats = {},
  isPreloading = false,
  estimatedTime = null,
  loadingStage = 'questions',
  showDetailedProgress = true,
  onCancel = null
}) => {
  const { loadingProgress, currentStage, showPerformanceHints } = useQuizLoading(preloadStatus);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1,
      transition: { 
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5" />
        
        {/* Header with Stage Indicator */}
        <LoadingStageIndicator currentStage={currentStage} />

        {/* Progress Bar */}
        <LoadingProgressBar loadingProgress={loadingProgress} />

        {/* Detailed Progress and Performance Hints */}
        <LoadingDetails 
          showDetailedProgress={showDetailedProgress}
          cacheStats={cacheStats}
          preloadStatus={preloadStatus}
          showPerformanceHints={showPerformanceHints}
        />

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="relative z-10 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Clock className="w-4 h-4" />
            <span>Estimated time: {estimatedTime}</span>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <div className="relative z-10 text-center">
            <button
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancel Loading
            </button>
          </div>
        )}

        {/* Loading animations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedQuizLoading;
