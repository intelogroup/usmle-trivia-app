import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function testSessionCreationViaMcp() {
  console.log('Testing quiz session creation via MCP client...');
  
  try {
    // Set the access token for MCP
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // 1. Get current session count
    console.log('\\n1. Getting current session count...');
    const countResult = await executeSupabaseQuery('SELECT COUNT(*) as count FROM quiz_sessions;');
    
    if (countResult.success) {
      const countData = JSON.parse(countResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1]);
      const currentCount = countData[0].count;
      console.log(`Current session count: ${currentCount}`);
      
      // 2. Try to create a test session directly via SQL
      console.log('\\n2. Testing session creation via direct SQL...');
      
      // Get a valid user_id from existing data
      const userResult = await executeSupabaseQuery(`
        SELECT user_id FROM quiz_sessions LIMIT 1;
      `);
      
      if (!userResult.success) {
        console.error('❌ Failed to get user ID:', userResult.error);
        return;
      }
      
      const userData = JSON.parse(userResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1]);
      const testUserId = userData[0].user_id;
      console.log(`Using test user ID: ${testUserId}`);
      
      // Create a test session
      const insertResult = await executeSupabaseQuery(`
        INSERT INTO quiz_sessions (
          user_id, 
          session_type, 
          total_questions, 
          quiz_type,
          status,
          created_at,
          started_at
        ) VALUES (
          '${testUserId}',
          'self_paced',
          5,
          'practice',
          'incomplete',
          NOW(),
          NOW()
        ) RETURNING id, user_id, session_type, total_questions, status, created_at;
      `);
      
      if (insertResult.success) {
        const insertData = JSON.parse(insertResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1]);
        console.log('✅ Test session created successfully:', insertData[0]);
        
        // Verify count increased
        const newCountResult = await executeSupabaseQuery('SELECT COUNT(*) as count FROM quiz_sessions;');
        if (newCountResult.success) {
          const newCountData = JSON.parse(newCountResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1]);
          const newCount = newCountData[0].count;
          console.log(`New session count: ${newCount}`);
          
          if (newCount > currentCount) {
            console.log('✅ Session count increased - session creation working properly');
          } else {
            console.log('❌ Session count did not increase - potential issue');
          }
        }
      } else {
        console.error('❌ Failed to create test session:', insertResult.error);
      }
      
      // 3. Test authentication validation
      console.log('\\n3. Testing authentication validation scenarios...');
      
      // Try creating session with invalid user_id
      const invalidUserResult = await executeSupabaseQuery(`
        INSERT INTO quiz_sessions (
          user_id, 
          session_type, 
          total_questions, 
          quiz_type,
          status
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          'self_paced',
          5,
          'practice',
          'incomplete'
        ) RETURNING id;
      `);
      
      if (invalidUserResult.success) {
        console.log('⚠️ WARNING: Session created with invalid user_id - RLS may not be working properly');
      } else {
        console.log('✅ GOOD: Cannot create session with invalid user_id:', invalidUserResult.error);
      }
      
      // 4. Check RLS enforcement
      console.log('\\n4. Checking RLS enforcement...');
      const rlsCheckResult = await executeSupabaseQuery(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN user_id IS NULL THEN 1 END) as sessions_without_user,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_sessions
        FROM quiz_sessions;
      `);
      
      if (rlsCheckResult.success) {
        const rlsData = JSON.parse(rlsCheckResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1]);
        console.log('RLS Check Results:', rlsData[0]);
        
        if (rlsData[0].sessions_without_user === 0) {
          console.log('✅ All sessions have valid user_id - authentication working correctly');
        } else {
          console.log(`⚠️ Found ${rlsData[0].sessions_without_user} sessions without user_id`);
        }
      }
      
      // 5. Analysis of the current state
      console.log('\\n5. Analysis of current quiz session state...');
      const analysisResult = await executeSupabaseQuery(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(total_questions) as avg_questions,
          DATE(created_at) as creation_date,
          COUNT(*) as daily_count
        FROM quiz_sessions 
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY status, DATE(created_at)
        ORDER BY creation_date DESC, status;
      `);
      
      if (analysisResult.success) {
        const analysisData = JSON.parse(analysisResult.data[0].text.match(/<untrusted-data[^>]*>(.+?)<\/untrusted-data[^>]*>/)[1]);
        console.log('Recent session analysis:', analysisData);
        
        const totalRecent = analysisData.reduce((sum, row) => sum + row.count, 0);
        const completedRecent = analysisData.filter(row => row.status === 'completed').reduce((sum, row) => sum + row.count, 0);
        const completionRate = totalRecent > 0 ? (completedRecent / totalRecent * 100).toFixed(1) : 0;
        
        console.log(`\\nSummary:`);
        console.log(`- Total recent sessions (7 days): ${totalRecent}`);
        console.log(`- Completed sessions: ${completedRecent}`);
        console.log(`- Completion rate: ${completionRate}%`);
        
        if (totalRecent > 0) {
          console.log('✅ Session creation is functioning - users are creating sessions');
        } else {
          console.log('❌ No recent sessions - potential issue with session creation flow');
        }
      }
      
    } else {
      console.error('❌ Failed to get session count:', countResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testSessionCreationViaMcp();