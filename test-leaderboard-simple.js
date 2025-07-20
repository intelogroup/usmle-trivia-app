#!/usr/bin/env node

/**
 * Simple test script to verify leaderboard functionality
 * Tests the current leaderboard API without creating new users
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('Key:', supabaseKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, total_points')
      .limit(1);

    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful');
    console.log('📊 Sample data:', data);
    return true;
  } catch (error) {
    console.error('💥 Connection error:', error.message);
    return false;
  }
}

async function testLeaderboardQuery() {
  try {
    console.log('\n🏆 Testing leaderboard query...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        full_name,
        avatar_url,
        total_points,
        current_streak,
        user_stats (
          total_quizzes_completed,
          total_questions_answered,
          overall_accuracy
        )
      `)
      .not('display_name', 'is', null)
      .order('total_points', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Leaderboard query failed:', error.message);
      return false;
    }

    console.log('✅ Leaderboard query successful');
    
    if (!profiles || profiles.length === 0) {
      console.log('📝 No users found in leaderboard (expected for reset database)');
      console.log('🎯 Empty state will be displayed in the app');
    } else {
      console.log(`📊 Found ${profiles.length} users in leaderboard:`);
      profiles.forEach((user, index) => {
        const stats = user.user_stats?.[0] || {};
        console.log(`  ${index + 1}. ${user.display_name} - ${user.total_points} points`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('💥 Leaderboard query error:', error.message);
    return false;
  }
}

async function testUserStatsTable() {
  try {
    console.log('\n📈 Testing user_stats table...');
    
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ User stats query failed:', error.message);
      return false;
    }

    console.log('✅ User stats query successful');
    console.log(`📊 Found ${data.length} user stats records`);
    
    return true;
  } catch (error) {
    console.error('💥 User stats query error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting leaderboard functionality tests...\n');

  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Cannot proceed - connection failed');
    return;
  }

  const leaderboardOk = await testLeaderboardQuery();
  const statsOk = await testUserStatsTable();

  console.log('\n📋 Test Summary:');
  console.log(`  Connection: ${connectionOk ? '✅' : '❌'}`);
  console.log(`  Leaderboard Query: ${leaderboardOk ? '✅' : '❌'}`);
  console.log(`  User Stats Table: ${statsOk ? '✅' : '❌'}`);

  if (connectionOk && leaderboardOk && statsOk) {
    console.log('\n🎉 All tests passed! The leaderboard is ready to use.');
    console.log('\n📖 Next steps:');
    console.log('  1. Visit http://localhost:5173/leaderboard to see the empty state');
    console.log('  2. Register a new user and complete some quizzes');
    console.log('  3. Watch the leaderboard update in real-time');
    console.log('  4. Register multiple users to test ranking');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
  }
}

runTests().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});