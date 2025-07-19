import { executeSupabaseQuery, initializeMcpClient } from './src/lib/supabaseMcpClient.js';

// Set the access token
process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';

/**
 * Check specific database functions for quiz progress tracking
 */

async function examineQuizFunctions() {
  console.log('\n🔧 EXAMINING QUIZ-RELATED DATABASE FUNCTIONS');
  console.log('='.repeat(60));

  // Get function definitions for quiz-related functions
  const functions = [
    'complete_quiz_session',
    'get_user_quiz_stats', 
    'submit_quiz_results'
  ];

  for (const funcName of functions) {
    console.log(`\n📋 Function: ${funcName}`);
    const result = await executeSupabaseQuery(`
      SELECT 
        routine_name,
        routine_type,
        specific_name,
        data_type,
        routine_body,
        routine_definition
      FROM information_schema.routines 
      WHERE routine_name = '${funcName}';
    `);
    
    if (result.success) {
      console.log(`Definition for ${funcName}:`, JSON.stringify(result.data, null, 2));
    } else {
      console.log(`❌ Failed to get ${funcName} definition:`, result.error);
    }
  }
}

async function checkQuizSessionUpdates() {
  console.log('\n🔄 CHECKING QUIZ SESSION UPDATE PATTERNS');
  console.log('='.repeat(60));

  // Check which sessions have been updated vs created
  const updateResult = await executeSupabaseQuery(`
    SELECT 
      id,
      user_id,
      status,
      total_questions,
      correct_answers,
      score,
      accuracy,
      questions_count,
      time_spent,
      created_at,
      updated_at,
      CASE 
        WHEN updated_at > created_at THEN 'UPDATED'
        ELSE 'NOT_UPDATED'
      END as update_status,
      EXTRACT(EPOCH FROM (updated_at - created_at)) as seconds_between_create_update
    FROM quiz_sessions
    ORDER BY created_at DESC
    LIMIT 10;
  `);
  
  if (updateResult.success) {
    console.log('Session update patterns:', JSON.stringify(updateResult.data, null, 2));
  }
}

async function analyzeFrontendBackendIntegration() {
  console.log('\n🔗 ANALYZING FRONTEND-BACKEND INTEGRATION PATTERNS');
  console.log('='.repeat(60));

  // Check the specific session that has responses
  const sessionWithResponsesResult = await executeSupabaseQuery(`
    SELECT 
      qs.*,
      COUNT(qr.id) as response_count,
      MIN(qr.created_at) as first_response_time,
      MAX(qr.created_at) as last_response_time
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.session_id
    WHERE qs.id = '97658016-7e94-4ef4-823e-8622d9f745f4'
    GROUP BY qs.id;
  `);
  
  if (sessionWithResponsesResult.success) {
    console.log('Session with responses details:', JSON.stringify(sessionWithResponsesResult.data, null, 2));
  }

  // Check the specific response details
  const responseDetailsResult = await executeSupabaseQuery(`
    SELECT 
      qr.*,
      q.question_text,
      q.options,
      q.correct_option_id,
      q.difficulty
    FROM quiz_responses qr
    LEFT JOIN questions q ON qr.question_id = q.id
    WHERE qr.session_id = '97658016-7e94-4ef4-823e-8622d9f745f4';
  `);
  
  if (responseDetailsResult.success) {
    console.log('Response details with question info:', JSON.stringify(responseDetailsResult.data, null, 2));
  }
}

async function runDetailedAnalysis() {
  try {
    console.log('🚀 STARTING DETAILED QUIZ PROGRESS TRACKING ANALYSIS');
    console.log('='.repeat(70));

    // Initialize MCP client
    await initializeMcpClient();

    // Run detailed analyses
    await examineQuizFunctions();
    await checkQuizSessionUpdates();
    await analyzeFrontendBackendIntegration();

    console.log('\n🎉 DETAILED ANALYSIS COMPLETE!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run the detailed analysis
runDetailedAnalysis().then(() => {
  console.log('\n✅ All detailed analyses completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Analysis failed:', error);
  process.exit(1);
});