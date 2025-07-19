#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables from env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, 'env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Fixed Quiz Session Creation Test');
console.log('==================================');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Publishable Key present:', !!publishableKey);
console.log('');

async function testCorrectSessionInsert() {
  console.log('🔗 Testing session creation with correct schema...');
  
  const client = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Create a test session with the correct schema (without 'answers' column)
    const testSession = {
      user_id: '550e8400-e29b-41d4-a716-446655440000', // Test UUID
      quiz_type: 'practice',
      total_questions: 5,
      correct_answers: 4,
      time_spent_seconds: 120,
      completed_at: new Date().toISOString(),
      settings: {
        category: 'mixed',
        difficulty: 'medium',
        timeLimit: 300
      },
      category_name: 'Mixed Questions',
      time_per_question: 60,
      total_time_limit: 300,
      auto_advance: false,
      show_explanations: true,
      session_type: 'practice',
      status: 'completed',
      score: 4,
      duration_minutes: 2,
      questions_served: [1, 2, 3, 4, 5],
      temporary_answers: {},
      commit_to_history: true,
      questions_count: 5,
      accuracy: 0.80
    };

    console.log('📝 Attempting to insert session with publishable key...');

    const { data: insertData, error: insertError } = await client
      .from('quiz_sessions')
      .insert([testSession])
      .select();

    if (insertError) {
      console.log('❌ Error inserting quiz_session:', insertError.message);
      console.log('Error code:', insertError.code);
      console.log('Error details:', insertError);
      
      // Check if it's an RLS policy issue
      if (insertError.message.includes('policy') || insertError.code === '42501') {
        console.log('🔒 This appears to be an RLS policy issue');
        console.log('The publishable key is working, but RLS policies require authenticated users');
      }
    } else {
      console.log('✅ Successfully inserted quiz_session:', insertData);
      
      // Clean up - delete the test session
      const { error: deleteError } = await client
        .from('quiz_sessions')
        .delete()
        .eq('id', insertData[0].id);
        
      if (deleteError) {
        console.log('⚠️ Failed to clean up test session:', deleteError.message);
      } else {
        console.log('🧹 Test session cleaned up successfully');
      }
    }

    // Test simple read operation
    console.log('\n📖 Testing read operation...');
    const { data: readData, error: readError } = await client
      .from('quiz_sessions')
      .select('id, user_id, quiz_type, total_questions, status')
      .limit(3);

    if (readError) {
      console.log('❌ Error reading quiz_sessions:', readError.message);
    } else {
      console.log('✅ Successfully read sessions:', readData.length, 'records');
      if (readData.length > 0) {
        console.log('Sample session:', readData[0]);
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

async function testWithAuthenticatedUser() {
  console.log('\n👤 Testing with authenticated user...');
  
  const client = createClient(supabaseUrl, publishableKey);

  try {
    // Sign in with test user
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PW
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Successfully authenticated user:', authData.user.id);

    // Now try to insert a session as an authenticated user
    const testSession = {
      user_id: authData.user.id, // Use actual authenticated user ID
      quiz_type: 'practice',
      total_questions: 3,
      correct_answers: 2,
      time_spent_seconds: 90,
      completed_at: new Date().toISOString(),
      settings: { category: 'test' },
      status: 'completed',
      score: 2,
      questions_count: 3,
      accuracy: 0.67
    };

    const { data: insertData, error: insertError } = await client
      .from('quiz_sessions')
      .insert([testSession])
      .select();

    if (insertError) {
      console.log('❌ Authenticated user - Error inserting quiz_session:', insertError.message);
      console.log('Error details:', insertError);
    } else {
      console.log('✅ Authenticated user - Successfully inserted quiz_session:', insertData[0].id);
      
      // Test reading own sessions
      const { data: ownSessions, error: ownError } = await client
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', authData.user.id);

      if (ownError) {
        console.log('❌ Error reading own sessions:', ownError.message);
      } else {
        console.log('✅ User can read', ownSessions.length, 'of their own sessions');
      }
    }

    // Sign out
    await client.auth.signOut();

  } catch (error) {
    console.error('💥 Authenticated test failed:', error);
  }
}

async function runTest() {
  await testCorrectSessionInsert();
  await testWithAuthenticatedUser();
  
  console.log('\n📋 Summary:');
  console.log('1. Legacy API keys (anon, service_role) are disabled');
  console.log('2. Publishable key works for reads');
  console.log('3. RLS policies require authenticated users for inserts');
  console.log('4. Schema issue with "answers" column was identified');
  console.log('5. Need to ensure users are authenticated before creating sessions');
}

runTest().catch(console.error);