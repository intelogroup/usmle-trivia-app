import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const Achievements = () => {
  const achievements = [
    { title: 'First Quiz', description: 'Complete your first quiz', earned: true },
    { title: 'Perfect Score', description: 'Get 100% on any quiz', earned: true },
    { title: 'Study Streak', description: '7 days in a row', earned: false },
    { title: 'Category Master', description: 'Complete all questions in a category', earned: false },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} className="text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Achievements</h3>
      </div>
      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.title}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${
              achievement.earned ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <div className="flex-1">
              <p className={`font-medium ${
                achievement.earned ? 'text-green-800' : 'text-gray-600'
              }`}>
                {achievement.title}
              </p>
              <p className={`text-sm ${
                achievement.earned ? 'text-green-600' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Achievements;
