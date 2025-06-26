import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, AlertCircle, Play, Copy, ExternalLink } from 'lucide-react';
import { 
  runComprehensiveTest, 
  checkEnvironmentSetup,
  testBasicConnection,
  testQuestionsTable,
  testTagsTable,
  testTagQuestionCountsView,
  testQuestionFetching
} from '../lib/supabaseSetup';
import SecurityAudit from '../components/test/SecurityAudit';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [envSetup, setEnvSetup] = useState(null);

  const checkEnvironment = () => {
    const setup = checkEnvironmentSetup();
    setEnvSetup(setup);
    return setup;
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await runComprehensiveTest();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        summary: { success: false, message: `Test failed: ${error.message}` },
        tests: [],
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (testName, testFunction) => {
    setIsRunning(true);
    try {
      const result = await testFunction();
      setTestResults({
        summary: { success: result.success, message: testName },
        tests: [{ name: testName, ...result }],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResults({
        summary: { success: false, message: `${testName} failed` },
        tests: [{ name: testName, success: false, error: error.message }],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyEnvTemplate = () => {
    const template = `# USMLE Trivia App - Environment Variables
# Copy your Supabase project URL and API key here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_NAME="USMLE Trivia App"
VITE_APP_DESCRIPTION="A comprehensive USMLE trivia application"

# Optional: For development/debugging
NODE_ENV=development`;

    navigator.clipboard.writeText(template).then(() => {
      alert('Environment template copied to clipboard!');
    });
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
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-yellow-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Environment Setup
            </h2>
          </div>
          
          <button
            onClick={checkEnvironment}
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Check Environment
          </button>

          {envSetup && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Supabase URL:</span>
                  <span className="text-sm">{envSetup.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Supabase Key:</span>
                  <span className="text-sm">{envSetup.key}</span>
                </div>
              </div>
              
              {!envSetup.configured && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    ⚠️ Supabase Not Configured
                  </h3>
                  <ol className="text-sm text-red-700 dark:text-red-300 space-y-1 mb-4">
                    {envSetup.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                  <button
                    onClick={copyEnvTemplate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    <Copy size={16} />
                    Copy .env.local Template
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Test Controls */}
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
              onClick={runFullTest}
              disabled={isRunning}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Play size={16} />
              {isRunning ? 'Running...' : 'Run All Tests'}
            </button>
            
            <button
              onClick={() => runIndividualTest('Basic Connection', testBasicConnection)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Test Connection
            </button>
            
            <button
              onClick={() => runIndividualTest('Questions Table', testQuestionsTable)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Test Questions
            </button>
            
            <button
              onClick={() => runIndividualTest('Tags Table', testTagsTable)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Test Categories
            </button>
            
            <button
              onClick={() => runIndividualTest('Tag Counts View', testTagQuestionCountsView)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Test View
            </button>
            
            <button
              onClick={() => runIndividualTest('Question Fetching', () => testQuestionFetching('mixed', 2))}
              disabled={isRunning}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
            >
              Test Fetching
            </button>
          </div>
        </motion.div>

        {/* Security Audit */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <SecurityAudit />
        </motion.div>

        {/* Test Results */}
        {testResults && (
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
        )}

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
              <ExternalLink size={16} />
              <span>Supabase Dashboard</span>
            </a>
            
            <a
              href="https://supabase.com/docs/guides/database"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <ExternalLink size={16} />
              <span>Database Documentation</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DatabaseTest; 