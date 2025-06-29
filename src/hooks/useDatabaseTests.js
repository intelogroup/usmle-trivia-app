import { useState, useEffect } from 'react';
import { testConnection } from '../lib/supabase';
import { QuestionService } from '../services/questionService';
import { runAllDatabaseTests } from '../utils/databaseTestFunctions';
import { runComprehensiveTest } from '../lib/supabaseSetup';

const useDatabaseTests = (user) => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [categoriesStatus, setCategoriesStatus] = useState(null);
  const [comprehensiveResults, setComprehensiveResults] = useState(null);

  useEffect(() => {
    runInitialTests();
  }, []);

  const runInitialTests = async () => {
    // Test 1: Basic connection
    try {
      const result = await testConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ success: false, message: error.message });
    }

    // Test 2: Categories fetching
    try {
      const categories = await QuestionService.fetchCategories();
      setCategoriesStatus({
        success: true,
        data: categories,
        count: categories?.length || 0,
        message: `Found ${categories?.length || 0} categories`
      });
    } catch (error) {
      setCategoriesStatus({
        success: false,
        message: error.message,
        count: 0
      });
    }
  };

  const runComprehensiveTests = async () => {
    setComprehensiveResults({ loading: true });
    try {
      const results = await runAllDatabaseTests(user?.id);
      setComprehensiveResults(results);
    } catch (error) {
      setComprehensiveResults({
        error: true,
        message: error.message
      });
    }
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

  return {
    testResults,
    isRunning,
    connectionStatus,
    categoriesStatus,
    comprehensiveResults,
    runComprehensiveTests,
    runFullTest,
    runIndividualTest
  };
};

export default useDatabaseTests;
