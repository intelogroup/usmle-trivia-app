import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import Confetti from '../ui/Confetti';

const ResultsHeader = ({ accuracy, performance }) => {
  return (
    <div className="text-center mb-8">
      <Confetti trigger={accuracy >= 80} duration={4000} />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-4 ${
          accuracy >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-purple-600'
        }`}
      >
        {accuracy >= 80 ? (
          <Trophy className="w-8 h-8" />
        ) : (
          <Zap className="w-8 h-8" />
        )}
      </motion.div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {accuracy >= 80 ? '🎉 Outstanding! 🎉' : 'Quick Quiz Complete!'}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        {accuracy >= 80 ? 'You absolutely crushed it!' : performance.message}
      </p>
      {accuracy >= 80 && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-purple-600 dark:text-purple-400 mt-2"
        >
          🌟 You're ready for the real thing! 🌟
        </motion.p>
      )}
    </div>
  );
};

export default ResultsHeader;
