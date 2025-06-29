import React from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import EnvironmentSetup from '../components/test/EnvironmentSetup';
import TestControls from '../components/test/TestControls';
import TestResults from '../components/test/TestResults';
import ComprehensiveResults from '../components/test/ComprehensiveResults';
import EnvironmentStatus from '../components/test/EnvironmentStatus';
import SecurityAudit from '../components/test/SecurityAudit';
import useDatabaseTests from '../hooks/useDatabaseTests';
import { useAuth } from '../contexts/AuthContext';

const DatabaseTest = () => {
  const { user } = useAuth();
  const {
    testResults,
    isRunning,
    comprehensiveResults,
    runComprehensiveTests,
    runIndividualTest
  } = useDatabaseTests(user);

  const handleCheckEnvironment = (setup) => {
    // Any additional handling if needed when environment is checked
    console.log('Environment setup checked:', setup);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              Supabase Database Test
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Test your Supabase connection and database schema
          </p>
        </motion.div>

        {/* Environment Setup Check */}
        <EnvironmentSetup onCheckEnvironment={handleCheckEnvironment} />

        {/* Test Controls */}
        <TestControls 
          onRunComprehensiveTests={runComprehensiveTests}
          onRunIndividualTest={runIndividualTest}
          isRunning={isRunning}
          comprehensiveResults={comprehensiveResults}
        />

        {/* Security Audit */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <SecurityAudit />
        </motion.div>

        {/* Test Results */}
        <TestResults testResults={testResults} />

        {/* Comprehensive Test Results */}
        <ComprehensiveResults comprehensiveResults={comprehensiveResults} />

        {/* Environment Status */}
        <EnvironmentStatus user={user} />

        {/* Helpful Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Helpful Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <span>Supabase Dashboard</span>
            </a>
            
            <a
              href="https://supabase.com/docs/guides/database"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <span>Database Documentation</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DatabaseTest;
