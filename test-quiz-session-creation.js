import { initializeMcpClient, executeSupabaseQuery, getMcpTools } from './src/lib/supabaseMcpClient.js';

/**
 * Test script to verify quiz session creation functionality
 * This will help us isolate whether the issue is with authentication or the session creation logic
 */

async function testQuizSessionCreation() {
  console.log('🚀 Starting Quiz Session Creation Test\n');

  try {
    // Step 1: Initialize MCP client and test connection
    console.log('Step 1: Testing MCP connection...');
    const toolsResult = await getMcpTools();
    
    if (!toolsResult.success) {
      console.error('❌ MCP connection failed:', toolsResult.error);
      return;
    }
    
    console.log('✅ MCP connected successfully');
    console.log('Available tools:', toolsResult.tools.map(t => t.name).join(', '));

    // Step 2: Get a valid user ID from auth.users table
    console.log('\nStep 2: Getting valid user ID...');
    const usersQuery = `
      SELECT id, email, created_at 
      FROM auth.users 
      WHERE email = 'jimkalinov@gmail.com'
      LIMIT 1;
    `;
    
    const usersResult = await executeSupabaseQuery(usersQuery);
    
    if (!usersResult.success) {
      console.error('❌ Failed to get user ID:', usersResult.error);
      
      // Try to get any user ID as fallback
      console.log('Trying to get any user ID as fallback...');
      const fallbackQuery = `SELECT id, email FROM auth.users LIMIT 1;`;
      const fallbackResult = await executeSupabaseQuery(fallbackQuery);
      
      if (!fallbackResult.success) {
        console.error('❌ No users found in database');
        return;
      }
      
      console.log('Found fallback user:', fallbackResult.data);
      return;
    }

    console.log('✅ Found test user:', usersResult.data);
    
    // Parse the MCP response to extract user data
    const rawText = usersResult.data[0].content[0].text;
    console.log('Raw MCP response:', rawText);
    
    const match = rawText.match(/\[{.*?}\]/s);
    if (!match) {
      console.error('❌ Could not parse user data from MCP response');
      console.log('Full response structure:', JSON.stringify(usersResult.data, null, 2));
      return;
    }
    
    const userData = JSON.parse(match[0])[0];
    const testUserId = userData.id;
    console.log('Test User ID:', testUserId);
    console.log('Test User Email:', userData.email);

    // Step 3: Test direct quiz_sessions table insert
    console.log('\nStep 3: Testing direct quiz session creation...');
    
    const sessionInsertQuery = `
      INSERT INTO quiz_sessions (
        user_id,
        session_type,
        total_questions,
        started_at
      ) VALUES (
        '${testUserId}',
        'self_paced',
        5,
        NOW()
      ) RETURNING id, user_id, session_type, total_questions, started_at;
    `;
    
    const sessionResult = await executeSupabaseQuery(sessionInsertQuery);
    
    if (!sessionResult.success) {
      console.error('❌ Quiz session creation failed:', sessionResult.error);
      
      // Check table structure to understand the issue
      console.log('\nChecking quiz_sessions table structure...');
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'quiz_sessions' 
        ORDER BY ordinal_position;
      `;
      
      const structureResult = await executeSupabaseQuery(structureQuery);
      if (structureResult.success) {
        console.log('Table structure:', structureResult.data);
      }
      
      return;
    }

    console.log('✅ Quiz session created successfully:', sessionResult.data);
    
    // Parse session creation result
    const sessionRawText = sessionResult.data[0].content[0].text;
    const sessionMatch = sessionRawText.match(/\[{.*?}\]/);
    if (!sessionMatch) {
      console.error('❌ Could not parse session data from MCP response');
      return;
    }
    
    const sessionData = JSON.parse(sessionMatch[0])[0];
    const createdSessionId = sessionData.id;

    // Step 4: Test session cleanup
    console.log('\nStep 4: Cleaning up test session...');
    const deleteQuery = `DELETE FROM quiz_sessions WHERE id = ${createdSessionId};`;
    const deleteResult = await executeSupabaseQuery(deleteQuery);
    
    if (deleteResult.success) {
      console.log('✅ Test session cleaned up successfully');
    } else {
      console.warn('⚠️  Failed to clean up test session:', deleteResult.error);
    }

    // Step 5: Test the application's createQuizSession function simulation
    console.log('\nStep 5: Testing createQuizSession function simulation...');
    
    const sessionConfigQuery = `
      INSERT INTO quiz_sessions (
        user_id,
        session_type,
        total_questions,
        started_at,
        category_name,
        settings
      ) VALUES (
        '${testUserId}',
        'quick',
        10,
        NOW(),
        'mixed',
        '{"timePerQuestion": null, "autoAdvance": false, "showExplanations": true}'::jsonb
      ) RETURNING *;
    `;
    
    const appSessionResult = await executeSupabaseQuery(sessionConfigQuery);
    
    if (!appSessionResult.success) {
      console.error('❌ Application-style session creation failed:', appSessionResult.error);
      return;
    }
    
    console.log('✅ Application-style session created:', appSessionResult.data);
    
    // Parse app session creation result
    const appSessionRawText = appSessionResult.data[0].content[0].text;
    const appSessionMatch = appSessionRawText.match(/\[{.*?}\]/);
    if (!appSessionMatch) {
      console.error('❌ Could not parse app session data from MCP response');
      return;
    }
    
    const appSessionData = JSON.parse(appSessionMatch[0])[0];
    const appSessionId = appSessionData.id;
    
    // Clean up this session too
    const cleanup2Query = `DELETE FROM quiz_sessions WHERE id = ${appSessionId};`;
    await executeSupabaseQuery(cleanup2Query);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nConclusions:');
    console.log('✅ Database connection is working');
    console.log('✅ User ID exists in auth.users table');
    console.log('✅ quiz_sessions table accepts new records');
    console.log('✅ Session creation logic should work');
    console.log('\n📝 The issue is likely in the frontend authentication flow or user context.');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Set required environment variables for MCP
process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';

// Run the test
testQuizSessionCreation().catch(console.error);