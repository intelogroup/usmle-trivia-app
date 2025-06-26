import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProgressManager } from '../../lib/userProgressManager';

const SecurityAudit = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [auditResults, setAuditResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSecurityAudit = async () => {
    if (!user) {
      setAuditResults({
        error: 'User not authenticated',
        tests: []
      });
      return;
    }

    setLoading(true);
    const results = {
      error: null,
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    try {
      const progressManager = createUserProgressManager(user.id);

      // Test 1: User Data Isolation
      results.tests.push(await testUserDataIsolation(user.id));

      // Test 2: RLS Policies
      results.tests.push(await testRLSPolicies(user.id));

      // Test 3: Progress Manager Security
      const progressTest = await progressManager.performSecurityAudit();
      results.tests.push({
        name: 'Progress Manager Security',
        status: progressTest.rlsPoliciesWorking && !progressTest.dataLeakageDetected ? 'passed' : 'failed',
        message: progressTest.errors.length > 0 ? progressTest.errors.join(', ') : 'All security checks passed',
        details: progressTest
      });

      // Calculate summary
      results.tests.forEach(test => {
        if (test.status === 'passed') results.summary.passed++;
        else if (test.status === 'failed') results.summary.failed++;
        else results.summary.warnings++;
      });

    } catch (error) {
      results.error = error.message;
    }

    setAuditResults(results);
    setLoading(false);
  };

  const testUserDataIsolation = async (userId) => {
    try {
      // Test: Try to access own data (should succeed)
      const { data: ownData, error: ownError } = await supabase
        .from('user_question_history')
        .select('user_id, question_id')
        .eq('user_id', userId)
        .limit(1);

      if (ownError && ownError.code !== 'PGRST116') { // PGRST116 = no rows found
        return {
          name: 'User Data Access',
          status: 'failed',
          message: `Cannot access own data: ${ownError.message}`,
          details: { error: ownError }
        };
      }

      return {
        name: 'User Data Access',
        status: 'passed',
        message: 'User can access their own data correctly',
        details: { recordsFound: ownData?.length || 0 }
      };
    } catch (error) {
      return {
        name: 'User Data Access',
        status: 'failed',
        message: `Error testing user data access: ${error.message}`,
        details: { error }
      };
    }
  };

  const testRLSPolicies = async (userId) => {
    try {
      // Test: Try to access other users' data (should fail or return empty)
      const { data: otherData, error: otherError } = await supabase
        .from('user_question_history')
        .select('user_id')
        .neq('user_id', userId)
        .limit(1);

      // If we get data back, RLS is not working properly
      if (otherData && otherData.length > 0) {
        return {
          name: 'RLS Policy Enforcement',
          status: 'failed',
          message: 'CRITICAL: Can access other users\' data! RLS policies are not working.',
          details: { 
            dataLeakage: true,
            recordsExposed: otherData.length,
            exposedUserIds: otherData.map(d => d.user_id)
          }
        };
      }

      return {
        name: 'RLS Policy Enforcement',
        status: 'passed',
        message: 'RLS policies are working correctly - cannot access other users\' data',
        details: { dataLeakage: false }
      };
    } catch (error) {
      // If we get an error, that might actually be good (RLS blocking access)
      if (error.message.includes('insufficient privileges') || error.code === '42501') {
        return {
          name: 'RLS Policy Enforcement',
          status: 'passed',
          message: 'RLS policies are enforcing access restrictions correctly',
          details: { rlsBlocked: true }
        };
      }

      return {
        name: 'RLS Policy Enforcement',
        status: 'warning',
        message: `Unexpected error testing RLS: ${error.message}`,
        details: { error }
      };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Security Audit</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>Security Audit Tests:</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>User data isolation - Verifies you can access your own data</li>
              <li>Row Level Security (RLS) policies - Ensures you cannot access other users' data</li>
              <li>Progress manager security - Comprehensive security verification</li>
            </ul>
          </div>

          <button
            onClick={runSecurityAudit}
            disabled={loading || !user}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Security Audit...' : 'Run Security Audit'}
          </button>

          {auditResults && (
            <div className="mt-6 space-y-4">
              {auditResults.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">Audit Error:</p>
                  <p className="text-red-700">{auditResults.error}</p>
                </div>
              )}

              {auditResults.summary && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{auditResults.summary.passed}</div>
                    <div className="text-sm text-green-700">Passed</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{auditResults.summary.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{auditResults.summary.warnings}</div>
                    <div className="text-sm text-yellow-700">Warnings</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {auditResults.tests?.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(test.status)}
                      <h4 className="font-medium">{test.name}</h4>
                    </div>
                    <p className="text-sm mb-2">{test.message}</p>
                    {test.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecurityAudit; 