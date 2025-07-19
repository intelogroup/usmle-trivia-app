import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function getDatabaseStructure() {
  console.log('Getting complete database structure...');
  
  try {
    // Set the access token
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // 1. Get all tables
    console.log('\n1. Getting all tables...');
    const tablesResult = await executeSupabaseQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.success) {
      console.log('✅ Tables query successful');
      console.log('Tables:', tablesResult.data);
    } else {
      console.error('❌ Tables query failed:', tablesResult.error);
    }
    
    // 2. Get profiles table structure
    console.log('\n2. Getting profiles table structure...');
    const profilesStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      ORDER BY ordinal_position;
    `);
    
    if (profilesStructure.success) {
      console.log('✅ Profiles structure query successful');
      console.log('Profiles structure:', profilesStructure.data);
    } else {
      console.error('❌ Profiles structure query failed:', profilesStructure.error);
    }
    
    // 3. Get questions table structure
    console.log('\n3. Getting questions table structure...');
    const questionsStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position;
    `);
    
    if (questionsStructure.success) {
      console.log('✅ Questions structure query successful');
      console.log('Questions structure:', questionsStructure.data);
    } else {
      console.error('❌ Questions structure query failed:', questionsStructure.error);
    }
    
    // 4. Get quiz_responses table structure (if exists)
    console.log('\n4. Getting quiz_responses table structure...');
    const responsesStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_responses' 
      ORDER BY ordinal_position;
    `);
    
    if (responsesStructure.success) {
      console.log('✅ Quiz responses structure query successful');
      console.log('Quiz responses structure:', responsesStructure.data);
    } else {
      console.error('❌ Quiz responses structure query failed:', responsesStructure.error);
    }
    
    // 5. Get tags table structure
    console.log('\n5. Getting tags table structure...');
    const tagsStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'tags' 
      ORDER BY ordinal_position;
    `);
    
    if (tagsStructure.success) {
      console.log('✅ Tags structure query successful');
      console.log('Tags structure:', tagsStructure.data);
    } else {
      console.error('❌ Tags structure query failed:', tagsStructure.error);
    }
    
    // 6. Check for leaderboard-related tables
    console.log('\n6. Checking for leaderboard or user stats tables...');
    const leaderboardCheck = await executeSupabaseQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%leaderboard%' OR table_name LIKE '%stats%' OR table_name LIKE '%score%')
      ORDER BY table_name;
    `);
    
    if (leaderboardCheck.success) {
      console.log('✅ Leaderboard tables check successful');
      console.log('Leaderboard tables:', leaderboardCheck.data);
    } else {
      console.error('❌ Leaderboard tables check failed:', leaderboardCheck.error);
    }
    
    // 7. Sample data from profiles
    console.log('\n7. Getting sample profile data...');
    const sampleProfiles = await executeSupabaseQuery(`
      SELECT id, username, full_name, email, created_at, updated_at 
      FROM profiles 
      LIMIT 3;
    `);
    
    if (sampleProfiles.success) {
      console.log('✅ Sample profiles query successful');
      console.log('Sample profiles:', sampleProfiles.data);
    } else {
      console.error('❌ Sample profiles query failed:', sampleProfiles.error);
    }
    
  } catch (error) {
    console.error('❌ Database structure check failed with error:', error);
  }
}

getDatabaseStructure();