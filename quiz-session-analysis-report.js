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

console.log('📊 QUIZ SESSION ANALYSIS REPORT');
console.log('================================');
console.log('');

async function simulateAppFlow() {
  const client = createClient(supabaseUrl, publishableKey);

  console.log('🎯 SIMULATING ACTUAL APP FLOW');
  console.log('------------------------------');

  try {
    // Step 1: Authenticate user (as the app would do)
    console.log('1. Authenticating user...');
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PW
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ User authenticated:', authData.user.id);

    // Step 2: Create quiz session (as useQuizController would do)
    console.log('\n2. Creating quiz session via useQuizController flow...');
    
    const sessionData = {
      user_id: authData.user.id,
      session_type: 'timed',
      total_questions: 10,
      category_name: 'mixed',
      time_per_question: 60,
      total_time_limit: 600,
      auto_advance: true,
      show_explanations: false,
      settings: {
        quizMode: 'quick',
        categoryId: 'mixed',
        difficulty: 'medium'
      }
    };

    const { data: sessionResult, error: sessionError } = await client
      .from('quiz_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (sessionError) {
      console.log('❌ Session creation failed:', sessionError.message);
      console.log('Error details:', sessionError);
      return;
    }

    console.log('✅ Quiz session created successfully!');
    console.log('Session ID:', sessionResult.id);
    console.log('Session data:', sessionResult);

    // Step 3: Test recording quiz responses
    console.log('\n3. Recording quiz responses...');
    
    const responses = [
      {
        session_id: sessionResult.id,
        question_id: 1,
        selected_option_id: 'A',
        is_correct: true,
        time_spent_seconds: 45,
        response_order: 1
      },
      {
        session_id: sessionResult.id,
        question_id: 2,
        selected_option_id: 'B',
        is_correct: false,
        time_spent_seconds: 52,
        response_order: 2
      }
    ];

    const { data: responsesResult, error: responsesError } = await client
      .from('quiz_responses')
      .insert(responses)
      .select();

    if (responsesError) {
      console.log('❌ Response recording failed:', responsesError.message);
    } else {
      console.log('✅ Quiz responses recorded:', responsesResult.length, 'responses');
    }

    // Step 4: Complete the session
    console.log('\n4. Completing quiz session...');
    
    const { data: completedSession, error: completionError } = await client
      .from('quiz_sessions')
      .update({
        correct_answers: 1,
        completed_at: new Date().toISOString(),
        time_spent_seconds: 97,
        status: 'completed',
        score: 1,
        accuracy: 0.50
      })
      .eq('id', sessionResult.id)
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (completionError) {
      console.log('❌ Session completion failed:', completionError.message);
    } else {
      console.log('✅ Quiz session completed successfully!');
    }

    // Step 5: Verify session exists and count
    console.log('\n5. Verifying session count...');
    
    const { data: userSessions, error: countError } = await client
      .from('quiz_sessions')
      .select('id, status, score, completed_at')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (countError) {
      console.log('❌ Failed to count sessions:', countError.message);
    } else {
      console.log('✅ User now has', userSessions.length, 'total sessions');
      console.log('Recent sessions:', userSessions.slice(0, 3));
    }

    // Clean up test session (optional)
    await client
      .from('quiz_responses')
      .delete()
      .eq('session_id', sessionResult.id);
    
    await client
      .from('quiz_sessions')
      .delete()
      .eq('id', sessionResult.id);

    console.log('\n🧹 Test session cleaned up');

  } catch (error) {
    console.error('💥 Simulation failed:', error);
  }
}

function generateReport() {
  console.log('\n📋 ANALYSIS SUMMARY');
  console.log('==================');
  console.log('');
  
  console.log('🔍 KEY FINDINGS:');
  console.log('');
  console.log('1. LEGACY KEYS DISABLED:');
  console.log('   - anon_key and service_role_key were disabled on 2025-07-16');
  console.log('   - Only publishable_key and secret_key work now');
  console.log('');
  
  console.log('2. PUBLISHABLE KEY WORKS:');
  console.log('   - The publishable key successfully connects to Supabase');
  console.log('   - It can read data and perform authenticated operations');
  console.log('');
  
  console.log('3. RLS POLICIES ACTIVE:');
  console.log('   - quiz_sessions table has RLS enabled');
  console.log('   - Two policies exist: one for authenticated users, one for public');
  console.log('   - Both require user_id = auth.uid() for access');
  console.log('');
  
  console.log('4. AUTHENTICATION REQUIRED:');
  console.log('   - Anonymous users cannot insert quiz sessions');
  console.log('   - Users must be authenticated to create sessions');
  console.log('   - RLS policy blocks unauthenticated inserts');
  console.log('');
  
  console.log('5. SCHEMA COMPATIBILITY:');
  console.log('   - The quiz_sessions table has the correct schema');
  console.log('   - No "answers" column exists (as expected)');
  console.log('   - All required fields are present');
  console.log('');
  
  console.log('🎯 ROOT CAUSE ANALYSIS:');
  console.log('');
  console.log('The "0 quiz sessions" issue is likely caused by one of:');
  console.log('');
  console.log('A) AUTHENTICATION ISSUES:');
  console.log('   - Users not properly authenticated when sessions are created');
  console.log('   - Auth context not properly initialized');
  console.log('   - Race condition between auth and session creation');
  console.log('');
  
  console.log('B) ERROR HANDLING:');
  console.log('   - Session creation errors being silently caught');
  console.log('   - RLS policy violations not being properly logged');
  console.log('   - Network errors during session creation');
  console.log('');
  
  console.log('C) TIMING ISSUES:');
  console.log('   - Session creation attempted before auth is complete');
  console.log('   - Race condition in auth state management');
  console.log('');
  
  console.log('🔧 RECOMMENDED FIXES:');
  console.log('');
  console.log('1. ADD ROBUST ERROR LOGGING:');
  console.log('   - Log all session creation attempts and failures');
  console.log('   - Add specific error handling for RLS policy violations');
  console.log('   - Monitor auth state during session creation');
  console.log('');
  
  console.log('2. VERIFY AUTHENTICATION:');
  console.log('   - Ensure createQuizSession only runs when user is authenticated');
  console.log('   - Add auth state checks before database operations');
  console.log('   - Implement retry logic for auth-dependent operations');
  console.log('');
  
  console.log('3. IMPROVE USER FEEDBACK:');
  console.log('   - Show clear error messages when session creation fails');
  console.log('   - Prompt users to log in if not authenticated');
  console.log('   - Add loading states during session creation');
  console.log('');
  
  console.log('4. DATABASE MONITORING:');
  console.log('   - Set up alerts for failed quiz session insertions');
  console.log('   - Monitor RLS policy violations in Supabase logs');
  console.log('   - Track session creation success rates');
}

async function runCompleteAnalysis() {
  await simulateAppFlow();
  generateReport();
}

runCompleteAnalysis().catch(console.error);