import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock } from 'lucide-react';

const AchievementBadges = ({ score, accuracy }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <div className="font-semibold text-gray-900 dark:text-white">
          {score >= 8 ? 'Quiz Master!' : score >= 6 ? 'Good Work!' : 'Keep Going!'}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
        <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <div className="font-semibold text-gray-900 dark:text-white">
          {accuracy >= 80 ? 'Sharpshooter' : accuracy >= 60 ? 'On Target' : 'Practice Makes Perfect'}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
        <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <div className="font-semibold text-gray-900 dark:text-white">
          Quick & Focused
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementBadges;
