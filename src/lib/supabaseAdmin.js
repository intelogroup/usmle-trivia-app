import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client for Backend Operations
 * Uses secret key for admin operations like user management
 * 
 * ⚠️ IMPORTANT: This should only be used in server-side/backend contexts
 * Never expose the secret key in frontend code
 */

// Only initialize admin client if secret key is available (backend context)
let supabaseAdmin = null;

// Check if we're in a server/node environment and have the secret key
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta?.env?.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (supabaseSecretKey && supabaseUrl) {
  console.log('🔧 Initializing Supabase Admin client...');
  
  supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-application-name': 'usmle-trivia-admin',
        'x-client-info': 'supabase-admin-js'
      }
    }
  });
  
  console.log('✅ Supabase Admin client initialized');
} else {
  console.warn('⚠️ Supabase Admin client not initialized - missing secret key or URL');
}

/**
 * Admin User Management Functions
 */
export const adminUserOperations = {
  
  /**
   * Create a new user with admin privileges
   */
  async createUser({ email, password, userData = {} }) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: userData.fullName || userData.full_name,
          display_name: userData.displayName || userData.display_name || userData.fullName,
          ...userData
        }
      });

      if (error) throw error;

      console.log(`✅ User created successfully: ${email}`);
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error(`❌ Failed to create user ${email}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) throw error;
      
      const user = users.find(u => u.email === email);
      return { success: true, user: user || null };
      
    } catch (error) {
      console.error(`❌ Failed to get user ${email}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user metadata
   */
  async updateUser(userId, updates) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
      
      if (error) throw error;
      
      console.log(`✅ User updated successfully: ${userId}`);
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error(`❌ Failed to update user ${userId}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      console.log(`✅ User deleted successfully: ${userId}`);
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Failed to delete user ${userId}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * List all users
   */
  async listUsers(page = 1, perPage = 50) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (error) throw error;
      
      return { success: true, users };
      
    } catch (error) {
      console.error('❌ Failed to list users:', error.message);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Admin Database Operations
 */
export const adminDatabaseOperations = {
  
  /**
   * Create user profile
   */
  async createUserProfile(userId, profileData) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Profile created for user: ${userId}`);
      return { success: true, profile: data };
      
    } catch (error) {
      console.error(`❌ Failed to create profile for ${userId}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Initialize user stats
   */
  async initializeUserStats(userId) {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('user_stats')
        .insert({
          user_id: userId,
          total_quizzes_completed: 0,
          total_questions_answered: 0,
          total_correct_answers: 0,
          overall_accuracy: 0.0,
          current_streak: 0,
          longest_streak: 0,
          total_study_time_minutes: 0,
          favorite_category: null,
          last_quiz_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Stats initialized for user: ${userId}`);
      return { success: true, stats: data };
      
    } catch (error) {
      console.error(`❌ Failed to initialize stats for ${userId}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get database health status
   */
  async checkDatabaseHealth() {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }

    const checks = {};

    try {
      // Test questions table
      const { data: questions, error: questionsError } = await supabaseAdmin
        .from('questions')
        .select('count')
        .limit(1);
      
      checks.questions = questionsError ? { healthy: false, error: questionsError.message } : { healthy: true };

      // Test tags table
      const { data: tags, error: tagsError } = await supabaseAdmin
        .from('tags')
        .select('count')
        .limit(1);
      
      checks.tags = tagsError ? { healthy: false, error: tagsError.message } : { healthy: true };

      // Test profiles table
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);
      
      checks.profiles = profilesError ? { healthy: false, error: profilesError.message } : { healthy: true };

      // Test user_stats table
      const { data: stats, error: statsError } = await supabaseAdmin
        .from('user_stats')
        .select('count')
        .limit(1);
      
      checks.user_stats = statsError ? { healthy: false, error: statsError.message } : { healthy: true };

      const allHealthy = Object.values(checks).every(check => check.healthy);

      return {
        success: true,
        healthy: allHealthy,
        checks,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Test admin connection
 */
export const testAdminConnection = async () => {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: 'Admin client not initialized - missing secret key'
    };
  }

  try {
    console.log('🔍 Testing admin connection...');
    
    // Test admin auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    if (authError) {
      throw new Error(`Admin auth test failed: ${authError.message}`);
    }

    // Test database access
    const healthCheck = await adminDatabaseOperations.checkDatabaseHealth();
    
    console.log('✅ Admin connection test successful');
    return {
      success: true,
      message: 'Admin client working correctly',
      userCount: users?.length || 0,
      databaseHealth: healthCheck
    };
    
  } catch (error) {
    console.error('❌ Admin connection test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export admin client (only if available)
export { supabaseAdmin };

// Default export with all operations
export default {
  client: supabaseAdmin,
  users: adminUserOperations,
  database: adminDatabaseOperations,
  testConnection: testAdminConnection
};