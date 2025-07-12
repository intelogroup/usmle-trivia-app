import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, Stethoscope, AlertTriangle } from 'lucide-react'
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import ValidatedInput from '../../components/ui/ValidatedInput';
import { validateEmail, validateRequired, createFormValidation } from '../../utils/formValidation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { isConfigured } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    email: (email) => validateEmail(email),
    password: (password) => validateRequired(password, 'Password')
  };

  const validator = createFormValidation(validationRules);

  // Handle real-time field changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(''); // Clear submit error when user types
    
    // Validate field if it has been touched or has content
    if (touched[name] || value) {
      const validation = validator.validateField(name, value, formData);
      setErrors(prev => ({ ...prev, [name]: validation.error }));
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const validation = validator.validateField(name, formData[name], formData);
    setErrors(prev => ({ ...prev, [name]: validation.error }));
  };

  // Enhanced error handling for JSON parsing and network issues
  const handleSubmitError = (error) => {
    console.error('Login error:', error);
    
    // Handle JSON parsing errors
    if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
      setSubmitError('Server communication error. Please try again.');
      return;
    }
    
    // Handle network errors
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      setSubmitError('Network error. Please check your connection and try again.');
      return;
    }
    
    // Handle specific auth errors
    if (error.message.includes('Invalid login credentials')) {
      setSubmitError('Invalid email or password. Please check your credentials.');
      return;
    }
    
    if (error.message.includes('Email not confirmed')) {
      setSubmitError('Please verify your email address before signing in.');
      return;
    }
    
    if (error.message.includes('Too many requests')) {
      setSubmitError('Too many login attempts. Please wait a moment and try again.');
      return;
    }
    
    // Default error message
    setSubmitError(error.message || 'An error occurred during sign in. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    // Validate all fields
    const { isValid, errors: validationErrors } = validator.validateAll(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      setTouched({ email: true, password: true });
      setLoading(false);
      return;
    }

    // Additional check for empty fields (final validation)
    if (!formData.email || !formData.password) {
      setSubmitError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await authService.signIn(formData.email.trim(), formData.password);
      navigate('/');
    } catch (error) {
      handleSubmitError(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = formData.email && formData.password && 
                     !errors.email && !errors.password;

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
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

            {/* Submit Error Message */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800"
                data-testid="login-error"
              >
                {submitError}
              </motion.div>
            )}

            {/* Email Field */}
            <ValidatedInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              label="Email Address"
              icon={Mail}
              error={touched.email ? errors.email : ''}
              isValid={!errors.email && formData.email}
              required
              autoComplete="email"
              data-testid="email-input"
            />

            {/* Password Field */}
            <ValidatedInput
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              label="Password"
              icon={Lock}
              error={touched.password ? errors.password : ''}
              isValid={!errors.password && formData.password}
              required
              showPasswordToggle={true}
              autoComplete="current-password"
              data-testid="password-input"
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !isConfigured || !isFormValid}
              whileHover={!loading && isConfigured && isFormValid ? { scale: 1.02 } : {}}
              whileTap={!loading && isConfigured && isFormValid ? { scale: 0.98 } : {}}
              className={`
                w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-200
                ${loading || !isConfigured || !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                }
              `}
              data-testid="login-submit"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : !isConfigured ? (
                'Configuration Missing'
              ) : (
                'Sign In'
              )}
            </motion.button>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-expo-700">
              <p className="text-sm text-gray-600 dark:text-dark-300">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;