import React, { useState } from 'react';
import { AlertCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkEnvironmentSetup } from '../../lib/supabaseSetup';

const EnvironmentSetup = ({ onCheckEnvironment }) => {
  const [envSetup, setEnvSetup] = useState(null);

  const handleCheckEnvironment = () => {
    const setup = checkEnvironmentSetup();
    setEnvSetup(setup);
    onCheckEnvironment(setup);
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
        onClick={handleCheckEnvironment}
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
  );
};

export default EnvironmentSetup;
