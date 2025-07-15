#!/usr/bin/env node

/**
 * Authentication Flow Validation Script
 * Tests all authentication flows as specified in terragon TODO.md
 *
 * Tests:
 * 1. User registration with real Supabase backend
 * 2. Login/logout functionality
 * 3. Forgot password flow
 * 4. Protected route behavior
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
const testPassword = process.env.TEST_USER_PW || 'TestPassword123!'

console.log('🔍 Authentication Flow Validation Starting...\n')

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Test results tracking
const results = {
  connection: false,
  registration: false,
  login: false,
  logout: false,
  passwordReset: false,
  profileCreation: false,
  protectedRoutes: false
}

/**
 * Test 1: Database Connection
 */
async function testConnection() {
  console.log('📡 Testing Supabase connection...')
  
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📊 Sample data:', data)
    return true
  } catch (error) {
    console.error('❌ Connection exception:', error.message)
    return false
  }
}

/**
 * Test 2: User Registration
 */
async function testRegistration() {
  console.log('\n👤 Testing user registration...')
  
  // Generate unique test email
  const timestamp = Date.now()
  const uniqueEmail = `test-${timestamp}@example.com`
  const fullName = 'Test User'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: uniqueEmail,
      password: testPassword,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (error) {
      console.error('❌ Registration failed:', error.message)
      return false
    }
    
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      console.error('❌ Email already in use')
      return false
    }
    
    console.log('✅ User registration successful')
    console.log('📧 User ID:', data.user?.id)
    console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
    
    // Store test user for cleanup
    global.testUserId = data.user?.id
    global.testUserEmail = uniqueEmail
    
    return true
  } catch (error) {
    console.error('❌ Registration exception:', error.message)
    return false
  }
}

/**
 * Test 3: User Login
 */
async function testLogin() {
  console.log('\n🔐 Testing user login...')
  
  try {
    // First, sign out any existing session
    await supabase.auth.signOut()
    
    // Test login with existing test credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.error('❌ Login failed:', error.message)
      return false
    }
    
    console.log('✅ User login successful')
    console.log('👤 User ID:', data.user?.id)
    console.log('📧 Email:', data.user?.email)
    console.log('🎫 Session:', data.session ? 'Active' : 'None')
    
    return true
  } catch (error) {
    console.error('❌ Login exception:', error.message)
    return false
  }
}

/**
 * Test 4: User Logout
 */
async function testLogout() {
  console.log('\n🚪 Testing user logout...')
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Logout failed:', error.message)
      return false
    }
    
    // Verify session is cleared
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.error('❌ Session still active after logout')
      return false
    }
    
    console.log('✅ User logout successful')
    console.log('🎫 Session cleared')
    
    return true
  } catch (error) {
    console.error('❌ Logout exception:', error.message)
    return false
  }
}

/**
 * Test 5: Password Reset Flow
 */
async function testPasswordReset() {
  console.log('\n🔄 Testing password reset flow...')
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:5173/reset-password',
    })
    
    if (error) {
      console.error('❌ Password reset failed:', error.message)
      return false
    }
    
    console.log('✅ Password reset email sent successfully')
    console.log('📧 Reset email sent to:', testEmail)
    
    return true
  } catch (error) {
    console.error('❌ Password reset exception:', error.message)
    return false
  }
}

/**
 * Test 6: Profile Creation
 */
async function testProfileCreation() {
  console.log('\n👤 Testing profile creation...')
  
  try {
    // Login first
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (authError) {
      console.error('❌ Login for profile test failed:', authError.message)
      return false
    }
    
    const userId = authData.user.id
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (existingProfile) {
      console.log('✅ Profile already exists')
      console.log('👤 Profile data:', {
        id: existingProfile.id,
        username: existingProfile.username,
        full_name: existingProfile.full_name
      })
      return true
    }
    
    // Create profile if it doesn't exist
    const profileData = {
      id: userId,
      username: `user_${userId.slice(0, 8)}`,
      full_name: authData.user.user_metadata?.full_name || 'Test User',
      email: authData.user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      return false
    }
    
    console.log('✅ Profile created successfully')
    console.log('👤 New profile:', newProfile)
    
    return true
  } catch (error) {
    console.error('❌ Profile creation exception:', error.message)
    return false
  }
}

/**
 * Test 7: Protected Routes (RLS Policies)
 */
async function testProtectedRoutes() {
  console.log('\n🛡️ Testing protected routes and RLS policies...')
  
  try {
    // Test 1: Authenticated access to user data
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (!authData.user) {
      console.error('❌ No authenticated user for protected route test')
      return false
    }
    
    // Test accessing own profile
    const { data: ownProfile, error: ownError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (ownError) {
      console.error('❌ Cannot access own profile:', ownError.message)
      return false
    }
    
    console.log('✅ Can access own profile data')
    
    // Test 2: Unauthenticated access (should fail)
    await supabase.auth.signOut()
    
    const { data: unauthData, error: unauthError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (!unauthError && unauthData?.length > 0) {
      console.error('❌ Unauthenticated access should be blocked')
      return false
    }
    
    console.log('✅ Unauthenticated access properly blocked')
    
    return true
  } catch (error) {
    console.error('❌ Protected routes test exception:', error.message)
    return false
  }
}

/**
 * Run all authentication tests
 */
async function runAllTests() {
  console.log('🚀 Starting comprehensive authentication validation...\n')
  
  // Test 1: Connection
  results.connection = await testConnection()
  
  if (!results.connection) {
    console.log('\n❌ Database connection failed. Stopping tests.')
    return results
  }
  
  // Test 2: Registration
  results.registration = await testRegistration()
  
  // Test 3: Login
  results.login = await testLogin()
  
  // Test 4: Logout
  results.logout = await testLogout()
  
  // Test 5: Password Reset
  results.passwordReset = await testPasswordReset()
  
  // Test 6: Profile Creation
  results.profileCreation = await testProfileCreation()
  
  // Test 7: Protected Routes
  results.protectedRoutes = await testProtectedRoutes()
  
  return results
}

/**
 * Display test results
 */
function displayResults(results) {
  console.log('\n' + '='.repeat(50))
  console.log('📊 AUTHENTICATION VALIDATION RESULTS')
  console.log('='.repeat(50))
  
  const tests = [
    { name: 'Database Connection', result: results.connection },
    { name: 'User Registration', result: results.registration },
    { name: 'User Login', result: results.login },
    { name: 'User Logout', result: results.logout },
    { name: 'Password Reset', result: results.passwordReset },
    { name: 'Profile Creation', result: results.profileCreation },
    { name: 'Protected Routes', result: results.protectedRoutes }
  ]
  
  tests.forEach(test => {
    const status = test.result ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${test.name}`)
  })
  
  const passedTests = tests.filter(t => t.result).length
  const totalTests = tests.length
  
  console.log('\n' + '-'.repeat(50))
  console.log(`📈 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All authentication flows are working correctly!')
  } else {
    console.log('⚠️  Some authentication flows need attention.')
  }
  
  console.log('='.repeat(50))
}

// Run the tests
runAllTests()
  .then(displayResults)
  .catch(error => {
    console.error('💥 Test suite failed:', error)
    process.exit(1)
  })
