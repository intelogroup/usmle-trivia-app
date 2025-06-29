import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Image as ImageIcon, TrendingUp, Zap, Wifi } from 'lucide-react';

const LoadingDetails = ({ showDetailedProgress, cacheStats, preloadStatus, showPerformanceHints }) => {
  return (
    <>
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
    </>
  );
};

export default LoadingDetails;
