import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const ProgressSidebar = ({ progressData, recentActivity, overallProgress }) => {
  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Your Progress</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            View Details
          </button>
        </div>
        
        <div className="space-y-4">
          {progressData.map((item, index) => (
            <motion.div
              key={item.subject}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300 font-medium">{item.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-white">{item.progress}%</span>
                  <span className="text-xs text-green-600 dark:text-green-400">{item.trend}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500`} 
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">{overallProgress}%</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">{activity.activity}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Study Tip - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="hidden lg:block bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 md:p-6 border border-blue-100 dark:border-blue-800"
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Study Tip</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Review your weakest subjects first thing in the morning when your mind is fresh. 
          This helps improve retention and understanding.
        </p>
      </motion.div>
    </div>
  );
};

export default ProgressSidebar; 