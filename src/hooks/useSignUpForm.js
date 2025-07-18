import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import { 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword, 
  validateFullName, 
  createFormValidation 
} from '../utils/formValidation'
import logger from '../utils/logger'

/**
 * Custom hook for Sign Up form logic
 * Extracted from SignUp.jsx to follow 250-line rule
 */
export const useSignUpForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const { isConfigured } = useAuth()
  const navigate = useNavigate()

  // Validation rules
  const validationRules = {
    fullName: (name) => validateFullName(name),
    email: (email) => validateEmail(email),
    password: (password) => validatePassword(password),
    confirmPassword: (confirmPassword) => validateConfirmPassword(formData.password, confirmPassword)
  }

  const validator = createFormValidation(validationRules)

  // Handle real-time field changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setSubmitError('') // Clear submit error when user types
    
    // Validate field if it has been touched or has content
    if (touched[name] || value) {
      const validation = validator.validateField(name, value, { ...formData, [name]: value })
      setErrors(prev => ({ ...prev, [name]: validation.error }))
    }
  }

  // Handle field blur (when user leaves field)
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate field on blur
    const validation = validator.validateField(name, formData[name], formData)
    setErrors(prev => ({ ...prev, [name]: validation.error }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      // Validate all fields
      const validation = validator.validateForm(formData)
      
      if (!validation.isValid) {
        setErrors(validation.errors)
        setTouched({
          fullName: true,
          email: true,
          password: true,
          confirmPassword: true
        })
        throw new Error('Please fix the errors above')
      }

      // Check if auth is configured
      if (!isConfigured) {
        throw new Error('Authentication service is not configured. Please check your environment variables.')
      }

      // Attempt to sign up
      logger.info('Attempting user registration', { email: formData.email })
      
      const { user, error } = await authService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName
      })

      if (error) {
        throw error
      }

      if (!user) {
        throw new Error('Registration failed - no user returned')
      }

      logger.info('User registration successful', { 
        userId: user.id, 
        email: user.email 
      })

      setSuccess(true)

    } catch (error) {
      logger.error('Registration failed', error)
      
      // Handle specific error types
      if (error.message?.includes('already registered')) {
        setSubmitError('An account with this email already exists. Please sign in instead.')
      } else if (error.message?.includes('Invalid email')) {
        setSubmitError('Please enter a valid email address.')
      } else if (error.message?.includes('Password')) {
        setSubmitError('Password does not meet requirements.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setSubmitError('Network error. Please check your connection and try again.')
      } else {
        setSubmitError(error.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle success continue
  const handleContinue = () => {
    navigate('/')
  }

  // Check if form is valid
  const isFormValid = () => {
    const validation = validator.validateForm(formData)
    return validation.isValid
  }

  return {
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
    handleContinue,
    
    // Computed
    isFormValid: isFormValid()
  }
}
