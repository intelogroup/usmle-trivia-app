import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bkuowoowlmwranfoliea.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIwMDg1NCwiZXhwIjoyMDY1Nzc2ODU0fQ.V1-SQLXxMeMj6P638-gRpU3i38m2CqYdT2C8nLubLpc'
);

async function resetUserData() {
  console.log('🔍 Checking current user data...');
  
  // Find the test user
  const testEmail = 'jimkalinov@gmail.com';
  
  // Get user ID from auth
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }
  
  const testUser = users.users.find(u => u.email === testEmail);
  if (!testUser) {
    console.log('❌ Test user not found');
    return;
  }
  
  const userId = testUser.id;
  console.log('✅ Found test user:', userId);
  
  // Check current data
  console.log('\n📊 Current user data:');
  
  // Quiz sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId);
  
  if (!sessionsError) {
    console.log(`📝 Quiz sessions: ${sessions.length}`);
    sessions.forEach(s => console.log(`  - ${s.session_type}: ${s.total_questions} questions, ${s.status}`));
  }
  
  // User responses
  const { data: responses, error: responsesError } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', userId);
  
  if (!responsesError) {
    console.log(`📝 User responses: ${responses.length}`);
  } else {
    console.log('📝 User responses table not found or empty');
  }
  
  // User progress/stats
  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId);
  
  if (!statsError) {
    console.log(`📝 User stats: ${stats.length}`);
  } else {
    console.log('📝 User stats table not found or empty');
  }
  
  // Reset data
  console.log('\n🧹 Resetting user data...');
  
  // Delete quiz sessions
  const { error: deleteSessionsError } = await supabase
    .from('quiz_sessions')
    .delete()
    .eq('user_id', userId);
  
  if (deleteSessionsError) {
    console.error('❌ Error deleting sessions:', deleteSessionsError);
  } else {
    console.log('✅ Deleted quiz sessions');
  }
  
  // Delete user responses (if table exists)
  try {
    const { error: deleteResponsesError } = await supabase
      .from('user_responses')
      .delete()
      .eq('user_id', userId);
    
    if (!deleteResponsesError) {
      console.log('✅ Deleted user responses');
    }
  } catch (e) {
    console.log('⚠️ User responses table not found (OK)');
  }
  
  // Delete user stats (if table exists)
  try {
    const { error: deleteStatsError } = await supabase
      .from('user_stats')
      .delete()
      .eq('user_id', userId);
    
    if (!deleteStatsError) {
      console.log('✅ Deleted user stats');
    }
  } catch (e) {
    console.log('⚠️ User stats table not found (OK)');
  }
  
  console.log('\n🎉 User data reset complete! Ready for fresh testing.');
}

resetUserData().catch(console.error);
