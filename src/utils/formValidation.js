/**
 * Real-time Form Validation Utilities
 * Provides validation functions for real-time form feedback
 */

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: '' }; // Don't show error for empty field initially
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: '' }; // Don't show error for empty field initially
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  // Additional password strength checks
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      isValid: false, 
      error: 'Password should contain both letters and numbers',
      level: 'weak'
    };
  }
  
  return { isValid: true, error: '', level: 'strong' };
};

/**
 * Confirm password validation
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: '' }; // Don't show error for empty field initially
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Full name validation
 */
export const validateFullName = (name) => {
  if (!name) {
    return { isValid: false, error: '' }; // Don't show error for empty field initially
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Required field validation
 */
export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Form validation helper
 * Creates validation functions for use in components
 */
export const createFormValidation = (validationRules) => {
  return {
    validateField: (name, value, allValues = {}) => {
      if (validationRules[name]) {
        return validationRules[name](value, allValues);
      }
      return { isValid: true, error: '' };
    },
    
    validateAll: (values) => {
      const errors = {};
      let isValid = true;
      
      Object.keys(validationRules).forEach(name => {
        const validation = validationRules[name](values[name], values);
        if (!validation.isValid) {
          errors[name] = validation.error;
          isValid = false;
        }
      });
      
      return { isValid, errors };
    }
  };
};