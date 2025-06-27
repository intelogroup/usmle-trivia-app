import { motion } from 'framer-motion';

const CurrentUserStats = ({ currentUserData, currentUserRank }) => {
  if (!currentUserData) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="hidden lg:block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-6"
    >
      <h3 className="text-base md:text-lg font-bold text-blue-700 dark:text-blue-300 mb-4">Your Performance</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16">
          <img 
            src={currentUserData.avatar} 
            alt={currentUserData.name}
            className="w-full h-full rounded-full object-cover border-2 border-blue-300"
          />
          <img 
            src={currentUserData.flag} 
            alt={currentUserData.country}
            className="absolute -bottom-1 -right-1 w-5 h-4 rounded-sm border border-white"
          />
        </div>
        <div>
          <p className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{currentUserData.school}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Rank</span>
          <span className="font-bold text-lg text-blue-700 dark:text-blue-300">#{currentUserRank}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
          <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.score}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
          <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.accuracy}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
          <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.questionsAnswered}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
          <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.streak} days</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CurrentUserStats; 