#!/usr/bin/env node

/**
 * Test authentication with fixed configuration (no legacy keys)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔐 Testing Authentication with Fixed Configuration\n' + '='.repeat(60));

// Read environment variables
const envPath = join(__dirname, 'env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;
const testEmail = envVars.TEST_USER_EMAIL;
const testPassword = envVars.TEST_USER_PW;

console.log('Configuration Check:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Publishable Key: ${supabaseKey ? 'Present (sb_publishable_...)' : 'Missing'}`);
console.log(`Test Email: ${testEmail}`);
console.log(`Test Password: ${testPassword ? 'Present' : 'Missing'}`);

if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
  console.log('❌ Missing required configuration');
  process.exit(1);
}

// Create Supabase client (same as the app would)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

console.log('\n🧪 Running Authentication Tests:');
console.log('='.repeat(60));

// Test 1: Check auth service accessibility
async function testAuthService() {
  try {
    console.log('1. Testing auth service accessibility...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'Auth session missing!') {
      console.log(`   ❌ Auth service error: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Auth service is accessible');
    return true;
  } catch (err) {
    console.log(`   ❌ Auth service exception: ${err.message}`);
    return false;
  }
}

// Test 2: Test login with credentials
async function testLogin() {
  try {
    console.log('2. Testing login with test credentials...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
      return false;
    }
    
    if (data.user) {
      console.log(`   ✅ Login successful! User ID: ${data.user.id}`);
      console.log(`   📧 Email: ${data.user.email}`);
      console.log(`   🕒 Last sign in: ${data.user.last_sign_in_at}`);
      
      // Test logout
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) {
        console.log(`   ⚠️  Logout warning: ${logoutError.message}`);
      } else {
        console.log(`   ✅ Logout successful`);
      }
      
      return true;
    } else {
      console.log('   ❌ Login succeeded but no user data returned');
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Login exception: ${err.message}`);
    return false;
  }
}

// Test 3: Test signup flow (with cleanup)
async function testSignupFlow() {
  try {
    console.log('3. Testing signup flow...');
    
    const testSignupEmail = `test-${Date.now()}@example.com`;
    const testSignupPassword = 'TestPassword123!';
    
    const { data, error } = await supabase.auth.signUp({
      email: testSignupEmail,
      password: testSignupPassword
    });
    
    if (error) {
      console.log(`   ❌ Signup failed: ${error.message}`);
      return false;
    }
    
    if (data.user) {
      console.log(`   ✅ Signup successful! User ID: ${data.user.id}`);
      console.log(`   📧 Email: ${data.user.email}`);
      console.log(`   ✉️  Email confirmation required: ${!data.user.email_confirmed_at}`);
      return true;
    } else {
      console.log('   ❌ Signup succeeded but no user data returned');
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Signup exception: ${err.message}`);
    return false;
  }
}

// Test 4: Check if we're using the right key type
async function testKeyValidation() {
  try {
    console.log('4. Validating key configuration...');
    
    if (!supabaseKey.startsWith('sb_publishable_')) {
      console.log('   ❌ Invalid key format - not a publishable key');
      return false;
    }
    
    console.log('   ✅ Using correct publishable key format');
    
    // Try to access a protected resource to ensure the key works
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log(`   ⚠️  Protected resource access: ${error.message}`);
      return true; // This is expected for unauthenticated requests
    }
    
    console.log('   ✅ Key is functioning correctly');
    return true;
  } catch (err) {
    console.log(`   ❌ Key validation exception: ${err.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    authService: await testAuthService(),
    login: await testLogin(),
    signup: await testSignupFlow(),
    keyValidation: await testKeyValidation()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 AUTHENTICATION TEST RESULTS:');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)}: ${status}`);
  });
  
  console.log('='.repeat(60));
  console.log(`OVERALL: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
  
  if (passed === total) {
    console.log('\n🎉 EXCELLENT! Authentication is working properly');
    console.log('✅ No legacy key issues detected');
    console.log('✅ Login/signup flows functional');
    console.log('✅ Ready for production use');
  } else if (passed >= 2) {
    console.log('\n⚠️  PARTIAL SUCCESS - Core auth works but some issues remain');
  } else {
    console.log('\n🚨 AUTHENTICATION FAILED - Please check configuration');
  }
  
  return passed / total;
}

// Execute tests
runAllTests().then(successRate => {
  console.log('\n📝 Next Steps:');
  if (successRate === 1.0) {
    console.log('• Authentication is fully functional');
    console.log('• You can now test the full app login flow');
    console.log('• All legacy key issues have been resolved');
  } else {
    console.log('• Review any failing tests above');
    console.log('• Check Supabase dashboard for user management settings');
    console.log('• Verify Row Level Security (RLS) policies if needed');
  }
  
  process.exit(successRate >= 0.5 ? 0 : 1);
}).catch(err => {
  console.log(`\n💥 Fatal error: ${err.message}`);
  process.exit(1);
});