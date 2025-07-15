import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Stethoscope, AlertTriangle } from 'lucide-react'
import { useSignUpForm } from '../../hooks/useSignUpForm'
import SignUpForm from '../../components/auth/SignUpForm'
import SignUpSuccess from '../../components/auth/SignUpSuccess'

/**
 * Refactored Sign Up Page Component
 * Reduced from 383+ lines to under 100 lines by extracting components and logic
 * Follows the 250-line rule from augment-code-rules.md
 */
const SignUp = () => {
  const {
    // State
    formData,
    errors,
    touched,
    loading,
    submitError,
    success,
    
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    handleContinue
  } = useSignUpForm()

  // Show success screen after successful registration
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <SignUpSuccess 
            email={formData.email}
            onContinue={handleContinue}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of medical students preparing for the USMLE
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3"
            data-testid="signup-error"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Registration Failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {submitError}
              </p>
            </div>
          </motion.div>
        )}

        {/* Sign Up Form */}
        <SignUpForm
          formData={formData}
          errors={errors}
          touched={touched}
          loading={loading}
          onFieldChange={handleChange}
          onFieldBlur={handleBlur}
          onSubmit={handleSubmit}
        />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp
