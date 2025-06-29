import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AccountInfo = () => {
  const { user, profile } = useAuth();

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <User size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Account Information</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-dark-300">Email:</span>
          <span className="text-gray-800 dark:text-dark-50">{user?.email}</span>
        </div>
        {profile?.bio && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-dark-300">Bio:</span>
            <span className="text-gray-800 dark:text-dark-50">{profile.bio}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-dark-300">Member Since:</span>
          <span className="text-gray-800 dark:text-dark-50">
            {new Date(user?.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountInfo;
