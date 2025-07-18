import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPoints } from '../../hooks/useUserPoints';

/**
 * Mobile-optimized quiz header component
 * Provides navigation and essential info in compact format
 */
const MobileQuizHeader = ({ 
  title = 'Quiz', 
  showTimer = false,
  timeLeft = 0,
  totalTime = 0,
  onBack,
  onHome,
  showPoints = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const { points, isLoading: pointsLoading } = useUserPoints();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      navigate('/');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!showTimer) return 'text-gray-600 dark:text-gray-300';
    const progress = timeLeft / totalTime;
    if (progress < 0.1) return 'text-red-500';
    if (progress < 0.25) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-sm border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-50 ${className}`}
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className=\"flex items-center justify-between px-4 py-3\">
        {/* Left side - Navigation */}
        <div className=\"flex items-center gap-2\">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className=\"p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors\"
          >
            <ArrowLeft size={20} className=\"text-gray-600 dark:text-gray-300\" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHome}
            className=\"p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors\"
          >
            <Home size={20} className=\"text-gray-600 dark:text-gray-300\" />
          </motion.button>
        </div>

        {/* Center - Title and Timer */}
        <div className=\"flex-1 flex flex-col items-center justify-center min-w-0\">
          <h1 className=\"text-lg font-semibold text-gray-900 dark:text-white truncate\">{title}</h1>
          {showTimer && (
            <div className=\"flex items-center gap-1 mt-1\">
              <Clock size={14} className={getTimeColor()} />
              <span className={`text-sm font-mono ${getTimeColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Points */}
        {showPoints && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className=\"flex items-center gap-1 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg\"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Trophy size={12} className=\"drop-shadow-sm\" />
            </motion.div>
            <span className=\"tracking-tight min-w-[2ch] text-center\">
              {pointsLoading ? '...' : (points?.toLocaleString() || '0')}
            </span>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default MobileQuizHeader;