import { createQuizSession, completeQuizSession } from './src/services/questions/sessionService.js';
import { supabase } from './src/lib/supabase.js';

/**
 * Direct test of quiz session creation without MCP complexity
 */

async function testSessionCreationDirect() {
  console.log('🚀 Testing Quiz Session Creation Directly\n');

  // Test User ID from our previous MCP test
  const testUserId = '02998230-6a6e-48b4-9549-5f7fbfbd4c83'; // test@usmletrivia.com
  const testUserId2 = 'ae428e9d-4700-42da-b0d1-37fba5e28c94'; // jimkalinov@gmail.com

  try {
    // Test 1: Direct session creation using the service function
    console.log('Test 1: Testing createQuizSession service function...');
    
    const sessionConfig = {
      userId: testUserId,
      sessionType: 'quick',
      totalQuestions: 5,
      categoryName: 'mixed',
      timePerQuestion: null,
      autoAdvance: false,
      showExplanations: true
    };

    console.log('Creating session with config:', sessionConfig);
    
    try {
      const createdSession = await createQuizSession(sessionConfig);
      console.log('✅ Session created successfully:', createdSession);
      
      // Test session completion
      console.log('\nTesting session completion...');
      const completionData = {
        correctAnswers: 3,
        totalTimeSeconds: 120,
        pointsEarned: 300
      };
      
      const completedSession = await completeQuizSession(createdSession.id, completionData);
      console.log('✅ Session completed successfully:', completedSession);
      
    } catch (error) {
      console.error('❌ Session creation failed:', error.message);
      console.log('Error details:', error);
      
      // Let's check if the user exists in auth.users
      console.log('\nChecking if user exists in auth.users...');
      const { data: users, error: userError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('id', testUserId);
      
      console.log('User query result:', { users, userError });
    }

    // Test 2: Try with alternative user ID
    console.log('\n\nTest 2: Testing with alternative user ID...');
    
    const sessionConfig2 = {
      userId: testUserId2,
      sessionType: 'self_paced',
      totalQuestions: 10,
      categoryName: 'mixed'
    };

    try {
      const createdSession2 = await createQuizSession(sessionConfig2);
      console.log('✅ Session 2 created successfully:', createdSession2);
      
      // Clean up
      await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', createdSession2.id);
      console.log('✅ Session 2 cleaned up');
      
    } catch (error) {
      console.error('❌ Session 2 creation failed:', error.message);
    }

    // Test 3: Direct database insertion test
    console.log('\n\nTest 3: Testing direct database insertion...');
    
    try {
      const { data: directSession, error: directError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: testUserId,
          session_type: 'self_paced',
          total_questions: 5,
          started_at: new Date().toISOString(),
          category_name: 'mixed',
          settings: {
            timePerQuestion: null,
            autoAdvance: false,
            showExplanations: true
          }
        })
        .select()
        .single();

      if (directError) {
        console.error('❌ Direct insertion failed:', directError);
      } else {
        console.log('✅ Direct insertion successful:', directSession);
        
        // Clean up
        await supabase
          .from('quiz_sessions')
          .delete()
          .eq('id', directSession.id);
        console.log('✅ Direct session cleaned up');
      }
    } catch (error) {
      console.error('❌ Direct insertion test failed:', error);
    }

    // Test 4: Check quiz_sessions table schema
    console.log('\n\nTest 4: Checking quiz_sessions table schema...');
    
    try {
      const { data: schema, error: schemaError } = await supabase
        .rpc('get_table_schema', { table_name: 'quiz_sessions' });
      
      if (schemaError) {
        console.log('Schema RPC not available, trying alternative method...');
        
        // Try a simpler approach - just select from the table to see what columns exist
        const { data: sample, error: sampleError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .limit(1);
        
        if (sampleError) {
          console.error('❌ Cannot access quiz_sessions table:', sampleError);
        } else {
          console.log('✅ quiz_sessions table accessible');
          if (sample && sample.length > 0) {
            console.log('Sample record structure:', Object.keys(sample[0]));
          } else {
            console.log('Table exists but is empty');
          }
        }
      } else {
        console.log('✅ Table schema:', schema);
      }
    } catch (error) {
      console.error('❌ Schema check failed:', error);
    }

  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }
}

testSessionCreationDirect().catch(console.error);