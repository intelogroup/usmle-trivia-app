import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Loader2, 
  Download, 
  Zap, 
  Database, 
  Image as ImageIcon, 
  CheckCircle,
  Clock,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';

const EnhancedQuizLoading = ({ 
  preloadStatus = 'loading',
  cacheStats = {},
  isPreloading = false,
  estimatedTime = null,
  loadingStage = 'questions',
  showDetailedProgress = true,
  onCancel = null
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(loadingStage);
  const [showPerformanceHints, setShowPerformanceHints] = useState(false);

  // Simulate realistic loading progress
  useEffect(() => {
    let progressTimer;
    
    if (preloadStatus === 'loading') {
      const stages = {
        'questions': { duration: 2000, progress: 40 },
        'images': { duration: 1500, progress: 30 },
        'cache': { duration: 800, progress: 20 },
        'complete': { duration: 200, progress: 10 }
      };
      
      let currentProgress = 0;
      const updateProgress = () => {
        if (currentProgress < 100) {
          const increment = Math.random() * 3 + 1;
          currentProgress = Math.min(currentProgress + increment, 100);
          setLoadingProgress(currentProgress);
          
          // Update stage based on progress
          if (currentProgress < 40) setCurrentStage('questions');
          else if (currentProgress < 70) setCurrentStage('images');
          else if (currentProgress < 90) setCurrentStage('cache');
          else setCurrentStage('complete');
          
          progressTimer = setTimeout(updateProgress, 100 + Math.random() * 100);
        }
      };
      
      updateProgress();
    } else {
      setLoadingProgress(100);
    }

    return () => {
      if (progressTimer) clearTimeout(progressTimer);
    };
  }, [preloadStatus]);

  // Show performance hints after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPerformanceHints(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get appropriate icon for current stage
  const getStageIcon = (stage) => {
    const icons = {
      'questions': <Database className="w-5 h-5" />,
      'images': <ImageIcon className="w-5 h-5" />,
      'cache': <Zap className="w-5 h-5" />,
      'complete': <CheckCircle className="w-5 h-5" />
    };
    return icons[stage] || <Loader2 className="w-5 h-5 animate-spin" />;
  };

  // Get stage description
  const getStageDescription = (stage) => {
    const descriptions = {
      'questions': 'Fetching quiz questions...',
      'images': 'Loading question images...',
      'cache': 'Optimizing for performance...',
      'complete': 'Almost ready!'
    };
    return descriptions[stage] || 'Loading...';
  };

  // Get loading animation variants
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

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${loadingProgress}%`,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
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
        
        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 text-white"
          >
            {getStageIcon(currentStage)}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {preloadStatus === 'cache-hit' ? 'Loading from Cache' : 'Preparing Quiz'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300">
            {getStageDescription(currentStage)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Progress</span>
            <span>{Math.round(loadingProgress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              variants={progressVariants}
              animate="animate"
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="relative z-10 flex justify-between mb-6">
          {['questions', 'images', 'cache', 'complete'].map((stage, index) => {
            const isActive = currentStage === stage;
            const isCompleted = ['questions', 'images', 'cache', 'complete'].indexOf(currentStage) > index;
            
            return (
              <div key={stage} className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isCompleted || isActive ? '#3B82F6' : '#E5E7EB'
                  }}
                  className={`w-3 h-3 rounded-full mb-1 ${
                    isCompleted || isActive 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                <span className={`text-xs ${
                  isCompleted || isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-400'
                }`}>
                  {stage === 'questions' ? 'Questions' :
                   stage === 'images' ? 'Images' :
                   stage === 'cache' ? 'Cache' : 'Ready'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Progress Information */}
        {showDetailedProgress && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-10 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Cache: {cacheStats.questionCacheSize || 0} questions
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Images: {cacheStats.imageCacheSize || 0} cached
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Hit Rate: {Math.round(cacheStats.cacheHitRatio || 0)}%
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {preloadStatus === 'cache-hit' ? (
                    <Zap className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Wifi className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-gray-600 dark:text-gray-300">
                    {preloadStatus === 'cache-hit' ? 'Instant Load' : 'Network Load'}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Performance Hints */}
        <AnimatePresence>
          {showPerformanceHints && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Performance Tip
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {preloadStatus === 'cache-hit' 
                      ? 'Questions loaded instantly from cache! Future loads will be even faster.'
                      : 'We\'re preloading related questions in the background for smoother transitions.'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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