import { supabase, isConfigured } from '../../lib/supabase'
import { fetchUserProfile } from './profileService'
import logger from '../../utils/logger'

/**
 * Auth State Manager
 * Extracted from AuthContext.jsx to follow 250-line rule
 * Handles authentication state changes and session management
 */

class AuthStateManager {
  constructor() {
    this.listeners = []
    this.currentUser = null
    this.currentProfile = null
    this.isLoading = true
    this.subscription = null
  }

  // Subscribe to auth state changes
  subscribe(listener) {
    this.listeners.push(listener)
    
    // Immediately call with current state
    listener({
      user: this.currentUser,
      profile: this.currentProfile,
      loading: this.isLoading
    })

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of state changes
  notifyListeners() {
    const state = {
      user: this.currentUser,
      profile: this.currentProfile,
      loading: this.isLoading
    }

    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        logger.error('[AuthStateManager] Error in listener:', error)
      }
    })
  }

  // Initialize auth state monitoring
  initialize() {
    if (!isConfigured) {
      logger.warn('[AuthStateManager] Supabase not configured. Authentication will not work.')
      this.isLoading = false
      this.notifyListeners()
      return
    }

    this.isLoading = true
    this.notifyListeners()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await this.handleAuthStateChange(event, session)
      }
    )

    this.subscription = subscription
    return subscription
  }

  // Handle auth state changes
  async handleAuthStateChange(event, session) {
    // Add overall timeout for the entire auth state change handler
    const authTimeout = setTimeout(() => {
      logger.warn(`[AuthStateManager] Auth state change handler timeout for event: ${event}`)
      this.isLoading = false
      this.notifyListeners()
    }, 15000) // 15 second overall timeout

    try {
      logger.debug(`[AuthStateManager] Auth event: ${event}`, { session })
      const currentUser = session?.user
      this.currentUser = currentUser ?? null

      if (currentUser) {
        await this.loadUserProfile(currentUser.id, event)
      } else {
        this.currentProfile = null
      }
    } catch (error) {
      logger.error(`[AuthStateManager] Error in auth state change handler:`, {
        event,
        error: error.message,
        stack: error.stack
      })
      // Don't throw here - we want to continue even if profile fetch fails
      this.currentProfile = null
    } finally {
      clearTimeout(authTimeout)
      this.isLoading = false
      this.notifyListeners()
    }
  }

  // Load user profile
  async loadUserProfile(userId, event = 'unknown') {
    try {
      const profile = await fetchUserProfile(userId, event)
      this.currentProfile = profile
    } catch (error) {
      logger.error(`[AuthStateManager] Failed to load profile for user ${userId}:`, error)
      this.currentProfile = null
      // Don't throw - we can continue without profile
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        logger.error('[AuthStateManager] Error getting current session:', error)
        return null
      }
      return session
    } catch (error) {
      logger.error('[AuthStateManager] Failed to get current session:', error)
      return null
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        logger.error('[AuthStateManager] Error getting current user:', error)
        return null
      }
      return user
    } catch (error) {
      logger.error('[AuthStateManager] Failed to get current user:', error)
      return null
    }
  }

  // Refresh user data
  async refreshUser() {
    try {
      this.isLoading = true
      this.notifyListeners()

      const user = await this.getCurrentUser()
      this.currentUser = user

      if (user) {
        await this.loadUserProfile(user.id, 'refresh')
      } else {
        this.currentProfile = null
      }
    } catch (error) {
      logger.error('[AuthStateManager] Failed to refresh user:', error)
    } finally {
      this.isLoading = false
      this.notifyListeners()
    }
  }

  // Update profile in state
  updateProfile(profile) {
    this.currentProfile = profile
    this.notifyListeners()
  }

  // Clear auth state
  clearState() {
    this.currentUser = null
    this.currentProfile = null
    this.isLoading = false
    this.notifyListeners()
  }

  // Cleanup
  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    this.listeners = []
  }

  // Get current state
  getState() {
    return {
      user: this.currentUser,
      profile: this.currentProfile,
      loading: this.isLoading,
      isAuthenticated: !!this.currentUser,
      isConfigured
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser
  }

  // Check if user has profile
  hasProfile() {
    return !!this.currentProfile
  }

  // Get user ID
  getUserId() {
    return this.currentUser?.id || null
  }

  // Get user email
  getUserEmail() {
    return this.currentUser?.email || null
  }

  // Get username
  getUsername() {
    return this.currentProfile?.username || null
  }

  // Get full name
  getFullName() {
    return this.currentProfile?.full_name || this.currentUser?.user_metadata?.full_name || null
  }
}

// Create singleton instance
const authStateManager = new AuthStateManager()

export default authStateManager
