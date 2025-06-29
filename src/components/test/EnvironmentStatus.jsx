import React from 'react';
import { motion } from 'framer-motion';

const EnvironmentStatus = ({ user }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mt-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Environment Status
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white">Supabase URL</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white">API Key</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured ✓' : 'Not configured ✗'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white">User Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user ? `Logged in as ${user.email}` : 'Not logged in'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white">Environment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {import.meta.env.MODE || 'Unknown'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EnvironmentStatus;
