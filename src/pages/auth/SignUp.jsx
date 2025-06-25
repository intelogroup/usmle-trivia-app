import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Stethoscope, CheckCircle, AlertTriangle } from 'lucide-react'
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { isConfigured } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!email.trim()) {
      setError('Please enter your email address')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      await authService.signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              Account Created!
            </h2>
            <p className="text-gray-600 dark:text-dark-300 mb-6">
              Please check your email to verify your account before signing in.
            </p>
            
            <Link
              to="/auth/login"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Go to Sign In
            </Link>
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
            Join USMLE Trivia
          </h1>
          <p className="text-gray-600 dark:text-dark-300">
            Start your medical exam preparation today
          </p>
        </div>

        {/* Sign Up Form */}
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
                  <p className="text-xs">Please set up your .env.local file to enable sign-up.</p>
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

            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-expo-800 border border-gray-200 dark:border-expo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 transition-all disabled:opacity-50"
                  placeholder="Enter your full name"
                  disabled={loading || !isConfigured}
                />
              </div>
            </div>

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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-expo-800 border border-gray-200 dark:border-expo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 transition-all disabled:opacity-50"
                  placeholder="Create a password"
                  disabled={loading || !isConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-200 transition-colors disabled:opacity-50"
                  disabled={loading || !isConfigured}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-expo-800 border border-gray-200 dark:border-expo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 dark:text-dark-50 placeholder-gray-400 dark:placeholder-dark-400 transition-all disabled:opacity-50"
                  placeholder="Confirm your password"
                  disabled={loading || !isConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-200 transition-colors disabled:opacity-50"
                  disabled={loading || !isConfigured}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
                ? 'Creating Account...' 
                : !isConfigured 
                ? 'Configuration Missing'
                : 'Create Account'}
            </motion.button>

            {/* Terms */}
            <p className="text-xs text-gray-500 dark:text-dark-400 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-expo-600 text-center">
            <p className="text-gray-600 dark:text-dark-300">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in here
              </Link>
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

export default SignUp
