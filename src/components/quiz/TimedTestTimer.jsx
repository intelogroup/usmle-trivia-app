import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const TimedTestTimer = ({ 
  totalTimeLeft,
  formatTime,
  isLowTime,
  isCriticalTime,
  currentQuestionIndex,
  questionCount,
  getEstimatedTimeForQuestion 
}) => {
  const estimatedTime = getEstimatedTimeForQuestion(currentQuestionIndex, questionCount);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex justify-between items-center mb-6 rounded-xl p-4 shadow-lg transition-all ${
        isCriticalTime 
          ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400'
          : isLowTime 
          ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Timer className={`w-6 h-6 ${
          isCriticalTime 
            ? 'text-red-600 animate-pulse' 
            : isLowTime 
            ? 'text-orange-600' 
            : 'text-blue-600'
        }`} />
        <div>
          <div className={`text-2xl font-bold tabular-nums ${
            isCriticalTime 
              ? 'text-red-600 animate-pulse' 
              : isLowTime 
              ? 'text-orange-600' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {formatTime()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isCriticalTime 
              ? 'Time almost up!' 
              : isLowTime 
              ? 'Time running low' 
              : 'Total Time Remaining'
            }
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Question {currentQuestionIndex + 1} of {questionCount}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ~{estimatedTime}s suggested for this question
        </div>
      </div>
    </motion.div>
  );
};

export default TimedTestTimer; 