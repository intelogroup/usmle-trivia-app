import { createQuizSession } from './src/services/questions/sessionService.js';
import { supabase } from './src/lib/supabase.js';
import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function testSessionCreationWithAuth() {
  console.log('Testing quiz session creation with authentication...');
  
  try {
    // Set the access token for MCP
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // Set environment variables for Supabase client
    process.env.VITE_SUPABASE_URL = 'https://bkuowoowlmwranfoliea.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';
    
    // 1. Check current session count before test
    console.log('\\n1. Getting baseline session count...');
    const beforeResult = await executeSupabaseQuery('SELECT COUNT(*) as count FROM quiz_sessions;');
    const beforeCount = beforeResult.success ? JSON.parse(beforeResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1])[0].count : 0;
    console.log(`Current session count: ${beforeCount}`);
    
    // 2. Test unauthenticated session creation (should fail)
    console.log('\\n2. Testing unauthenticated session creation...');
    try {
      await createQuizSession({
        userId: 'ae428e9d-4700-42da-b0d1-37fba5e28c94', // Valid user ID from our data
        sessionType: 'practice',
        totalQuestions: 5,
        categoryName: 'Test Category'
      });
      console.log('❌ UNEXPECTED: Unauthenticated session creation succeeded');
    } catch (error) {
      console.log('✅ EXPECTED: Unauthenticated session creation failed:', error.message);
    }
    
    // 3. Try to authenticate with test user
    console.log('\\n3. Attempting authentication with test user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jimkalinov@gmail.com',
      password: 'Jimkali90#'
    });
    
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      console.log('Will test error handling without authentication...');
    } else {
      console.log('✅ Authentication successful:', authData.user.id);
      
      // 4. Test authenticated session creation (should succeed)
      console.log('\\n4. Testing authenticated session creation...');
      try {
        const session = await createQuizSession({
          userId: authData.user.id,
          sessionType: 'practice',
          totalQuestions: 5,
          categoryName: 'Test Category',
          timePerQuestion: 60,
          autoAdvance: false,
          showExplanations: true
        });
        console.log('✅ Authenticated session creation succeeded:', session.id);
        
        // Verify session was actually created
        const afterResult = await executeSupabaseQuery('SELECT COUNT(*) as count FROM quiz_sessions;');
        const afterCount = afterResult.success ? JSON.parse(afterResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1])[0].count : 0;
        console.log(`Session count after creation: ${afterCount}`);
        
        if (afterCount > beforeCount) {
          console.log('✅ Session count increased - session was actually created');
        } else {
          console.log('❌ Session count did not increase - potential issue');
        }
        
      } catch (error) {
        console.log('❌ UNEXPECTED: Authenticated session creation failed:', error.message);
      }
    }
    
    // 5. Test validation errors
    console.log('\\n5. Testing validation errors...');
    
    // Test missing user ID
    try {
      await createQuizSession({
        sessionType: 'practice',
        totalQuestions: 5
      });
      console.log('❌ UNEXPECTED: Missing userId validation passed');
    } catch (error) {
      console.log('✅ EXPECTED: Missing userId validation failed:', error.message);
    }
    
    // Test invalid total questions
    try {
      await createQuizSession({
        userId: 'ae428e9d-4700-42da-b0d1-37fba5e28c94',
        sessionType: 'practice',
        totalQuestions: 0
      });
      console.log('❌ UNEXPECTED: Invalid totalQuestions validation passed');
    } catch (error) {
      console.log('✅ EXPECTED: Invalid totalQuestions validation failed:', error.message);
    }
    
    // 6. Check for any orphaned sessions (those without valid user_id)
    console.log('\\n6. Checking for orphaned sessions...');
    const orphanResult = await executeSupabaseQuery(`
      SELECT COUNT(*) as orphaned_count 
      FROM quiz_sessions 
      WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);
    `);
    
    if (orphanResult.success) {
      const orphanedCount = JSON.parse(orphanResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1])[0].orphaned_count;
      console.log(`Orphaned sessions: ${orphanedCount}`);
      if (orphanedCount === 0) {
        console.log('✅ No orphaned sessions found - authentication is working correctly');
      } else {
        console.log(`⚠️ Found ${orphanedCount} orphaned sessions - might indicate authentication issues`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testSessionCreationWithAuth();