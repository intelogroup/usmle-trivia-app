import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function checkQuizSessionsStructure() {
  console.log('🔍 Checking quiz sessions table structure...');
  
  try {
    // Set the access token
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // Check quiz sessions structure
    const quizSessionsStructure = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_sessions' 
      ORDER BY ordinal_position;
    `);
    
    if (quizSessionsStructure.success) {
      console.log('✅ Quiz sessions structure query successful');
      console.log('Quiz sessions structure:', quizSessionsStructure.data);
    } else {
      console.error('❌ Quiz sessions structure query failed:', quizSessionsStructure.error);
    }
    
    // Simple count of quiz sessions
    const quizSessionsCount = await executeSupabaseQuery(`
      SELECT COUNT(*) as total_sessions FROM quiz_sessions;
    `);
    
    if (quizSessionsCount.success) {
      console.log('✅ Quiz sessions count successful');
      console.log('Total quiz sessions:', quizSessionsCount.data);
    } else {
      console.error('❌ Quiz sessions count failed:', quizSessionsCount.error);
    }
    
  } catch (error) {
    console.error('❌ Quiz sessions check failed with error:', error);
  }
}

checkQuizSessionsStructure();