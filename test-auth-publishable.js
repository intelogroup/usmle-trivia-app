#!/usr/bin/env node

/**
 * Test Authentication with Publishable Keys
 * This script tests client-side authentication with jimkalinov@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const testUserEmail = process.env.TEST_USER_EMAIL || 'jimkalinov@gmail.com';
const testUserPassword = process.env.TEST_USER_PW || 'Jimkali90#';

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('❌ Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY:', supabasePublishableKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with publishable key
const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

async function testDatabaseConnection() {
  console.log('\n🔍 Testing database connection with publishable key...');
  
  try {
    // Test basic queries that work with publishable keys
    const tests = [
      {
        name: 'Questions table access',
        query: () => supabase.from('questions').select('count').limit(1)
      },
      {
        name: 'Tags table access', 
        query: () => supabase.from('tags').select('count').limit(1)
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

async function testClientAuthentication() {
  console.log('\n🧪 Testing client-side authentication...');
  
  try {
    // Test 1: Check current session (should be null)
    console.log('1️⃣ Checking current session...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    
    // Test 2: Attempt sign in with test user
    console.log('\n2️⃣ Testing sign in with test user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      
      // If user doesn't exist, try to sign up
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('\n3️⃣ User not found, attempting to create account...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testUserEmail,
          password: testUserPassword,
          options: {
            data: {
              full_name: 'Jim Kalinov',
              display_name: 'Jim Kalinov'
            }
          }
        });
        
        if (signUpError) {
          console.error('❌ Sign up failed:', signUpError.message);
          return false;
        }
        
        if (signUpData.user && !signUpData.user.email_confirmed_at) {
          console.log('⚠️ Account created but email confirmation required');
          console.log('📧 Check email for confirmation link');
          return false;
        }
        
        console.log('✅ Account created successfully');
        return true;
      }
      
      return false;
    }
    
    console.log('✅ Sign in successful');
    console.log('👤 User ID:', signInData.user.id);
    console.log('📧 Email:', signInData.user.email);
    console.log('✉️ Email confirmed:', signInData.user.email_confirmed_at ? 'Yes' : 'No');
    
    // Test 3: Get current user
    console.log('\n3️⃣ Testing get current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Get user failed:', userError.message);
    } else {
      console.log('✅ Get user successful');
      console.log('👤 Current user:', user?.email);
    }
    
    // Test 4: Test accessing protected resources
    console.log('\n4️⃣ Testing access to user-specific data...');
    
    // Try to access profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.log('⚠️ Profile access failed:', profileError.message);
    } else if (profileData) {
      console.log('✅ Profile access successful');
      console.log('📝 Profile:', {
        id: profileData.id,
        full_name: profileData.full_name,
        display_name: profileData.display_name
      });
    } else {
      console.log('⚠️ No profile found for user');
    }
    
    // Test 5: Sign out
    console.log('\n5️⃣ Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
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

async function testSupabaseConfiguration() {
  console.log('\n⚙️ Testing Supabase configuration...');
  
  try {
    // Test the client initialization
    console.log('🔧 Client configuration:');
    console.log('  URL:', supabaseUrl);
    console.log('  Key type: Publishable');
    console.log('  Key prefix:', supabasePublishableKey.substring(0, 20) + '...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Basic query failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic configuration working');
    return true;
    
  } catch (error) {
    console.error('💥 Configuration test failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 USMLE Trivia App - Authentication Test with Publishable Keys\n');
  
  // Test configuration
  const configOk = await testSupabaseConfiguration();
  
  // Test database connection
  await testDatabaseConnection();
  
  // Test authentication if config is OK
  if (configOk) {
    const authSuccess = await testClientAuthentication();
    
    console.log('\n🎉 Test Summary:');
    console.log('==================');
    console.log('✅ Configuration test:', configOk ? 'Success' : 'Failed');
    console.log('✅ Authentication test:', authSuccess ? 'Success' : 'Failed');
    console.log('\n📝 Test Credentials:');
    console.log(`Email: ${testUserEmail}`);
    console.log(`Password: ${testUserPassword}`);
    
    if (authSuccess) {
      console.log('\n🚀 Ready for Playwright testing with publishable keys!');
    } else {
      console.log('\n⚠️ Authentication needs attention. Check user setup.');
    }
  } else {
    console.log('\n❌ Configuration failed. Please check your environment variables.');
    process.exit(1);
  }
}

// Run the test
main().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});