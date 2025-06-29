import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Check, X } from 'lucide-react';
import { testConnection } from '../../lib/supabase';

const DatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const result = await testConnection();
    setConnectionStatus(result);
    setIsTestingConnection(false);
    
    // Auto clear status after 5 seconds
    setTimeout(() => setConnectionStatus(null), 5000);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Database size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Database Connection</h3>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTestConnection}
        disabled={isTestingConnection}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed mb-4"
      >
        {isTestingConnection ? 'Testing Connection...' : 'Test Database Connection'}
      </motion.button>

      {connectionStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            connectionStatus.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {connectionStatus.success ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <X size={18} className="text-red-600" />
            )}
            <span className="font-semibold">
              {connectionStatus.success ? 'Connection Successful' : 'Connection Failed'}
            </span>
          </div>
          <p className="text-sm">{connectionStatus.message}</p>
          {connectionStatus.data && (
            <pre className="mt-2 text-xs bg-white/50 p-2 rounded border overflow-x-auto">
              {JSON.stringify(connectionStatus.data, null, 2)}
            </pre>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DatabaseConnection;
