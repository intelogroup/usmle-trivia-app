import React from 'react';
import { motion } from 'framer-motion';
import {
  testBasicConnection,
  testQuestionsTable,
  testTagsTable,
  testTagQuestionCountsView,
  testQuestionFetching
} from '../../lib/supabaseSetup';
import { runAllDatabaseTests } from '../../utils/databaseTestFunctions';

const TestControls = ({ onRunComprehensiveTests, onRunIndividualTest, isRunning, comprehensiveResults }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Database Tests
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={onRunComprehensiveTests}
          disabled={comprehensiveResults?.loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-colors"
        >
          {comprehensiveResults?.loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button
          onClick={() => onRunIndividualTest('Basic Connection', testBasicConnection)}
          disabled={isRunning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
        >
          Test Connection
        </button>
        
        <button
          onClick={() => onRunIndividualTest('Questions Table', testQuestionsTable)}
          disabled={isRunning}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
        >
          Test Questions
        </button>
        
        <button
          onClick={() => onRunIndividualTest('Tags Table', testTagsTable)}
          disabled={isRunning}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
        >
          Test Categories
        </button>
        
        <button
          onClick={() => onRunIndividualTest('Tag Counts View', testTagQuestionCountsView)}
          disabled={isRunning}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
        >
          Test View
        </button>
        
        <button
          onClick={() => onRunIndividualTest('Question Fetching', () => testQuestionFetching('mixed', 2))}
          disabled={isRunning}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
        >
          Test Fetching
        </button>
      </div>
    </motion.div>
  );
};

export default TestControls;
