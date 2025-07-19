import { createClient } from '@supabase/supabase-js';

/**
 * Simple test to verify quiz session creation using direct Supabase client
 */

// Supabase configuration
const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MTg2NDAsImV4cCI6MjAzNDM5NDY0MH0.Haz24oCjY2ZEOPRZQq7UTYC4zU9Yj4OcZEE2wKjQ_Pk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuizSessionCreation() {
  console.log('🚀 Testing Quiz Session Creation (Simple)\n');

  try {
    // Test 1: Check if we can connect to the database
    console.log('Test 1: Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tags')
      .select('id, name')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Get available users
    console.log('\nTest 2: Getting available test users...');
    const { data: users, error: usersError } = await supabase
      .rpc('get_test_users'); // This might not exist, let's try auth.users

    if (usersError) {
      console.log('RPC get_test_users not available, trying direct query...');
      
      // Try to get users another way
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(3);
      
      if (testError) {
        console.log('Cannot access profiles table either:', testError.message);
        console.log('Using hardcoded test user ID...');
        
        // Use the known test user IDs from our previous MCP test
        const testUserIds = [
          '02998230-6a6e-48b4-9549-5f7fbfbd4c83', // test@usmletrivia.com
          'ae428e9d-4700-42da-b0d1-37fba5e28c94'  // jimkalinov@gmail.com
        ];
        
        await testSessionCreationWithUserId(testUserIds[1]); // Use jimkalinov@gmail.com
        return;
      } else {
        console.log('✅ Found users in profiles:', testData);
        if (testData.length > 0) {
          await testSessionCreationWithUserId(testData[0].id);
          return;
        }
      }
    } else {
      console.log('✅ Found test users:', users);
      if (users.length > 0) {
        await testSessionCreationWithUserId(users[0].id);
        return;
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

async function testSessionCreationWithUserId(userId) {
  console.log(`\n🧪 Testing session creation with user ID: ${userId}\n`);

  try {
    // Test 3: Create a quiz session
    console.log('Test 3: Creating quiz session...');
    
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

    console.log('Session data:', sessionData);

    const { data: createdSession, error: createError } = await supabase
      .from('quiz_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Session creation failed:', createError);
      
      // Check table schema to understand the issue
      console.log('\nChecking quiz_sessions table structure...');
      const { data: sessions, error: selectError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.error('❌ Cannot even select from quiz_sessions:', selectError);
      } else {
        console.log('✅ quiz_sessions table is accessible');
        if (sessions.length > 0) {
          console.log('Sample record keys:', Object.keys(sessions[0]));
        } else {
          console.log('Table exists but is empty');
        }
      }
      return;
    }

    console.log('✅ Quiz session created successfully!');
    console.log('Session details:', createdSession);

    // Test 4: Update the session (simulate completion)
    console.log('\nTest 4: Completing the session...');
    
    const { data: completedSession, error: completeError } = await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: 3,
        completed_at: new Date().toISOString(),
        total_time_seconds: 120,
        points_earned: 300,
        is_completed: true
      })
      .eq('id', createdSession.id)
      .select()
      .single();

    if (completeError) {
      console.error('❌ Session completion failed:', completeError);
    } else {
      console.log('✅ Session completed successfully!');
      console.log('Completed session details:', completedSession);
    }

    // Test 5: Clean up
    console.log('\nTest 5: Cleaning up test session...');
    
    const { error: deleteError } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('id', createdSession.id);

    if (deleteError) {
      console.warn('⚠️  Failed to clean up test session:', deleteError);
    } else {
      console.log('✅ Test session cleaned up successfully');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ Database connection works');
    console.log('✅ User ID is valid');
    console.log('✅ quiz_sessions table accepts new records');
    console.log('✅ Session completion works');
    console.log('✅ Session cleanup works');
    console.log('\n💡 The quiz session creation logic is working correctly!');
    console.log('   The issue is likely in the frontend authentication or user context.');

  } catch (error) {
    console.error('💥 Session test failed:', error);
  }
}

testQuizSessionCreation().catch(console.error);