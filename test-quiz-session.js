import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuizSessionFlow() {
  console.log('🧪 Testing quiz session and response flow...\n');

  try {
    // Test 1: Check if quiz_sessions table exists
    console.log('1. Testing quiz_sessions table:');
    const { data: sessions, error: sessionsError, count: sessionsCount } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (sessionsError) {
      console.log('   ❌ Quiz sessions table error:', sessionsError.message);
    } else {
      console.log(`   ✅ Quiz sessions table exists (${sessionsCount} records)`);
      if (sessions.length > 0) {
        console.log('   📋 Table structure:', Object.keys(sessions[0]));
      }
    }

    // Test 2: Check if quiz_responses table exists
    console.log('\n2. Testing quiz_responses table:');
    const { data: responses, error: responsesError, count: responsesCount } = await supabase
      .from('quiz_responses')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (responsesError) {
      console.log('   ❌ Quiz responses table error:', responsesError.message);
    } else {
      console.log(`   ✅ Quiz responses table exists (${responsesCount} records)`);
      if (responses.length > 0) {
        console.log('   📋 Table structure:', Object.keys(responses[0]));
      }
    }

    // Test 3: Check if user_question_history table exists
    console.log('\n3. Testing user_question_history table:');
    const { data: history, error: historyError, count: historyCount } = await supabase
      .from('user_question_history')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (historyError) {
      console.log('   ❌ User question history table error:', historyError.message);
    } else {
      console.log(`   ✅ User question history table exists (${historyCount} records)`);
      if (history.length > 0) {
        console.log('   📋 Table structure:', Object.keys(history[0]));
      }
    }

    // Test 4: Test creating a quiz session (with dummy data)
    console.log('\n4. Testing quiz session creation:');
    try {
      const { data: newSession, error: createError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
          session_type: 'self_paced',
          total_questions: 5,
          started_at: new Date().toISOString(),
          settings: { test: true }
        })
        .select()
        .single();
      
      if (createError) {
        console.log('   ❌ Session creation error:', createError.message);
        console.log('   📝 This might be due to missing user or foreign key constraints');
      } else {
        console.log('   ✅ Session created successfully:', newSession.id);
        
        // Clean up - delete the test session
        await supabase.from('quiz_sessions').delete().eq('id', newSession.id);
        console.log('   🧹 Test session cleaned up');
      }
    } catch (error) {
      console.log('   ❌ Session creation exception:', error.message);
    }

    // Test 5: Test RPC functions
    console.log('\n5. Testing RPC functions:');
    
    // Test record_question_interaction RPC
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('record_question_interaction', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_question_id: '00000000-0000-0000-0000-000000000000',
        p_answered_correctly: true
      });
      
      if (rpcError) {
        console.log('   ❌ RPC record_question_interaction error:', rpcError.message);
      } else {
        console.log('   ✅ RPC record_question_interaction works');
      }
    } catch (error) {
      console.log('   ❌ RPC exception:', error.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testQuizSessionFlow();