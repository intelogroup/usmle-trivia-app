import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Sign Up Success Component
 * Shows success message after successful registration
 */
const SignUpSuccess = ({ email, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to USMLE Trivia! Your account has been created.
        </p>
      </div>

      {/* Email Confirmation Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Check your email
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              We've sent a confirmation email to <strong>{email}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          data-testid="continue-to-dashboard"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <Link
          to="/login"
          className="block w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 transition-colors duration-200"
          data-testid="go-to-login"
        >
          Sign in instead
        </Link>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>Didn't receive the email? Check your spam folder.</p>
        <p>You can still access your account without email confirmation.</p>
      </div>
    </motion.div>
  )
}

export default SignUpSuccess
