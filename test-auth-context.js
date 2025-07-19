import { createClient } from '@supabase/supabase-js';

/**
 * Test to verify authentication context and session creation
 * This mimics how the React app should work
 */

// Get the correct keys (same as used in the app)
const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';

console.log('🧪 Testing Authentication Context and Session Creation\n');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

async function testAuthenticationFlow() {
  console.log('Testing complete authentication flow...\n');

  try {
    // Step 1: Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tags')
      .select('id, name')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Basic connection successful\n');

    // Step 2: Test login
    console.log('2️⃣ Testing login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jimkalinov@gmail.com',
      password: 'Jimkali90#'
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return;
    }

    console.log('✅ Login successful');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Session exists:', !!authData.session);
    console.log('   Access token exists:', !!authData.session?.access_token);
    console.log('');

    // Step 3: Verify authentication state
    console.log('3️⃣ Verifying authentication state...');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError || !user) {
      console.error('❌ Cannot get authenticated user:', getUserError?.message);
      return;
    }

    console.log('✅ User authentication verified');
    console.log('   Verified user ID:', user.id);
    console.log('');

    // Step 4: Test profile access (RLS test)
    console.log('4️⃣ Testing profile access (RLS)...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('⚠️  Profile access failed (expected if no profile):', profileError.message);
    } else {
      console.log('✅ Profile access successful:', profile);
    }
    console.log('');

    // Step 5: Test session creation (the main test)
    console.log('5️⃣ Testing quiz session creation...');
    
    const sessionData = {
      user_id: user.id,
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

    console.log('   Creating session for user:', user.id);
    
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError.message);
      console.error('   Error code:', sessionError.code);
      console.error('   Error details:', sessionError.details);
      console.error('   Error hint:', sessionError.hint);
      
      // Check table permissions
      console.log('\n   🔍 Checking table permissions...');
      const { data: sessions, error: selectError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.error('   ❌ Cannot select from quiz_sessions:', selectError.message);
      } else {
        console.log('   ✅ Can select from quiz_sessions table');
        console.log('   📊 Sample records:', sessions.length);
      }
      
      return;
    }

    console.log('✅ Quiz session created successfully!');
    console.log('   Session ID:', session.id);
    console.log('   User ID:', session.user_id);
    console.log('   Session type:', session.session_type);
    console.log('   Created at:', session.started_at);
    console.log('');

    // Step 6: Test session update
    console.log('6️⃣ Testing session update...');
    
    const { data: updatedSession, error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: 3,
        completed_at: new Date().toISOString(),
        total_time_seconds: 120,
        points_earned: 300
      })
      .eq('id', session.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Session update failed:', updateError.message);
    } else {
      console.log('✅ Session update successful');
      console.log('   Points earned:', updatedSession.points_earned);
    }
    console.log('');

    // Step 7: Clean up
    console.log('7️⃣ Cleaning up...');
    
    const { error: deleteError } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('id', session.id);

    if (deleteError) {
      console.warn('⚠️  Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test session cleaned up');
    }

    // Step 8: Logout
    console.log('   Logging out...');
    await supabase.auth.signOut();
    console.log('✅ Logged out successfully');
    console.log('');

    console.log('🎉 All tests passed! Quiz session creation is working correctly.');
    console.log('');
    console.log('📝 If the app is still having issues, check:');
    console.log('   • React authentication context initialization');
    console.log('   • Environment variables in the browser');
    console.log('   • User state management in the frontend');
    console.log('   • Timing of session creation calls');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Test without authentication (should fail)
async function testUnauthenticatedAccess() {
  console.log('\n🔒 Testing unauthenticated access (should fail)...');
  
  // Make sure we're logged out
  await supabase.auth.signOut();
  
  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('✅ Unauthenticated access properly blocked:', error.message);
  } else {
    console.log('❌ Security issue: Unauthenticated access allowed');
  }
}

async function runTests() {
  await testAuthenticationFlow();
  await testUnauthenticatedAccess();
}

runTests().catch(console.error);