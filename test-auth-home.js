#!/usr/bin/env node

/**
 * Test Authentication and Home Screen with Real User
 * This script tests the complete flow that happens on the home screen
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testing Authentication and Home Screen Flow...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow...');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`⚠️ Session error: ${sessionError.message}`);
    }
    
    if (!session || !session.user) {
      console.log('ℹ️ No active session found - testing as unauthenticated user');
      return testUnauthenticatedFlow();
    }
    
    console.log(`✅ Found active session for user: ${session.user.email}`);
    return testAuthenticatedFlow(session.user);
    
  } catch (error) {
    console.log(`❌ Auth flow error: ${error.message}`);
    return false;
  }
}

async function testUnauthenticatedFlow() {
  console.log('\n👤 Testing Unauthenticated User Flow...');
  
  try {
    // Test what happens when userId is null (like in useUserActivityQuery)
    const { data: quizHistory, error: historyError } = await supabase
      .from('user_question_history')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .limit(1);

    if (historyError) {
      console.log(`⚠️ Quiz history query (expected to fail): ${historyError.message}`);
    } else {
      console.log(`✅ Quiz history query returned ${quizHistory.length} records`);
    }

    // Test categories (should work for unauthenticated users)
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, description, icon, is_active')
      .eq('is_active', true)
      .order('name');

    if (catError) {
      console.log(`❌ Categories query failed: ${catError.message}`);
      return false;
    }

    console.log(`✅ Categories loaded successfully (${categories.length} categories)`);

    // Test questions count (should work for unauthenticated users)
    const { count, error: questionsError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (questionsError) {
      console.log(`❌ Questions count failed: ${questionsError.message}`);
      return false;
    }

    console.log(`✅ Questions count successful (${count} questions)`);
    console.log('✅ Unauthenticated flow working correctly');
    return true;

  } catch (error) {
    console.log(`❌ Unauthenticated flow error: ${error.message}`);
    return false;
  }
}

async function testAuthenticatedFlow(user) {
  console.log(`\n👤 Testing Authenticated User Flow for ${user.email}...`);
  
  try {
    // Test user profile fetch
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log(`⚠️ Profile query failed: ${profileError.message}`);
      console.log('   This might be expected for new users');
    } else {
      console.log(`✅ Profile loaded: ${profile.display_name || profile.username || 'No name'}`);
    }

    // Test user activity query (exact same logic as useUserActivityQuery)
    console.log('\n📊 Testing User Activity Query...');
    
    // Check if user has any quiz history
    const { data: quizHistory, error: historyError } = await supabase
      .from('user_question_history')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (historyError) {
      console.log(`❌ Quiz history query failed: ${historyError.message}`);
      return false;
    }

    console.log(`✅ Quiz history query successful (${quizHistory.length} records)`);
    const hasActivity = quizHistory && quizHistory.length > 0;
    const isNewUser = !hasActivity;
    console.log(`   User status: ${isNewUser ? 'New User' : 'Existing User'}`);

    if (hasActivity) {
      // Test user stats RPC
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { p_user_id: user.id });

      if (statsError) {
        console.log(`⚠️ RPC get_user_stats failed: ${statsError.message}`);
      } else {
        console.log(`✅ User stats loaded successfully`);
        if (statsData && statsData.length > 0) {
          const stats = statsData[0];
          console.log(`   Total questions: ${stats.total_questions_attempted || 0}`);
          console.log(`   Accuracy: ${stats.accuracy_percentage || 0}%`);
        }
      }

      // Test recent activity
      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('id, session_type, total_questions, correct_answers, started_at, completed_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(5);

      if (sessionsError) {
        console.log(`❌ Quiz sessions query failed: ${sessionsError.message}`);
        return false;
      }

      console.log(`✅ Quiz sessions loaded (${sessions.length} sessions)`);
    }

    console.log('✅ Authenticated flow working correctly');
    return true;

  } catch (error) {
    console.log(`❌ Authenticated flow error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
    return false;
  }
}

async function testQueryTimeout() {
  console.log('\n⏱️ Testing Query Timeout Issues...');
  
  try {
    // Test a potentially slow query with timeout
    const startTime = Date.now();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 5000); // 5 second timeout
    });
    
    const queryPromise = supabase
      .from('user_question_history')
      .select(`
        *,
        questions (
          id, question_text, category, difficulty,
          question_options (*)
        )
      `)
      .limit(10);
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Complex query completed in ${duration}ms`);
    
    if (duration > 3000) {
      console.log('⚠️ Query took longer than 3 seconds - this might cause loading issues');
    }
    
    return true;
    
  } catch (error) {
    if (error.message === 'Query timeout') {
      console.log('❌ Query timed out - this could be causing loading issues');
    } else {
      console.log(`❌ Query error: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running Complete Home Screen Tests...\n');
  
  const authOk = await testAuthFlow();
  const timeoutOk = await testQueryTimeout();
  
  console.log('\n📊 Test Summary:');
  console.log(`- Authentication Flow: ${authOk ? '✅' : '❌'}`);
  console.log(`- Query Performance: ${timeoutOk ? '✅' : '❌'}`);
  
  const allPassed = authOk && timeoutOk;
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
  
  if (!allPassed) {
    console.log('\n🔧 Potential Issues Found:');
    if (!authOk) {
      console.log('- Authentication or user data queries are failing');
      console.log('- Check user permissions and table structures');
    }
    if (!timeoutOk) {
      console.log('- Database queries are timing out');
      console.log('- This could cause infinite loading on the home screen');
    }
    
    console.log('\n💡 Debugging Tips:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Look at Network tab for failed requests');
    console.log('3. Verify user has proper database permissions');
    console.log('4. Check if React Query is retrying failed requests');
  }
  
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});