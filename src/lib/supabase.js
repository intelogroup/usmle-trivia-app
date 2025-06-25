import { createClient } from '@supabase/supabase-js'

// Supabase configuration with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration!')
  console.log('Required environment variables:')
  console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing')
  console.log('\nPlease create a .env.local file with your Supabase credentials.')
}

// Create Supabase client with fallback values for development
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Configuration status
export const isConfigured = Boolean(supabaseUrl && supabaseKey)

// Test connection function
export const testConnection = async () => {
  if (!isConfigured) {
    return { 
      success: false, 
      message: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local' 
    }
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('Supabase connection test error:', error.message)
      return { success: false, message: `Connection error: ${error.message}` }
    }
    
    return { success: true, message: 'Supabase connected successfully!', data }
  } catch (error) {
    console.error('Supabase connection error:', error)
    return { success: false, message: `Connection failed: ${error.message}` }
  }
} 