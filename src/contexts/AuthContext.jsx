import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import logger from '../utils/logger';
import { withAuthTimeout } from '../utils/queryTimeout';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!isConfigured) {
      logger.warn('Supabase not configured. Authentication will not work.')
      setLoading(false)
      return
    }

    setLoading(true)
    
    // The listener will handle setting user and profile
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Add overall timeout for the entire auth state change handler
      const authTimeout = setTimeout(() => {
        logger.warn(`[AuthContext:onAuthStateChange] Auth state change handler timeout for event: ${event}`)
        setLoading(false)
      }, 15000) // 15 second overall timeout

      try {
        logger.debug(`[AuthContext:onAuthStateChange] Auth event: ${event}`, { session })
        const currentUser = session?.user
        setUser(currentUser ?? null)

        if (currentUser) {
          await fetchUserProfile(currentUser.id, event)
        } else {
          setProfile(null)
        }
      } catch (error) {
        logger.error(`[AuthContext:onAuthStateChange] Error in auth state change handler:`, {
          error,
          event,
          message: error.message
        })
        // Ensure we don't get stuck in loading state
        setProfile(null)
      } finally {
        // Clear the timeout and always set loading to false
        clearTimeout(authTimeout)
        setLoading(false)
      }
    })

    // Manually trigger the initial check
    getInitialSession()

    return () => {
      subscription?.unsubscribe()
    }
  }, [])


  // This function now just triggers the initial auth state check.
  // The onAuthStateChange listener will handle the result.
  const getInitialSession = async () => {
    try {
      logger.debug('[AuthContext:getInitialSession] Triggering initial session check...')
      // This will trigger onAuthStateChange if a session exists
      await supabase.auth.getSession()
    } catch (error) {
      logger.error('[AuthContext:getInitialSession] Error triggering initial session check:', {
        error,
        message: error.message
      })
      setLoading(false) // Ensure loading is false on error
    }
  }


  const fetchUserProfile = async (userId, context = 'unknown') => {
    if (!userId) {
      logger.error(`[AuthContext:fetchUserProfile] Called with undefined/null userId (context: ${context})`)
      return null
    }
    logger.debug(`[AuthContext:fetchUserProfile] Fetching user profile for ID: ${userId} (context: ${context})`)

    try {
      return await withAuthTimeout(async () => {
        // Simplified query without complex joins to avoid hanging
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (error) {
          logger.error(`[AuthContext:fetchUserProfile] Error in initial profile fetch (context: ${context}):`, {
            error,
            userId,
            code: error.code,
            message: error.message,
            details: error.details
          })
          if (error.code === 'PGRST116') {
            logger.warn(`[AuthContext:fetchUserProfile] No profile found for user (context: ${context})`, { userId })
            setProfile(null)
            return null
          } else if (error.code === 'PGRST301' || error.code === '42501') {
            logger.error(`[AuthContext:fetchUserProfile] Permission denied (RLS) (context: ${context})`, { userId })
            setProfile(null)
            return null
          } else {
            throw error
          }
        }
      if (!data) {
        logger.warn(`[AuthContext:fetchUserProfile] No profile found for user, attempting to create... (context: ${context})`, userId)
        await createUserProfile(userId)
        logger.debug(`[AuthContext:fetchUserProfile] Retrying profile fetch after creation... (context: ${context})`)
        const retryQueryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        const { data: newProfile, error: fetchError } = await Promise.race([
          retryQueryPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Retry fetch timeout')), 10000))
        ])
        if (fetchError) {
          logger.error(`[AuthContext:fetchUserProfile] Error in retry profile fetch (context: ${context}):`, {
            error: fetchError,
            userId,
            code: fetchError.code,
            message: fetchError.message
          })
          if (fetchError.code === 'PGRST116') {
            logger.warn(`[AuthContext:fetchUserProfile] No profile found for user after creation (context: ${context})`, { userId })
            setProfile(null)
            return null
          } else if (fetchError.code === 'PGRST301' || fetchError.code === '42501') {
            logger.error(`[AuthContext:fetchUserProfile] Permission denied (RLS) after creation (context: ${context})`, { userId })
            setProfile(null)
            return null
          } else {
            throw fetchError
          }
        }
        if (newProfile) {
          logger.info(`[AuthContext:fetchUserProfile] Profile successfully created and fetched (context: ${context}):`, {
            userId,
            profileId: newProfile.id,
            email: newProfile.email
          })
        } else {
          logger.error(`[AuthContext:fetchUserProfile] Profile creation appeared to succeed but profile still not found (context: ${context})`)
        }
        setProfile(newProfile)
        return newProfile
      } else {
        logger.info(`[AuthContext:fetchUserProfile] Profile found and loaded (context: ${context}):`, {
          userId,
          profileId: data.id,
          email: data.email,
          hasCountry: !!data.countries,
          hasGrade: !!data.achievement_grades
        })
        setProfile(data)
        return data
      }
      }, {
        queryType: `profile-${context}`,
        fallback: null
      });
    } catch (error) {
      const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
      logger.error(
        `[AuthContext:fetchUserProfile] Unexpected error (context: ${context}): errorString=${errorString}`,
        {
          error,
          userId,
          errorType: error.constructor?.name,
          message: error.message,
          code: error.code,
          details: error.details,
          stack: error.stack
        }
      );
      setProfile(null)
      return null
    }
  }

  const createUserProfile = async (userId) => {
    logger.debug('[AuthContext] Creating user profile for:', userId)
    
    try {
      // Get user data from auth
      logger.debug('[AuthContext] Getting authenticated user data...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        logger.error('[AuthContext] Error getting authenticated user:', userError)
        throw userError
      }
      
      if (!user) {
        const error = new Error('No authenticated user found')
        logger.error('[AuthContext] No authenticated user:', error)
        throw error
      }

      logger.info('[AuthContext] Authenticated user found:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      })

      // Try using RPC call to create profile instead of direct insert
      logger.debug('[AuthContext] Attempting to manually trigger profile creation...')
      
      // First, let's try to call the database function directly
      const { error: rpcError } = await supabase.rpc('create_user_profile_manual', {
        user_id: userId,
        user_email: user.email,
        user_display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        user_full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      })

      if (rpcError) {
        logger.warn('[AuthContext] RPC function not available, trying direct insert with SECURITY DEFINER context...')
        
        // Get default country (US)
        logger.debug('[AuthContext] Getting default country...')
        const { data: defaultCountry, error: countryError } = await supabase
          .from('countries')
          .select('id')
          .eq('code', 'US')
          .maybeSingle()

        if (countryError) {
          logger.error('[AuthContext] Error getting default country:', countryError)
        }

        logger.debug('[AuthContext] Default country found:', defaultCountry)

        // Create the profile with INSERT policy bypass attempt
        const profileData = {
          id: userId,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          country_id: defaultCountry?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        logger.debug('[AuthContext] Attempting profile insert with data:', profileData)

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)

        if (insertError) {
          logger.error('[AuthContext] Profile insert failed:', {
            error: insertError,
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            profileData
          })
          throw insertError
        }
      }

      logger.info('[AuthContext] Profile created successfully for user:', userId)
    } catch (error) {
      logger.error('[AuthContext] Critical error creating profile:', {
        error,
        userId,
        errorType: error.constructor.name,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      })
      throw error
    }
  }

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile: () => user?.id ? fetchUserProfile(user.id, 'refreshProfile') : logger.warn('[AuthContext:refreshProfile] Tried to refresh profile with missing user id'),
    isConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>

  )
}
