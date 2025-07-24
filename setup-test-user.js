#!/usr/bin/env node

/**
 * Setup Test User for USMLE Trivia App
 * This script sets up the test user jimkalinov@gmail.com for authentication testing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;
const testUserEmail = process.env.TEST_USER_EMAIL || 'jimkalinov@gmail.com';
const testUserPassword = process.env.TEST_USER_PW || 'Jimkali90#';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTestUser() {
  console.log('🚀 Setting up test user for USMLE Trivia App...');
  console.log(`📧 Test User Email: ${testUserEmail}`);
  
  try {
    // Step 1: Check if user already exists
    console.log('\n1️⃣ Checking if test user exists...');
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError.message);
      return false;
    }
    
    const existingUser = existingUsers.users.find(user => user.email === testUserEmail);
    
    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('👤 User ID:', existingUser.id);
      console.log('📅 Created:', new Date(existingUser.created_at).toLocaleString());
      console.log('✉️ Email Confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No');
      
      // Update user to ensure email is confirmed
      if (!existingUser.email_confirmed_at) {
        console.log('\n🔧 Confirming user email...');
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
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
    
    // Step 2: Create new test user
    console.log('\n2️⃣ Creating new test user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Jim Kalinov',
        display_name: 'Jim Kalinov'
      }
    });
    
    if (createError) {
      console.error('❌ Error creating user:', createError.message);
      return false;
    }
    
    console.log('✅ Test user created successfully');
    console.log('👤 User ID:', newUser.user.id);
    console.log('📧 Email:', newUser.user.email);
    
    // Step 3: Create user profile
    console.log('\n3️⃣ Creating user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
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
      console.warn('⚠️ Profile creation failed (may already exist):', profileError.message);
    } else {
      console.log('✅ User profile created successfully');
    }
    
    // Step 4: Initialize user stats
    console.log('\n4️⃣ Initializing user stats...');
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: newUser.user.id,
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
      console.warn('⚠️ User stats creation failed (may already exist):', statsError.message);
    } else {
      console.log('✅ User stats initialized successfully');
    }
    
    return newUser.user;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🧪 Testing authentication with test user...');
  
  try {
    // Create client for testing authentication
    const testClient = createClient(
      supabaseUrl, 
      process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    );
    
    // Test sign in
    console.log('🔐 Testing sign in...');
    const { data: signInData, error: signInError } = await testClient.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return false;
    }
    
    console.log('✅ Sign in successful');
    console.log('👤 Authenticated User ID:', signInData.user.id);
    console.log('📧 Email:', signInData.user.email);
    
    // Test profile fetch
    console.log('\n📊 Testing profile fetch...');
    const { data: profileData, error: profileError } = await testClient
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️ Profile fetch failed:', profileError.message);
    } else {
      console.log('✅ Profile fetch successful');
      console.log('📝 Profile Data:', {
        id: profileData.id,
        full_name: profileData.full_name,
        display_name: profileData.display_name,
        username: profileData.username
      });
    }
    
    // Test user stats fetch
    console.log('\n📈 Testing user stats fetch...');
    const { data: statsData, error: statsError } = await testClient
      .from('user_stats')
      .select('*')
      .eq('user_id', signInData.user.id)
      .single();
    
    if (statsError) {
      console.warn('⚠️ User stats fetch failed:', statsError.message);
    } else {
      console.log('✅ User stats fetch successful');
      console.log('📊 Stats Data:', {
        total_quizzes_completed: statsData.total_quizzes_completed,
        overall_accuracy: statsData.overall_accuracy,
        current_streak: statsData.current_streak
      });
    }
    
    // Sign out
    console.log('\n🚪 Testing sign out...');
    const { error: signOutError } = await testClient.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful');
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Authentication test failed:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    // Test basic queries
    const tests = [
      {
        name: 'Questions table',
        query: () => supabase.from('questions').select('count').limit(1)
      },
      {
        name: 'Tags table', 
        query: () => supabase.from('tags').select('count').limit(1)
      },
      {
        name: 'Profiles table',
        query: () => supabase.from('profiles').select('count').limit(1)
      },
      {
        name: 'User stats table',
        query: () => supabase.from('user_stats').select('count').limit(1)
      }
    ];
    
    for (const test of tests) {
      try {
        const { data, error } = await test.query();
        if (error) {
          console.log(`❌ ${test.name}: ${error.message}`);
        } else {
          console.log(`✅ ${test.name}: Connected`);
        }
      } catch (err) {
        console.log(`❌ ${test.name}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Database test failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🎯 USMLE Trivia App - Test User Setup\n');
  
  // Test database connection first
  await testDatabaseConnection();
  
  // Setup test user
  const user = await setupTestUser();
  
  if (user) {
    // Test authentication
    const authSuccess = await testAuthentication();
    
    console.log('\n🎉 Setup Summary:');
    console.log('==================');
    console.log('✅ Test user setup:', user ? 'Success' : 'Failed');
    console.log('✅ Authentication test:', authSuccess ? 'Success' : 'Failed');
    console.log('\n📝 Test Credentials:');
    console.log(`Email: ${testUserEmail}`);
    console.log(`Password: ${testUserPassword}`);
    console.log('\n🚀 Ready for Playwright testing!');
  } else {
    console.log('\n❌ Setup failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the setup
main().catch(error => {
  console.error('💥 Setup script failed:', error);
  process.exit(1);
});