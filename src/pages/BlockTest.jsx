import React, { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BlockTestSetup = lazy(() => import('../components/quiz/BlockTestSetup'));
const BlockTestRunner = lazy(() => import('../components/quiz/BlockTestRunner'));
const BlockTestResults = lazy(() => import('../components/quiz/BlockTestResults'));

const BlockTest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // 'setup' | 'runner' | 'results'
  const [session, setSession] = useState(null); // Block test session object
  const [results, setResults] = useState(null); // Final results object

  // Handlers for step transitions
  const handleSetupComplete = (sessionData) => {
    setSession(sessionData);
    setStep('runner');
  };
  const handleTestComplete = (resultsData) => {
    setResults(resultsData);
    setStep('results');
  };
  const handleRestart = () => {
    setSession(null);
    setResults(null);
    setStep('setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-yellow-900/20 dark:to-amber-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors mr-4"
              aria-label="Back to previous page"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🟡 Block Test
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Full exam simulation
              </p>
            </div>
          </div>

          {/* Main Block Test Flow */}
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            {step === 'setup' && (
              <BlockTestSetup onComplete={handleSetupComplete} />
            )}
            {step === 'runner' && session && (
              <BlockTestRunner session={session} onComplete={handleTestComplete} />
            )}
            {step === 'results' && results && (
              <BlockTestResults results={results} onRestart={handleRestart} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default BlockTest; 