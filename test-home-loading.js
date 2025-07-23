#!/usr/bin/env node

/**
 * Home Screen Loading Test
 * Tests the main components and data fetching for home screen
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testing Home Screen Loading...\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log(`- VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`- VITE_SUPABASE_PUBLISHABLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnectivity() {
  console.log('\n🔗 Testing Database Connectivity...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
    return false;
  }
}

async function testUserActivityQuery(userId = '00000000-0000-0000-0000-000000000000') {
  console.log('\n👤 Testing User Activity Query...');
  
  try {
    // Test user activity - similar to what the home screen does
    const { data: quizHistory, error: historyError } = await supabase
      .from('user_question_history')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (historyError) {
      console.log(`❌ Quiz history query failed: ${historyError.message}`);
      return false;
    }

    console.log(`✅ Quiz history query successful (${quizHistory.length} records)`);

    // Test RPC function
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_stats', { p_user_id: userId });

    if (statsError) {
      console.log(`⚠️ RPC get_user_stats failed: ${statsError.message}`);
      console.log('   This might be expected for new users');
    } else {
      console.log(`✅ RPC get_user_stats successful`);
    }

    // Test quiz sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('id, session_type, total_questions, correct_answers, started_at, completed_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.log(`❌ Quiz sessions query failed: ${sessionsError.message}`);
      return false;
    }

    console.log(`✅ Quiz sessions query successful (${sessions.length} records)`);
    return true;

  } catch (error) {
    console.log(`❌ User activity query error: ${error.message}`);
    return false;
  }
}

async function testHomeScreenComponents() {
  console.log('\n🏠 Testing Home Screen Components...');
  
  try {
    // Test categories (used by HomeActions)
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, description, icon, is_active')
      .eq('is_active', true)
      .order('name');

    if (catError) {
      console.log(`❌ Categories query failed: ${catError.message}`);
      return false;
    }

    console.log(`✅ Categories query successful (${categories.length} categories)`);

    // Test questions count
    const { count, error: questionsError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (questionsError) {
      console.log(`❌ Questions count query failed: ${questionsError.message}`);
      return false;
    }

    console.log(`✅ Questions count query successful (${count} questions)`);
    return true;

  } catch (error) {
    console.log(`❌ Home screen components test error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const dbConnected = await testDatabaseConnectivity();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed with other tests - database connection failed');
    process.exit(1);
  }

  const userActivityOk = await testUserActivityQuery();
  const componentsOk = await testHomeScreenComponents();

  console.log('\n📊 Test Summary:');
  console.log(`- Database Connection: ${dbConnected ? '✅' : '❌'}`);
  console.log(`- User Activity Query: ${userActivityOk ? '✅' : '❌'}`);
  console.log(`- Home Components: ${componentsOk ? '✅' : '❌'}`);

  const allPassed = dbConnected && userActivityOk && componentsOk;
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);

  if (!allPassed) {
    console.log('\n🔧 Potential fixes:');
    console.log('1. Check .env.local file for correct Supabase keys');
    console.log('2. Verify database tables exist and have correct permissions');
    console.log('3. Check RPC functions are deployed');
    console.log('4. Ensure user authentication is working properly');
  }

  process.exit(allPassed ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});