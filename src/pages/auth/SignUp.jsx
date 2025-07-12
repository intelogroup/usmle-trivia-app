import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowLeft, Stethoscope, CheckCircle, AlertTriangle } from 'lucide-react'
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import ValidatedInput from '../../components/ui/ValidatedInput';
import { 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword, 
  validateFullName, 
  createFormValidation 
} from '../../utils/formValidation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { isConfigured } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    fullName: (name) => validateFullName(name),
    email: (email) => validateEmail(email),
    password: (password) => validatePassword(password),
    confirmPassword: (confirmPassword) => validateConfirmPassword(formData.password, confirmPassword)
  };

  const validator = createFormValidation(validationRules);

  // Handle real-time field changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(''); // Clear submit error when user types
    
    // Validate field if it has been touched or has content
    if (touched[name] || value) {
      const validation = validator.validateField(name, value, { ...formData, [name]: value });
      setErrors(prev => ({ ...prev, [name]: validation.error }));
    }
    
    // Special handling for confirm password when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmValidation = validateConfirmPassword(value, formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmValidation.error }));
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
    console.error('SignUp error:', error);
    
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
    if (error.message.includes('User already registered') || 
        error.message.includes('already in use')) {
      setSubmitError('This email is already registered. Please use a different email or try signing in.');
      return;
    }
    
    if (error.message.includes('Password should be at least')) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }
    
    if (error.message.includes('Invalid email')) {
      setSubmitError('Please enter a valid email address.');
      return;
    }
    
    if (error.message.includes('Too many requests')) {
      setSubmitError('Too many signup attempts. Please wait a moment and try again.');
      return;
    }
    
    // Default error message
    setSubmitError(error.message || 'An error occurred during registration. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    // Validate all fields
    const { isValid, errors: validationErrors } = validator.validateAll(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
      setLoading(false);
      return;
    }

    // Additional check for empty fields and password match
    if (!formData.fullName.trim() || !formData.email || !formData.password || !formData.confirmPassword) {
      setSubmitError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authService.signUp(formData.email.trim(), formData.password, formData.fullName.trim());
      setSuccess(true);
    } catch (error) {
      handleSubmitError(error);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = formData.fullName && formData.email && formData.password && 
                     formData.confirmPassword && !errors.fullName && !errors.email && 
                     !errors.password && !errors.confirmPassword;

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
              to="/login"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              data-testid="go-to-login"
            >
              Go to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
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
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-dark-300">
            Start your USMLE preparation journey today
          </p>
        </div>

        {/* SignUp Form */}
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
                  <p className="text-xs">Please set up your .env.local file to enable registration.</p>
                </div>
              </motion.div>
            )}

            {/* Submit Error Message */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800"
                data-testid="signup-error"
              >
                {submitError}
              </motion.div>
            )}

            {/* Full Name Field */}
            <ValidatedInput
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              label="Full Name"
              icon={User}
              error={touched.fullName ? errors.fullName : ''}
              isValid={!errors.fullName && formData.fullName}
              required
              autoComplete="name"
              data-testid="fullname-input"
            />

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
              placeholder="Create a password"
              label="Password"
              icon={Lock}
              error={touched.password ? errors.password : ''}
              isValid={!errors.password && formData.password}
              required
              showPasswordToggle={true}
              autoComplete="new-password"
              data-testid="password-input"
            />

            {/* Confirm Password Field */}
            <ValidatedInput
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              label="Confirm Password"
              icon={Lock}
              error={touched.confirmPassword ? errors.confirmPassword : ''}
              isValid={!errors.confirmPassword && formData.confirmPassword}
              required
              showPasswordToggle={true}
              autoComplete="new-password"
              data-testid="confirm-password-input"
            />

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
              data-testid="signup-submit"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : !isConfigured ? (
                'Configuration Missing'
              ) : (
                'Create Account'
              )}
            </motion.button>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-expo-700">
              <p className="text-sm text-gray-600 dark:text-dark-300">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold"
                >
                  Sign In
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

export default SignUp;