#!/usr/bin/env node

/**
 * Setup Test User with Secret Key for USMLE Trivia App
 * This script uses the secret key for admin operations to set up the test user
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const testUserEmail = process.env.TEST_USER_EMAIL || 'jimkalinov@gmail.com';
const testUserPassword = process.env.TEST_USER_PW || 'Jimkali90#';

console.log('🎯 USMLE Trivia App - Test User Setup with Secret Key\n');

// Validate environment variables
if (!supabaseUrl || !supabaseSecretKey || !supabasePublishableKey) {
  console.error('❌ Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SECRET_KEY:', supabaseSecretKey ? '✅' : '❌');
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY:', supabasePublishableKey ? '✅' : '❌');
  process.exit(1);
}

// Create admin client with secret key
const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create client with publishable key for testing
const supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

async function testAdminConnection() {
  console.log('🔍 Testing admin connection with secret key...');
  
  try {
    // Test admin auth capabilities
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (listError) {
      console.error('❌ Admin auth test failed:', listError.message);
      return false;
    }
    
    console.log('✅ Admin connection successful');
    console.log(`📊 Total users in system: ${users?.length || 0}`);
    
    // Test database access with admin privileges
    const { data: questions, error: dbError } = await supabaseAdmin
      .from('questions')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.warn('⚠️ Database access test failed:', dbError.message);
    } else {
      console.log('✅ Database access successful');
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Admin connection test failed:', error.message);
    return false;
  }
}

async function setupTestUser() {
  console.log('\n🚀 Setting up test user with admin privileges...');
  console.log(`📧 Test User Email: ${testUserEmail}`);
  
  try {
    // Step 1: Check if user already exists
    console.log('\n1️⃣ Checking if test user exists...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error checking existing users:', listError.message);
      return false;
    }
    
    const existingUser = users.find(user => user.email === testUserEmail);
    
    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('👤 User ID:', existingUser.id);
      console.log('📅 Created:', new Date(existingUser.created_at).toLocaleString());
      console.log('✉️ Email Confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No');
      
      // Ensure email is confirmed
      if (!existingUser.email_confirmed_at) {
        console.log('\n🔧 Confirming user email...');
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('❌ Error confirming email:', confirmError.message);
        } else {
          console.log('✅ Email confirmed successfully');
        }
      }
      
      return existingUser;
    }
    
    // Step 2: Create new test user using admin client
    console.log('\n2️⃣ Creating new test user with admin privileges...');
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Jim Kalinov',
        display_name: 'Jim Kalinov'
      }
    });
    
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      return false;
    }
    
    const newUser = userData.user;
    console.log('✅ Test user created successfully');
    console.log('👤 User ID:', newUser.id);
    console.log('📧 Email:', newUser.email);
    console.log('✉️ Email Confirmed:', newUser.email_confirmed_at ? 'Yes' : 'No');
    
    // Step 3: Create user profile using admin privileges
    console.log('\n3️⃣ Creating user profile...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.id,
        email: testUserEmail,
        full_name: 'Jim Kalinov',
        display_name: 'Jim Kalinov',
        username: 'jimkalinov',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.warn('⚠️ Profile creation failed:', profileError.message);
    } else {
      console.log('✅ User profile created successfully');
      console.log('📝 Profile ID:', profile.id);
    }
    
    // Step 4: Initialize user stats
    console.log('\n4️⃣ Initializing user stats...');
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .insert({
        user_id: newUser.id,
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
    
    if (statsError) {
      console.warn('⚠️ User stats creation failed:', statsError.message);
    } else {
      console.log('✅ User stats initialized successfully');
    }
    
    return newUser;
    
  } catch (error) {
    console.error('💥 User setup failed:', error.message);
    return false;
  }
}

async function testClientAuthentication() {
  console.log('\n🧪 Testing client-side authentication with publishable key...');
  
  try {
    // Test sign in with publishable key client
    console.log('🔐 Testing sign in with publishable key...');
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword
    });
    
    if (signInError) {
      console.error('❌ Client sign in failed:', signInError.message);
      return false;
    }
    
    console.log('✅ Client sign in successful');
    console.log('👤 Authenticated User ID:', signInData.user.id);
    console.log('📧 Email:', signInData.user.email);
    console.log('🔑 Session Token:', signInData.session.access_token ? 'Present' : 'Missing');
    
    // Test profile access with authenticated user
    console.log('\n📊 Testing authenticated data access...');
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️ Profile access failed:', profileError.message);
    } else {
      console.log('✅ Profile access successful');
      console.log('📝 Profile:', {
        id: profileData.id,
        full_name: profileData.full_name,
        display_name: profileData.display_name,
        username: profileData.username
      });
    }
    
    // Test user stats access
    const { data: statsData, error: statsError } = await supabaseClient
      .from('user_stats')
      .select('*')
      .eq('user_id', signInData.user.id)
      .single();
    
    if (statsError) {
      console.warn('⚠️ User stats access failed:', statsError.message);
    } else {
      console.log('✅ User stats access successful');
      console.log('📊 Stats:', {
        total_quizzes_completed: statsData.total_quizzes_completed,
        overall_accuracy: statsData.overall_accuracy,
        current_streak: statsData.current_streak
      });
    }
    
    // Test questions access (should work with RLS policies)
    const { data: questionsData, error: questionsError } = await supabaseClient
      .from('questions')
      .select('id, question_text')
      .limit(1);
    
    if (questionsError) {
      console.warn('⚠️ Questions access failed:', questionsError.message);
    } else {
      console.log('✅ Questions access successful');
      console.log(`📚 Sample question count: ${questionsData?.length || 0}`);
    }
    
    // Sign out
    console.log('\n🚪 Testing sign out...');
    const { error: signOutError } = await supabaseClient.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful');
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Client authentication test failed:', error.message);
    return false;
  }
}

async function testDatabaseAccess() {
  console.log('\n🗄️ Testing database access with secret key...');
  
  const tables = ['questions', 'tags', 'profiles', 'user_stats'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        results[table] = { success: false, error: error.message };
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        results[table] = { success: true };
        console.log(`✅ ${table}: Accessible`);
      }
    } catch (err) {
      results[table] = { success: false, error: err.message };
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  const successCount = Object.values(results).filter(r => r.success).length;
  console.log(`\n📊 Database access summary: ${successCount}/${tables.length} tables accessible`);
  
  return results;
}

// Main execution
async function main() {
  console.log('Environment Configuration:');
  console.log('🌐 Supabase URL:', supabaseUrl);
  console.log('🔑 Secret Key:', supabaseSecretKey ? 'Present' : 'Missing');
  console.log('🔑 Publishable Key:', supabasePublishableKey ? 'Present' : 'Missing');
  console.log('📧 Test User Email:', testUserEmail);
  
  // Test admin connection
  const adminConnected = await testAdminConnection();
  if (!adminConnected) {
    console.log('\n❌ Admin connection failed. Cannot proceed.');
    process.exit(1);
  }
  
  // Test database access
  await testDatabaseAccess();
  
  // Setup test user
  const user = await setupTestUser();
  
  // Test client authentication
  let authSuccess = false;
  if (user) {
    authSuccess = await testClientAuthentication();
  }
  
  // Final summary
  console.log('\n🎉 Setup Summary:');
  console.log('==================');
  console.log('✅ Admin connection:', adminConnected ? 'Success' : 'Failed');
  console.log('✅ Test user setup:', user ? 'Success' : 'Failed');
  console.log('✅ Client authentication:', authSuccess ? 'Success' : 'Failed');
  console.log('\n📝 Test Credentials:');
  console.log(`Email: ${testUserEmail}`);
  console.log(`Password: ${testUserPassword}`);
  console.log('\n🔑 Key Configuration:');
  console.log('Frontend: Publishable Key');
  console.log('Backend: Secret Key');
  
  if (adminConnected && user && authSuccess) {
    console.log('\n🚀 Complete setup successful! Ready for full authentication testing!');
  } else {
    console.log('\n⚠️ Setup completed with some issues. Check the errors above.');
  }
}

// Run the setup
main().catch(error => {
  console.error('💥 Setup script failed:', error);
  process.exit(1);
});