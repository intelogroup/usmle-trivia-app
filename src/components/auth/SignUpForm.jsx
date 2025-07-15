import React from 'react'
import { Mail, Lock, User } from 'lucide-react'
import ValidatedInput from '../ui/ValidatedInput'

/**
 * Sign Up Form Component
 * Extracted from SignUp.jsx to follow 250-line rule
 */
const SignUpForm = ({
  formData,
  errors,
  touched,
  loading,
  onFieldChange,
  onFieldBlur,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Full Name Field */}
      <ValidatedInput
        name="fullName"
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={onFieldChange}
        onBlur={onFieldBlur}
        error={errors.fullName}
        touched={touched.fullName}
        isValid={!errors.fullName && formData.fullName && touched.fullName}
        icon={User}
        disabled={loading}
        autoComplete="name"
        required
        data-testid="fullname-input"
      />

      {/* Email Field */}
      <ValidatedInput
        name="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={onFieldChange}
        onBlur={onFieldBlur}
        error={errors.email}
        touched={touched.email}
        isValid={!errors.email && formData.email && touched.email}
        icon={Mail}
        disabled={loading}
        autoComplete="email"
        required
        data-testid="email-input"
      />

      {/* Password Field */}
      <ValidatedInput
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={onFieldChange}
        onBlur={onFieldBlur}
        error={errors.password}
        touched={touched.password}
        isValid={!errors.password && formData.password && touched.password}
        icon={Lock}
        disabled={loading}
        autoComplete="new-password"
        required
        data-testid="password-input"
      />

      {/* Confirm Password Field */}
      <ValidatedInput
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={onFieldChange}
        onBlur={onFieldBlur}
        error={errors.confirmPassword}
        touched={touched.confirmPassword}
        isValid={!errors.confirmPassword && formData.confirmPassword && touched.confirmPassword}
        icon={Lock}
        disabled={loading}
        autoComplete="new-password"
        required
        data-testid="confirm-password-input"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        data-testid="signup-submit"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>
    </form>
  )
}

export default SignUpForm
