import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function getUserStatsStructure() {
  console.log('Getting user stats and leaderboard table structures...');
  
  try {
    // Set the access token
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // 1. Get user_stats table structure
    console.log('\n1. Getting user_stats table structure...');
    const userStatsStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_stats' 
      ORDER BY ordinal_position;
    `);
    
    if (userStatsStructure.success) {
      console.log('✅ User stats structure query successful');
      console.log('User stats structure:', userStatsStructure.data);
    } else {
      console.error('❌ User stats structure query failed:', userStatsStructure.error);
    }
    
    // 2. Get user_tag_scores table structure
    console.log('\n2. Getting user_tag_scores table structure...');
    const userTagScoresStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_tag_scores' 
      ORDER BY ordinal_position;
    `);
    
    if (userTagScoresStructure.success) {
      console.log('✅ User tag scores structure query successful');
      console.log('User tag scores structure:', userTagScoresStructure.data);
    } else {
      console.error('❌ User tag scores structure query failed:', userTagScoresStructure.error);
    }
    
    // 3. Get user_progress table structure
    console.log('\n3. Getting user_progress table structure...');
    const userProgressStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_progress' 
      ORDER BY ordinal_position;
    `);
    
    if (userProgressStructure.success) {
      console.log('✅ User progress structure query successful');
      console.log('User progress structure:', userProgressStructure.data);
    } else {
      console.error('❌ User progress structure query failed:', userProgressStructure.error);
    }
    
    // 4. Get sample data from user_stats (if any)
    console.log('\n4. Getting sample user_stats data...');
    const sampleUserStats = await executeSupabaseQuery(`
      SELECT * FROM user_stats LIMIT 3;
    `);
    
    if (sampleUserStats.success) {
      console.log('✅ Sample user stats query successful');
      console.log('Sample user stats:', sampleUserStats.data);
    } else {
      console.error('❌ Sample user stats query failed:', sampleUserStats.error);
    }
    
    // 5. Check RLS policies on user data tables
    console.log('\n5. Checking RLS policies on user data tables...');
    const rlsResult = await executeSupabaseQuery(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies 
      WHERE tablename IN ('profiles', 'user_stats', 'user_tag_scores', 'user_progress')
      ORDER BY tablename, policyname;
    `);
    
    if (rlsResult.success) {
      console.log('✅ RLS policies query successful');
      console.log('RLS policies:', rlsResult.data);
    } else {
      console.error('❌ RLS policies query failed:', rlsResult.error);
    }
    
  } catch (error) {
    console.error('❌ User stats structure check failed with error:', error);
  }
}

getUserStatsStructure();