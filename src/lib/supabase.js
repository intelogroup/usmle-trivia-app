import { createClient } from '@supabase/supabase-js'

// Supabase configuration with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing');
  console.error('URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('KEY:', supabaseKey ? 'OK' : 'MISSING');
  console.error('Using publishable key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'YES' : 'NO');
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
    // Temporarily disable proxy to debug authentication issue
    // global: {
    //   // Use the proxy path for development to bypass CORS
    //   fetch: (url, options) => {
    //     if (url.startsWith(supabaseUrl)) {
    //       const newUrl = url.replace(supabaseUrl, '/supabase');
    //       return fetch(newUrl, options);
    //     }
    //     return fetch(url, options);
    //   }
    // }
  }
)

// Configuration status
export const isConfigured = Boolean(supabaseUrl && supabaseKey)

// Test function to verify connection
export const testConnection = async () => {
  try {
    console.log('🔍 [Supabase] Testing database connection...');
    console.log('🌐 [Supabase] URL:', supabaseUrl);
    console.log('🔑 [Supabase] Key present:', !!supabaseKey);
    
    // Simple test query
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ [Supabase] Connection test failed:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`,
        details: error
      };
    }
    
    console.log('✅ [Supabase] Connection test successful');
    console.log('📊 [Supabase] Sample data:', data);
    
    return {
      success: true,
      message: 'Database connection successful',
      data: data
    };
  } catch (error) {
    console.error('💥 [Supabase] Connection test exception:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      details: error
    };
  }
}

// Run test on module load in development
if (import.meta.env.DEV) {
  testConnection().then(result => {
    if (result.success) {
      console.log('🎉 [Supabase] Database ready!');
    } else {
      console.error('🚨 [Supabase] Database connection failed on startup');
    }
  });
}
