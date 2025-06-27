import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Stethoscope, AlertTriangle } from 'lucide-react'
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await authService.signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-dark-300">
            Continue your USMLE preparation journey
          </p>
        </div>

        {/* Login Form */}
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
                  <p className="text-xs">Please set up your .env.local file to enable sign-in.</p>
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
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Forgot your password?
              </Link>
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
                ? 'Signing In...' 
                : !isConfigured 
                ? 'Configuration Missing'
                : 'Sign In'}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-expo-600 text-center">
            <p className="text-gray-600 dark:text-dark-300">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Sign up here
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
            to="/welcome"
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

export default Login
