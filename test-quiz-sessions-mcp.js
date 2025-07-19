import { executeSupabaseQuery, initializeMcpClient } from './src/lib/supabaseMcpClient.js';

async function testQuizSessions() {
  console.log('Testing quiz_sessions table via MCP...');
  
  try {
    // Set the access token
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // 1. Check current count of quiz_sessions
    console.log('\n1. Checking current count of quiz_sessions...');
    const countResult = await executeSupabaseQuery('SELECT COUNT(*) as total_sessions FROM quiz_sessions;');
    
    if (countResult.success) {
      console.log('✅ Quiz sessions count query successful');
      console.log('Count result:', countResult.data);
    } else {
      console.error('❌ Count query failed:', countResult.error);
    }
    
    // 2. Check table structure
    console.log('\n2. Checking quiz_sessions table structure...');
    const structureResult = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_sessions' 
      ORDER BY ordinal_position;
    `);
    
    if (structureResult.success) {
      console.log('✅ Table structure query successful');
      console.log('Structure result:', structureResult.data);
    } else {
      console.error('❌ Structure query failed:', structureResult.error);
    }
    
    // 3. Check recent sessions (if any)
    console.log('\n3. Checking recent quiz_sessions...');
    const recentResult = await executeSupabaseQuery(`
      SELECT id, user_id, created_at, updated_at, status, total_questions, 
             current_question_index, score, time_limit_minutes
      FROM quiz_sessions 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    
    if (recentResult.success) {
      console.log('✅ Recent sessions query successful');
      console.log('Recent sessions:', recentResult.data);
    } else {
      console.error('❌ Recent sessions query failed:', recentResult.error);
    }
    
    // 4. Check user authentication and profiles
    console.log('\n4. Checking profiles table (users)...');
    const profilesResult = await executeSupabaseQuery(`
      SELECT COUNT(*) as total_profiles, 
             COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_profiles
      FROM profiles;
    `);
    
    if (profilesResult.success) {
      console.log('✅ Profiles check successful');
      console.log('Profiles result:', profilesResult.data);
    } else {
      console.error('❌ Profiles query failed:', profilesResult.error);
    }
    
    // 5. Check RLS policies on quiz_sessions
    console.log('\n5. Checking RLS policies on quiz_sessions...');
    const rlsResult = await executeSupabaseQuery(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies 
      WHERE tablename = 'quiz_sessions';
    `);
    
    if (rlsResult.success) {
      console.log('✅ RLS policies query successful');
      console.log('RLS policies:', rlsResult.data);
    } else {
      console.error('❌ RLS policies query failed:', rlsResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testQuizSessions();