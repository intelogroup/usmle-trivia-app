import React from 'react';
import { motion } from 'framer-motion';

const LoadingProgressBar = ({ loadingProgress }) => {
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

  return (
    <div className="relative z-10 mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
        <span>Progress</span>
        <span>{Math.round(loadingProgress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          variants={progressVariants}
          initial="initial"
          animate="animate"
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingProgressBar;
