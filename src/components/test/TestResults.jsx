import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const TestResults = ({ testResults }) => {
  if (!testResults) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        {testResults.summary.success ? (
          <CheckCircle className="text-green-600" size={24} />
        ) : (
          <XCircle className="text-red-600" size={24} />
        )}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Test Results
        </h2>
      </div>
      
      <div className="mb-4 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {testResults.timestamp}
        </div>
        <div className={`text-lg font-medium ${
          testResults.summary.success ? 'text-green-600' : 'text-red-600'
        }`}>
          {testResults.summary.message}
        </div>
      </div>

      <div className="space-y-4">
        {testResults.tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              test.success 
                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' 
                : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {test.success ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <XCircle className="text-red-600" size={16} />
              )}
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                {test.name}
              </h3>
            </div>
            
            {test.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {test.message}
              </p>
            )}
            
            {test.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-2 font-mono">
                Error: {test.error}
              </p>
            )}
            
            {test.sampleData && (
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  View Sample Data
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                  {JSON.stringify(test.sampleData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TestResults;
