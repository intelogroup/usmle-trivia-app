import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Stethoscope, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { resetPassword, isConfigured } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    const { error: resetError } = await resetPassword(email)
    
    if (resetError) {
      setError(resetError)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-expo-950 dark:to-expo-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white dark:bg-expo-850 rounded-2xl p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-expo-700">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6"
            >
              <CheckCircle size={32} className="text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-50 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 dark:text-dark-300 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {email}
              </span>
            </p>
            
            <div className="space-y-4">
              <Link
                to="/auth/login"
                className="block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Sign In
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="block w-full text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 font-medium transition-colors"
              >
                Try different email
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-expo-950 dark:to-expo-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg"
          >
            <Stethoscope size={32} className="text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-50 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 dark:text-dark-300">
            No worries! Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-expo-850 rounded-2xl p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-expo-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Configuration Error Message */}
            {!isConfigured && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-4 rounded-xl text-sm font-medium border border-yellow-200 dark:border-yellow-800 flex items-center gap-3"
              >
                <AlertTriangle size={20} />
                <div>
                  <h3 className="font-bold">Supabase Not Configured</h3>
                  <p className="text-xs">Please set up your .env.local file to use this feature.</p>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-expo-800 border border-gray-200 dark:border-expo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 transition-all disabled:opacity-50"
                  placeholder="Enter your email"
                  disabled={loading || !isConfigured}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: !isConfigured || loading ? 1 : 1.02 }}
              whileTap={{ scale: !isConfigured || loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:opacity-70 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {loading 
                ? 'Sending...' 
                : !isConfigured
                ? 'Configuration Missing'
                : 'Send Reset Link'}
            </motion.button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-expo-600 text-center">
            <p className="text-sm text-gray-500 dark:text-dark-400 mb-4">
              Remember your password?{' '}
              <Link
                to="/auth/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
            
            <p className="text-xs text-gray-400 dark:text-dark-500">
              Didn't receive an email? Check your spam folder or contact support
            </p>
          </div>
        </motion.div>

        {/* Back to Welcome */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Link
            to="/auth/welcome"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to welcome</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword 