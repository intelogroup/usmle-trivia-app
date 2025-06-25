import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { authService } from '../services/authService';

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
    const initAuth = async () => {
      if (!isConfigured) {
        console.warn('Supabase not configured. Authentication will not work.')
        setLoading(false)
        return
      }

      // Get initial session and then listen for auth changes
      await getInitialSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }

    initAuth()
  }, [])

  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error getting initial session:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId) => {
    console.log('🔍 [AuthContext] Fetching user profile for ID:', userId)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          countries (name, flag_emoji),
          achievement_grades (name, icon_color)
        `)
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ [AuthContext] Error in initial profile fetch:', {
          error,
          userId,
          code: error.code,
          message: error.message,
          details: error.details
        })
        throw error
      }
      
      // If no profile exists, create one
      if (!data) {
        console.warn('⚠️ [AuthContext] No profile found for user, attempting to create...', userId)
        await createUserProfile(userId)
        
        // Retry fetching the profile after creation
        console.log('🔄 [AuthContext] Retrying profile fetch after creation...')
        const { data: newProfile, error: fetchError } = await supabase
          .from('profiles')
          .select(`
            *,
            countries (name, flag_emoji),
            achievement_grades (name, icon_color)
          `)
          .eq('id', userId)
          .maybeSingle()
        
        if (fetchError) {
          console.error('❌ [AuthContext] Error in retry profile fetch:', {
            error: fetchError,
            userId,
            code: fetchError.code,
            message: fetchError.message
          })
          throw fetchError
        }
        
        if (newProfile) {
          console.log('✅ [AuthContext] Profile successfully created and fetched:', {
            userId,
            profileId: newProfile.id,
            email: newProfile.email
          })
        } else {
          console.error('❌ [AuthContext] Profile creation appeared to succeed but profile still not found')
        }
        
        setProfile(newProfile)
      } else {
        console.log('✅ [AuthContext] Profile found and loaded:', {
          userId,
          profileId: data.id,
          email: data.email,
          hasCountry: !!data.countries,
          hasGrade: !!data.achievement_grades
        })
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ [AuthContext] Critical error in fetchUserProfile:', {
        error,
        userId,
        errorType: error.constructor.name,
        stack: error.stack
      })
      // Set profile to null if there's an error to prevent infinite loops
      setProfile(null)
    }
  }

  const createUserProfile = async (userId) => {
    console.log('🏗️ [AuthContext] Creating user profile for:', userId)
    
    try {
      // Get user data from auth
      console.log('🔐 [AuthContext] Getting authenticated user data...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ [AuthContext] Error getting authenticated user:', userError)
        throw userError
      }
      
      if (!user) {
        const error = new Error('No authenticated user found')
        console.error('❌ [AuthContext] No authenticated user:', error)
        throw error
      }

      console.log('✅ [AuthContext] Authenticated user found:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      })

      // Try using RPC call to create profile instead of direct insert
      console.log('🔧 [AuthContext] Attempting to manually trigger profile creation...')
      
      // First, let's try to call the database function directly
      const { error: rpcError } = await supabase.rpc('create_user_profile_manual', {
        user_id: userId,
        user_email: user.email,
        user_display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        user_full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      })

      if (rpcError) {
        console.warn('⚠️ [AuthContext] RPC function not available, trying direct insert with SECURITY DEFINER context...')
        
        // Get default country (US)
        console.log('🌍 [AuthContext] Getting default country...')
        const { data: defaultCountry, error: countryError } = await supabase
          .from('countries')
          .select('id')
          .eq('code', 'US')
          .maybeSingle()

        if (countryError) {
          console.error('❌ [AuthContext] Error getting default country:', countryError)
        }

        console.log('🏠 [AuthContext] Default country found:', defaultCountry)

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

        console.log('📝 [AuthContext] Attempting profile insert with data:', profileData)

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)

        if (insertError) {
          console.error('❌ [AuthContext] Profile insert failed:', {
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

      console.log('✅ [AuthContext] Profile created successfully for user:', userId)
    } catch (error) {
      console.error('❌ [AuthContext] Critical error creating profile:', {
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
    refreshProfile: () => user && fetchUserProfile(user.id),
    isConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
