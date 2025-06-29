import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Star } from 'lucide-react';

const buttonMotion = {
  whileTap: { scale: 0.93 },
  whileHover: { scale: 1.04 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

const ActionButtons = ({ accuracy, onRestart, onGoHome, handleShare, onButtonPress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="flex flex-col sm:flex-row gap-4 justify-center"
    >
      <motion.button
        {...buttonMotion}
        onClick={e => { onButtonPress?.(); onRestart(e); }}
        className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
        <span>Try Again</span>
      </motion.button>
      
      <motion.button
        {...buttonMotion}
        onClick={e => { onButtonPress?.(); onGoHome(e); }}
        className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        <span>Back to Home</span>
      </motion.button>
      
      {accuracy >= 80 && (
        <motion.button
          {...buttonMotion}
          onClick={e => { onButtonPress?.(); handleShare(e); }}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <Star className="w-5 h-5" />
          <span>Share Success!</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default ActionButtons;
