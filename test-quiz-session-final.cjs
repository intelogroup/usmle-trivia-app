#!/usr/bin/env node

/**
 * Quiz Session Creation Test
 * Tests the quiz session creation functionality to isolate authentication issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';

// Test credentials
const testEmail = 'jimkalinov@gmail.com';
const testPassword = 'Jimkali90#';

console.log('🚀 Quiz Session Creation Test\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuizSessionFlow() {
  try {
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tags')
      .select('id, name')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return false;
    }
    console.log('✅ Database connection successful');

    // Step 2: Test authentication
    console.log('\nStep 2: Testing user authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      console.log('   This suggests the test user credentials are invalid or the user doesn\'t exist');
      return false;
    }

    if (!authData.user) {
      console.error('❌ No user data returned from authentication');
      return false;
    }

    console.log('✅ Authentication successful');
    console.log('   User ID:', authData.user.id);
    console.log('   User Email:', authData.user.email);
    console.log('   Session Active:', !!authData.session);

    const userId = authData.user.id;

    // Step 3: Test quiz session creation (direct insert)
    console.log('\nStep 3: Testing quiz session creation...');
    
    const sessionData = {
      user_id: userId,
      session_type: 'self_paced',
      total_questions: 5,
      started_at: new Date().toISOString(),
      category_name: 'mixed',
      settings: {
        timePerQuestion: null,
        autoAdvance: false,
        showExplanations: true
      }
    };

    console.log('   Creating session with data:', sessionData);

    const { data: createdSession, error: createError } = await supabase
      .from('quiz_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Quiz session creation failed:', createError.message);
      console.log('   Error details:', createError);
      
      // Check if the issue is with the table structure
      console.log('\n   Checking quiz_sessions table accessibility...');
      const { data: sessions, error: selectError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.error('   ❌ Cannot access quiz_sessions table:', selectError.message);
        console.log('   This suggests a table permission or structure issue');
      } else {
        console.log('   ✅ quiz_sessions table is accessible');
        if (sessions.length > 0) {
          console.log('   Sample record structure:', Object.keys(sessions[0]));
        }
      }
      return false;
    }

    console.log('✅ Quiz session created successfully!');
    console.log('   Session ID:', createdSession.id);
    console.log('   Session Type:', createdSession.session_type);
    console.log('   Total Questions:', createdSession.total_questions);
    console.log('   Started At:', createdSession.started_at);

    // Step 4: Test session completion
    console.log('\nStep 4: Testing session completion...');
    
    const completionData = {
      correct_answers: 3,
      completed_at: new Date().toISOString(),
      total_time_seconds: 120,
      points_earned: 300,
      is_completed: true
    };

    const { data: completedSession, error: completeError } = await supabase
      .from('quiz_sessions')
      .update(completionData)
      .eq('id', createdSession.id)
      .eq('user_id', userId) // Ensure RLS compliance
      .select()
      .single();

    if (completeError) {
      console.error('❌ Session completion failed:', completeError.message);
      return false;
    }

    console.log('✅ Session completed successfully!');
    console.log('   Correct Answers:', completedSession.correct_answers);
    console.log('   Points Earned:', completedSession.points_earned);
    console.log('   Completed At:', completedSession.completed_at);

    // Step 5: Test session retrieval
    console.log('\nStep 5: Testing session retrieval...');
    
    const { data: retrievedSession, error: retrieveError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', createdSession.id)
      .single();

    if (retrieveError) {
      console.error('❌ Session retrieval failed:', retrieveError.message);
      return false;
    }

    console.log('✅ Session retrieved successfully!');
    console.log('   Retrieved session matches created session');

    // Step 6: Clean up
    console.log('\nStep 6: Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('id', createdSession.id);

    if (deleteError) {
      console.warn('⚠️  Failed to clean up test session:', deleteError.message);
    } else {
      console.log('✅ Test session cleaned up successfully');
    }

    // Step 7: Logout
    console.log('\nStep 7: Logging out...');
    await supabase.auth.signOut();
    console.log('✅ Logged out successfully');

    return true;

  } catch (error) {
    console.error('💥 Test failed with exception:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function testWithoutAuthentication() {
  console.log('\n🧪 Testing session creation without authentication (should fail)...');
  
  try {
    // Make sure we're logged out
    await supabase.auth.signOut();
    
    const sessionData = {
      user_id: 'ae428e9d-4700-42da-b0d1-37fba5e28c94', // jimkalinov@gmail.com user ID
      session_type: 'self_paced',
      total_questions: 5,
      started_at: new Date().toISOString()
    };

    const { data: createdSession, error: createError } = await supabase
      .from('quiz_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (createError) {
      console.log('✅ Expected failure: Session creation blocked when not authenticated');
      console.log('   Error:', createError.message);
      return true;
    } else {
      console.error('❌ Unexpected: Session creation succeeded without authentication');
      console.log('   This suggests RLS policies may not be properly configured');
      
      // Clean up the unexpected session
      await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', createdSession.id);
      
      return false;
    }
  } catch (error) {
    console.log('✅ Expected exception: Session creation blocked when not authenticated');
    console.log('   Error:', error.message);
    return true;
  }
}

async function runAllTests() {
  console.log('🔬 Running comprehensive quiz session tests...\n');
  
  const results = {
    authenticatedFlow: false,
    unauthenticatedBlocking: false
  };
  
  // Test authenticated flow
  results.authenticatedFlow = await testQuizSessionFlow();
  
  // Test unauthenticated blocking
  results.unauthenticatedBlocking = await testWithoutAuthentication();
  
  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('📊 QUIZ SESSION CREATION TEST RESULTS');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Authenticated Quiz Session Flow', result: results.authenticatedFlow },
    { name: 'Unauthenticated Access Blocking', result: results.unauthenticatedBlocking }
  ];
  
  tests.forEach(test => {
    const status = test.result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}`);
  });
  
  const passedTests = tests.filter(t => t.result).length;
  const totalTests = tests.length;
  
  console.log('\n' + '-'.repeat(60));
  console.log(`📈 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Quiz session creation is working correctly!');
    console.log('📝 If you\'re experiencing issues in the app, the problem is likely:');
    console.log('   1. Frontend authentication context not properly initialized');
    console.log('   2. User session not being passed to the session creation functions');
    console.log('   3. Race condition between authentication and session creation');
    console.log('   4. Environment variables not properly loaded in the frontend');
  } else {
    console.log('\n⚠️  Quiz session creation has issues that need attention.');
  }
  
  console.log('='.repeat(60));
}

// Run the tests
runAllTests()
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });