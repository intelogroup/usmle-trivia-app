import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function testQuizSessionsCorrectColumns() {
  console.log('Testing quiz_sessions with correct column names...');
  
  try {
    // Set the access token
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // Check recent sessions with correct column names
    console.log('\n1. Checking recent quiz_sessions with correct columns...');
    const recentResult = await executeSupabaseQuery(`
      SELECT id, user_id, created_at, updated_at, status, total_questions, 
             score, questions_count, accuracy, quiz_type, category_name,
             time_spent, duration_minutes, completed_at
      FROM quiz_sessions 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    
    if (recentResult.success) {
      console.log('✅ Recent sessions query successful');
      console.log('Recent sessions:', recentResult.data);
    } else {
      console.error('❌ Recent sessions query failed:', recentResult.error);
    }
    
    // Check sessions by status
    console.log('\n2. Checking sessions by status...');
    const statusResult = await executeSupabaseQuery(`
      SELECT status, COUNT(*) as count
      FROM quiz_sessions 
      GROUP BY status
      ORDER BY count DESC;
    `);
    
    if (statusResult.success) {
      console.log('✅ Status breakdown query successful');
      console.log('Status breakdown:', statusResult.data);
    } else {
      console.error('❌ Status breakdown query failed:', statusResult.error);
    }
    
    // Check recent session creation activity
    console.log('\n3. Checking recent session creation activity...');
    const activityResult = await executeSupabaseQuery(`
      SELECT DATE(created_at) as date, COUNT(*) as sessions_created
      FROM quiz_sessions 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC;
    `);
    
    if (activityResult.success) {
      console.log('✅ Recent activity query successful');
      console.log('Recent activity:', activityResult.data);
    } else {
      console.error('❌ Recent activity query failed:', activityResult.error);
    }
    
    // Check for any sessions with missing user_id (authentication issues)
    console.log('\n4. Checking for sessions with authentication issues...');
    const authIssuesResult = await executeSupabaseQuery(`
      SELECT COUNT(*) as sessions_without_user
      FROM quiz_sessions 
      WHERE user_id IS NULL;
    `);
    
    if (authIssuesResult.success) {
      console.log('✅ Auth issues query successful');
      console.log('Sessions without user_id:', authIssuesResult.data);
    } else {
      console.error('❌ Auth issues query failed:', authIssuesResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testQuizSessionsCorrectColumns();