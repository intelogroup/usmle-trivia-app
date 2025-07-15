import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Validated Input Component
 * Provides real-time validation feedback with animations
 */
const ValidatedInput = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  icon: Icon,
  error,
  isValid,
  touched,
  required = false,
  disabled = false,
  className = '',
  showPasswordToggle = false,
  autoComplete,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value && value.toString().trim().length > 0;
  const showValidation = hasValue || error;
  
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const getValidationIcon = () => {
    if (!showValidation) return null;
    
    if (error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (isValid && hasValue) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return null;
  };

  const getInputClasses = () => {
    let classes = `
      w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-base font-medium
      focus:outline-none focus:ring-4 focus:ring-offset-2
      dark:bg-gray-700 dark:border-gray-500 dark:text-white
      placeholder:text-gray-500 dark:placeholder:text-gray-400
      ${Icon ? 'pl-12' : ''}
      ${showPasswordToggle || showValidation ? 'pr-12' : ''}
      ${className}
    `;

    if (error) {
      classes += ' border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100';
    } else if (isValid && hasValue) {
      classes += ' border-green-400 focus:border-green-500 focus:ring-green-200 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100';
    } else if (isFocused) {
      classes += ' border-blue-400 focus:border-blue-500 focus:ring-blue-200 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100';
    } else {
      classes += ' border-gray-400 focus:border-blue-500 focus:ring-blue-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
    }

    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    }

    return classes;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
          {label}
          {required && <span className="text-red-600 ml-1 font-bold">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        
        {/* Input */}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => {
            setIsFocused(false);
            onBlur && onBlur(name);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={getInputClasses()}
          {...props}
        />
        
        {/* Password Toggle or Validation Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
          {type === 'password' && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          
          {getValidationIcon()}
        </div>
      </div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-red-700 dark:text-red-300 flex items-center space-x-1 font-bold"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success Message */}
      <AnimatePresence>
        {isValid && hasValue && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-green-700 dark:text-green-300 flex items-center space-x-1 font-bold"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Looks good!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ValidatedInput;