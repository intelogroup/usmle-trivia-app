import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

const QuizTimer = ({ 
  timeLeft, 
  formatTime, 
  isLowTime = false, 
  progressPercentage = 100, 
  timerKey,
  initialTime = 60,
  showProgressBar = true,
  size = 'large' // 'small', 'normal', 'large'
}) => {
  // Calculate time percentage for visual feedback
  const timePercentage = (timeLeft / initialTime) * 100;
  
  // Determine timer state and styling
  const getTimerState = () => {
    if (timePercentage <= 10) return 'critical'; // Last 10%
    if (timePercentage <= 25) return 'warning';  // Last 25%
    if (timePercentage <= 50) return 'caution';  // Last 50%
    return 'normal';
  };

  const timerState = getTimerState();

  // Get styling based on state and size
  const getTimerStyles = () => {
    const baseStyles = {
      container: `relative flex items-center justify-center rounded-xl transition-all duration-300`,
      text: `font-bold tabular-nums`,
      icon: ``,
      progress: `absolute inset-0 rounded-xl transition-all duration-300`
    };

    // Size variations
    const sizeStyles = {
      small: {
        container: `${baseStyles.container} h-12 w-24 text-sm`,
        text: `${baseStyles.text} text-sm`,
        icon: `w-3 h-3`,
        progress: baseStyles.progress
      },
      normal: {
        container: `${baseStyles.container} h-16 w-32 text-lg`,
        text: `${baseStyles.text} text-lg`,
        icon: `w-4 h-4`,
        progress: baseStyles.progress
      },
      large: {
        container: `${baseStyles.container} h-20 w-40 text-xl`,
        text: `${baseStyles.text} text-xl`,
        icon: `w-5 h-5`,
        progress: baseStyles.progress
      }
    };

    // State-based color variations
    const stateStyles = {
      normal: {
        container: `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg`,
        progress: `bg-gradient-to-r from-blue-400 to-blue-500`,
        glow: ``
      },
      caution: {
        container: `bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg`,
        progress: `bg-gradient-to-r from-yellow-400 to-orange-400`,
        glow: `shadow-yellow-200`
      },
      warning: {
        container: `bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg`,
        progress: `bg-gradient-to-r from-orange-400 to-red-400`,
        glow: `shadow-orange-200 animate-pulse`
      },
      critical: {
        container: `bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg`,
        progress: `bg-gradient-to-r from-red-400 to-red-500`,
        glow: `shadow-red-200 animate-pulse`
      }
    };

    return {
      ...sizeStyles[size],
      ...stateStyles[timerState]
    };
  };

  const styles = getTimerStyles();

  // Get appropriate icon based on state
  const getTimerIcon = () => {
    switch (timerState) {
      case 'critical':
        return <AlertTriangle className={`${styles.icon} animate-bounce`} />;
      case 'warning':
        return <AlertTriangle className={`${styles.icon} animate-pulse`} />;
      case 'caution':
        return <Zap className={styles.icon} />;
      default:
        return <Clock className={styles.icon} />;
    }
  };

  // Animation variants for different states
  const containerVariants = {
    normal: { scale: 1, rotate: 0 },
    caution: { scale: 1.02, rotate: 0 },
    warning: { scale: 1.05, rotate: [-1, 1, -1, 0] },
    critical: { scale: 1.1, rotate: [-2, 2, -2, 2, 0] }
  };

  const textVariants = {
    normal: { scale: 1 },
    caution: { scale: 1 },
    warning: { scale: [1, 1.1, 1] },
    critical: { scale: [1, 1.2, 1] }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center space-y-2">
      {/* Main Timer Display */}
      <motion.div
        key={timerKey}
        variants={containerVariants}
        animate={timerState}
        transition={{
          duration: timerState === 'critical' ? 0.5 : timerState === 'warning' ? 0.8 : 1,
          repeat: timerState === 'critical' || timerState === 'warning' ? Infinity : 0,
          repeatType: 'reverse'
        }}
        className={`${styles.container} ${styles.glow} relative overflow-hidden`}
      >
        {/* Background Progress Fill */}
        {showProgressBar && (
          <div
            className={`${styles.progress} opacity-30`}
            style={{
              width: `${Math.max(0, Math.min(100, timePercentage))}%`,
              transition: 'width 1s linear'
            }}
          />
        )}

        {/* Timer Content */}
        <div className="relative z-10 flex items-center space-x-2">
          {getTimerIcon()}
          <motion.span
            variants={textVariants}
            animate={timerState}
            transition={{
              duration: 0.3,
              repeat: timerState === 'critical' ? Infinity : 0,
              repeatType: 'reverse'
            }}
            className={styles.text}
          >
            {formatTime ? formatTime(timeLeft) : `${timeLeft}s`}
          </motion.span>
        </div>

        {/* Pulse effect for critical state */}
        <AnimatePresence>
          {timerState === 'critical' && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className="absolute inset-0 bg-red-400 rounded-xl"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress Bar (when enabled) */}
      {showProgressBar && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                timerState === 'critical' ? 'bg-red-500' :
                timerState === 'warning' ? 'bg-orange-500' :
                timerState === 'caution' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, timePercentage))}%` }}
              animate={{
                boxShadow: timerState === 'critical' 
                  ? ['0 0 0 rgba(239, 68, 68, 0)', '0 0 20px rgba(239, 68, 68, 0.6)', '0 0 0 rgba(239, 68, 68, 0)']
                  : timerState === 'warning'
                  ? ['0 0 0 rgba(249, 115, 22, 0)', '0 0 15px rgba(249, 115, 22, 0.4)', '0 0 0 rgba(249, 115, 22, 0)']
                  : 'none'
              }}
              transition={{
                boxShadow: {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      <AnimatePresence>
        {(timerState === 'warning' || timerState === 'critical') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`text-center text-xs font-medium px-3 py-1 rounded-full ${
              timerState === 'critical' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            }`}
          >
            {timerState === 'critical' ? 'Time almost up!' : 'Running low on time'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational message for good progress */}
      <AnimatePresence>
        {timerState === 'normal' && timePercentage > 75 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center text-xs font-medium text-green-600 dark:text-green-400"
          >
            Great pace! Keep it up 🚀
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizTimer;
