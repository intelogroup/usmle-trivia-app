import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const ComprehensiveResults = ({ comprehensiveResults }) => {
  if (!comprehensiveResults || comprehensiveResults.loading) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mt-6"
    >
      <div className="flex items-center gap-3 mb-4">
        {comprehensiveResults.error ? (
          <XCircle className="text-red-600" size={24} />
        ) : (
          <CheckCircle className="text-green-600" size={24} />
        )}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Comprehensive Test Results
        </h2>
      </div>
      
      <div className="space-y-4">
        {comprehensiveResults.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
            Error: {comprehensiveResults.message}
          </div>
        ) : (
          <div className="space-y-2">
            <StatusBadge 
              status={comprehensiveResults.connection} 
              label="Database Connection" 
            />
            <StatusBadge 
              status={comprehensiveResults.questions} 
              label="Question Fetching" 
            />
            <StatusBadge 
              status={comprehensiveResults.tags} 
              label="Tags & Counting" 
            />
            {comprehensiveResults.session?.skipped ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded-lg">
                Session test skipped (no user logged in)
              </div>
            ) : (
              <StatusBadge 
                status={comprehensiveResults.session} 
                label="Quiz Session Creation" 
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status, label }) => {
  if (!status) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-gray-600 dark:text-gray-400">{label}: Testing...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      status.success 
        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        status.success ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="font-medium">{label}:</span>
      <span>{status.message}</span>
      {status.count !== undefined && (
        <span className="text-sm opacity-75">({status.count} items)</span>
      )}
    </div>
  );
};

export default ComprehensiveResults;
