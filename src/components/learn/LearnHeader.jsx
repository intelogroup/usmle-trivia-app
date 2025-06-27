import { motion } from 'framer-motion';

const LearnHeader = ({ userStats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 md:mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white mb-1">Learn</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Explore study materials and resources</p>
        </div>
        
        {/* Desktop Quick Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userStats.hoursStudied}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hours Studied</p>
          </div>
          <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userStats.coursesStarted}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Courses Started</p>
          </div>
          <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userStats.coursesCompleted}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearnHeader; 