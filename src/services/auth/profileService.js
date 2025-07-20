import { supabase } from '../../lib/supabase'
import { withAuthTimeout } from '../../utils/queryTimeout'
import logger from '../../utils/logger'

/**
 * Profile Service
 * Extracted from AuthContext.jsx to follow 250-line rule
 * Handles user profile operations
 */

// Fetch user profile with timeout and error handling
export const fetchUserProfile = async (userId, event = 'unknown') => {
  if (!userId) {
    logger.warn('[ProfileService] No user ID provided for profile fetch')
    return null
  }

  try {
    logger.debug(`[ProfileService] Fetching profile for user: ${userId} (event: ${event})`)
    
    const { data: profile, error } = await withAuthTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      5000, // 5 second timeout
      `profile fetch for user ${userId}`
    )

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        logger.info(`[ProfileService] Profile not found for user ${userId}, creating new profile`)
        return await createUserProfile(userId)
      } else {
        logger.error(`[ProfileService] Error fetching profile for user ${userId}:`, error)
        throw error
      }
    }

    logger.debug(`[ProfileService] Profile fetched successfully for user: ${userId}`)
    return profile
  } catch (error) {
    logger.error(`[ProfileService] Failed to fetch profile for user ${userId}:`, error)
    throw error
  }
}

// Create user profile
export const createUserProfile = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to create profile')
  }

  try {
    logger.info(`[ProfileService] Creating profile for user: ${userId}`)
    
    // Get user data from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      throw userError
    }

    const profileData = {
      id: userId,
      email: user?.email,
      display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.display_name || 'New User',
      full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      avatar_url: user?.user_metadata?.avatar_url || null,
      grade_id: user?.user_metadata?.grade_id || 1, // Default to 1st year
      total_points: 0,
      current_streak: 0,
      best_streak: 0,
      onboarding_completed: false, // They'll need to complete onboarding
      email_verified: user?.email_confirmed_at ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newProfile, error } = await withAuthTimeout(
      supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single(),
      5000,
      `profile creation for user ${userId}`
    )

    if (error) {
      logger.error(`[ProfileService] Error creating profile for user ${userId}:`, error)
      throw error
    }

    logger.info(`[ProfileService] Profile created successfully for user: ${userId}`)
    return newProfile
  } catch (error) {
    logger.error(`[ProfileService] Failed to create profile for user ${userId}:`, error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  if (!userId) {
    throw new Error('User ID is required to update profile')
  }

  try {
    logger.debug(`[ProfileService] Updating profile for user: ${userId}`, updates)
    
    const { data: updatedProfile, error } = await withAuthTimeout(
      supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single(),
      5000,
      `profile update for user ${userId}`
    )

    if (error) {
      logger.error(`[ProfileService] Error updating profile for user ${userId}:`, error)
      throw error
    }

    logger.debug(`[ProfileService] Profile updated successfully for user: ${userId}`)
    return updatedProfile
  } catch (error) {
    logger.error(`[ProfileService] Failed to update profile for user ${userId}:`, error)
    throw error
  }
}

// Delete user profile
export const deleteUserProfile = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to delete profile')
  }

  try {
    logger.info(`[ProfileService] Deleting profile for user: ${userId}`)
    
    const { error } = await withAuthTimeout(
      supabase
        .from('profiles')
        .delete()
        .eq('id', userId),
      5000,
      `profile deletion for user ${userId}`
    )

    if (error) {
      logger.error(`[ProfileService] Error deleting profile for user ${userId}:`, error)
      throw error
    }

    logger.info(`[ProfileService] Profile deleted successfully for user: ${userId}`)
    return true
  } catch (error) {
    logger.error(`[ProfileService] Failed to delete profile for user ${userId}:`, error)
    throw error
  }
}

// Check if profile exists
export const profileExists = async (userId) => {
  if (!userId) {
    return false
  }

  try {
    const { data, error } = await withAuthTimeout(
      supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single(),
      3000,
      `profile existence check for user ${userId}`
    )

    if (error && error.code !== 'PGRST116') {
      logger.error(`[ProfileService] Error checking profile existence for user ${userId}:`, error)
      return false
    }

    return !!data
  } catch (error) {
    logger.error(`[ProfileService] Failed to check profile existence for user ${userId}:`, error)
    return false
  }
}

// Get profile by username
export const getProfileByUsername = async (username) => {
  if (!username) {
    throw new Error('Username is required')
  }

  try {
    const { data: profile, error } = await withAuthTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single(),
      3000,
      `profile fetch by username ${username}`
    )

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Profile not found
      }
      throw error
    }

    return profile
  } catch (error) {
    logger.error(`[ProfileService] Failed to get profile by username ${username}:`, error)
    throw error
  }
}
