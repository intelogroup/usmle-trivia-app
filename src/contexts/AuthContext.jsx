import { createContext, useContext, useEffect, useState } from 'react'
import { isConfigured } from '../lib/supabase'
import authStateManager from '../services/auth/authStateManager'
import { updateUserProfile } from '../services/auth/profileService'
import logger from '../utils/logger'

/**
 * Refactored Auth Context
 * Reduced from 324+ lines to under 100 lines by extracting services
 * Follows the 250-line rule from augment-code-rules.md
 */

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    profile: null,
    loading: true
  })

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authStateManager.subscribe(setAuthState)
    
    // Initialize auth state monitoring
    authStateManager.initialize()

    // Cleanup on unmount
    return () => {
      unsubscribe()
      authStateManager.cleanup()
    }
  }, [])

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!authState.user?.id) {
        throw new Error('No authenticated user')
      }

      const updatedProfile = await updateUserProfile(authState.user.id, updates)
      authStateManager.updateProfile(updatedProfile)
      
      logger.info('[AuthContext] Profile updated successfully')
      return updatedProfile
    } catch (error) {
      logger.error('[AuthContext] Failed to update profile:', error)
      throw error
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      await authStateManager.refreshUser()
      logger.debug('[AuthContext] User data refreshed')
    } catch (error) {
      logger.error('[AuthContext] Failed to refresh user:', error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      authStateManager.clearState()
      logger.info('[AuthContext] User signed out')
    } catch (error) {
      logger.error('[AuthContext] Error during sign out:', error)
      throw error
    }
  }

  const value = {
    // State
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    isAuthenticated: !!authState.user,
    isConfigured,

    // Actions
    updateProfile,
    refreshUser,
    signOut,

    // Computed values
    userId: authState.user?.id || null,
    userEmail: authState.user?.email || null,
    username: authState.profile?.username || null,
    fullName: authState.profile?.full_name || authState.user?.user_metadata?.full_name || null,
    hasProfile: !!authState.profile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
