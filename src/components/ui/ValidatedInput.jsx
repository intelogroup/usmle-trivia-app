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
      w-full px-4 py-3 rounded-xl border transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      dark:bg-gray-800 dark:border-gray-600
      ${Icon ? 'pl-12' : ''}
      ${showPasswordToggle || showValidation ? 'pr-12' : ''}
      ${className}
    `;

    if (error) {
      classes += ' border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20';
    } else if (isValid && hasValue) {
      classes += ' border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20';
    } else if (isFocused) {
      classes += ' border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-blue-50 dark:bg-blue-900/20';
    } else {
      classes += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white';
    }

    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    }

    return classes;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        {/* Input */}
        <input
          type={inputType}
          name={name}
          id={name}
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
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          aria-required={required}
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
            id={`${name}-error`}
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
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
            className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-1"
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