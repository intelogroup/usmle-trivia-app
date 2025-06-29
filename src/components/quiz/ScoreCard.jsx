import React from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ score, questionCount, accuracy, performance }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={`${performance.bgColor} rounded-2xl p-4 sm:p-8 mb-8 text-center`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-4 sm:space-y-0">
        <div className="text-center">
          <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
            {score}
          </div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            out of {questionCount}
          </div>
        </div>
        <div className="text-center">
          <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
            {accuracy}%
          </div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            accuracy
          </div>
        </div>
        <div className="text-center">
          <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
            {performance.grade}
          </div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            grade
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreCard;
