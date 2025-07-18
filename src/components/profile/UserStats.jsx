import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserStats = () => {
  const { profile } = useAuth();

  // Calculate dynamic stats from profile data
  const calculateAccuracy = () => {
    if (!profile?.total_questions_answered || profile.total_questions_answered === 0) return '0%';
    const accuracy = (profile.correct_answers / profile.total_questions_answered) * 100;
    return `${Math.round(accuracy)}%`;
  };

  const calculateStudyTime = () => {
    if (!profile?.total_study_time_seconds) return '0h';
    const hours = Math.round(profile.total_study_time_seconds / 3600 * 10) / 10;
    return `${hours}h`;
  };

  const userStats = [
    { icon: Trophy, label: 'Total Points', value: profile?.total_points?.toLocaleString() || '0', color: 'text-yellow-500' },
    { icon: Target, label: 'Overall Accuracy', value: calculateAccuracy(), color: 'text-blue-500' },
    { icon: Clock, label: 'Study Time', value: calculateStudyTime(), color: 'text-green-500' },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-3 gap-4"
    >
      {userStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-card dark:shadow-card-dark text-center border border-gray-50 dark:border-gray-700"
        >
          <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
          <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{stat.value}</p>
          <p className="text-sm text-gray-600 dark:text-dark-300">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default UserStats;
