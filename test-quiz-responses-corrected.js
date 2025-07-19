import { executeSupabaseQuery, initializeMcpClient } from './src/lib/supabaseMcpClient.js';

// Set the access token
process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';

/**
 * Corrected analysis based on actual table structure
 */

async function getTableStructures() {
  console.log('\n🔍 EXAMINING ACTUAL TABLE STRUCTURES');
  console.log('='.repeat(60));

  // Quiz responses structure
  console.log('\n📋 Quiz Responses Table Structure:');
  const qrStructure = await executeSupabaseQuery(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'quiz_responses' 
    ORDER BY ordinal_position;
  `);
  console.log('Quiz responses columns:', JSON.stringify(qrStructure.data, null, 2));

  // Quiz sessions structure  
  console.log('\n📋 Quiz Sessions Table Structure:');
  const qsStructure = await executeSupabaseQuery(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'quiz_sessions' 
    ORDER BY ordinal_position;
  `);
  console.log('Quiz sessions columns:', JSON.stringify(qsStructure.data, null, 2));

  return { qrStructure, qsStructure };
}

async function analyzeQuizResponsesData() {
  console.log('\n📊 QUIZ RESPONSES DATA ANALYSIS');
  console.log('='.repeat(60));

  // Count total responses
  console.log('\n📈 Total Response Count:');
  const countResult = await executeSupabaseQuery(`
    SELECT COUNT(*) as total_responses FROM quiz_responses;
  `);
  console.log('Total responses:', JSON.stringify(countResult.data, null, 2));

  // Check actual data in quiz_responses
  console.log('\n📝 Recent Quiz Responses:');
  const responsesResult = await executeSupabaseQuery(`
    SELECT 
      id,
      session_id,
      question_id,
      selected_option_id,
      is_correct,
      time_spent_seconds,
      response_order,
      created_at,
      block_index
    FROM quiz_responses
    ORDER BY created_at DESC
    LIMIT 5;
  `);
  console.log('Recent responses:', JSON.stringify(responsesResult.data, null, 2));

  return { countResult, responsesResult };
}

async function analyzeQuizSessionsData() {
  console.log('\n📊 QUIZ SESSIONS DATA ANALYSIS');
  console.log('='.repeat(60));

  // Check quiz sessions structure and data
  console.log('\n📋 Recent Quiz Sessions:');
  const sessionsResult = await executeSupabaseQuery(`
    SELECT 
      id,
      user_id,
      status,
      category_id,
      questions_count,
      created_at,
      updated_at
    FROM quiz_sessions
    ORDER BY created_at DESC
    LIMIT 10;
  `);
  console.log('Recent sessions:', JSON.stringify(sessionsResult.data, null, 2));

  // Session status breakdown
  console.log('\n📊 Session Status Breakdown:');
  const statusResult = await executeSupabaseQuery(`
    SELECT 
      status,
      COUNT(*) as session_count,
      COUNT(DISTINCT user_id) as unique_users
    FROM quiz_sessions
    GROUP BY status
    ORDER BY session_count DESC;
  `);
  console.log('Status breakdown:', JSON.stringify(statusResult.data, null, 2));

  return { sessionsResult, statusResult };
}

async function analyzeSessionResponseRelationship() {
  console.log('\n🔗 SESSION-RESPONSE RELATIONSHIP ANALYSIS');
  console.log('='.repeat(60));

  // Join sessions with responses using correct column names
  console.log('\n🔄 Sessions with Response Counts:');
  const joinResult = await executeSupabaseQuery(`
    SELECT 
      qs.id as session_id,
      qs.user_id,
      qs.status,
      qs.questions_count,
      qs.created_at as session_created,
      COUNT(qr.id) as response_count
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.session_id
    GROUP BY qs.id, qs.user_id, qs.status, qs.questions_count, qs.created_at
    ORDER BY qs.created_at DESC
    LIMIT 10;
  `);
  console.log('Sessions with response counts:', JSON.stringify(joinResult.data, null, 2));

  // Sessions without responses
  console.log('\n⚠️ Sessions Without Any Responses:');
  const orphanResult = await executeSupabaseQuery(`
    SELECT 
      qs.id,
      qs.user_id,
      qs.status,
      qs.questions_count,
      qs.created_at
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.session_id
    WHERE qr.id IS NULL
    ORDER BY qs.created_at DESC
    LIMIT 5;
  `);
  console.log('Orphan sessions:', JSON.stringify(orphanResult.data, null, 2));

  return { joinResult, orphanResult };
}

async function analyzeUserProgress() {
  console.log('\n📈 USER PROGRESS ANALYSIS');
  console.log('='.repeat(60));

  // User accuracy analysis
  console.log('\n🎯 User Accuracy by Session:');
  const accuracyResult = await executeSupabaseQuery(`
    SELECT 
      qs.user_id,
      qs.id as session_id,
      qs.status,
      COUNT(qr.id) as total_answers,
      SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_answers,
      ROUND(
        CASE 
          WHEN COUNT(qr.id) > 0 
          THEN (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::decimal / COUNT(qr.id)) * 100
          ELSE 0
        END, 2
      ) as accuracy_percentage
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.session_id
    GROUP BY qs.user_id, qs.id, qs.status
    HAVING COUNT(qr.id) > 0
    ORDER BY qs.user_id, qs.id;
  `);
  console.log('User accuracy by session:', JSON.stringify(accuracyResult.data, null, 2));

  // Time analysis
  console.log('\n⏱️ Time Spent Analysis:');
  const timeResult = await executeSupabaseQuery(`
    SELECT 
      AVG(time_spent_seconds) as avg_time_per_question,
      MIN(time_spent_seconds) as fastest_answer,
      MAX(time_spent_seconds) as slowest_answer,
      COUNT(*) as total_timed_responses
    FROM quiz_responses 
    WHERE time_spent_seconds IS NOT NULL AND time_spent_seconds > 0;
  `);
  console.log('Time analysis:', JSON.stringify(timeResult.data, null, 2));

  return { accuracyResult, timeResult };
}

async function analyzeProgressTracking() {
  console.log('\n✅ PROGRESS TRACKING VERIFICATION');
  console.log('='.repeat(60));

  // Check if there are any database functions or triggers
  console.log('\n🔧 Database Functions Related to Quiz:');
  const functionsResult = await executeSupabaseQuery(`
    SELECT 
      routine_name,
      routine_type,
      routine_definition
    FROM information_schema.routines 
    WHERE routine_name LIKE '%quiz%' OR routine_name LIKE '%session%' OR routine_name LIKE '%response%'
    ORDER BY routine_name;
  `);
  console.log('Quiz-related functions:', JSON.stringify(functionsResult.data, null, 2));

  // Check triggers
  console.log('\n🔧 Database Triggers:');
  const triggersResult = await executeSupabaseQuery(`
    SELECT 
      trigger_name,
      event_manipulation,
      event_object_table
    FROM information_schema.triggers 
    WHERE event_object_table IN ('quiz_responses', 'quiz_sessions')
    ORDER BY trigger_name;
  `);
  console.log('Triggers on quiz tables:', JSON.stringify(triggersResult.data, null, 2));

  // Check if responses are being tracked in order
  console.log('\n📋 Response Order Tracking:');
  const orderResult = await executeSupabaseQuery(`
    SELECT 
      session_id,
      response_order,
      question_id,
      is_correct,
      created_at
    FROM quiz_responses
    ORDER BY session_id, response_order
    LIMIT 10;
  `);
  console.log('Response order tracking:', JSON.stringify(orderResult.data, null, 2));

  return { functionsResult, triggersResult, orderResult };
}

async function analyzeDataIntegrity() {
  console.log('\n🔍 DATA INTEGRITY ANALYSIS');
  console.log('='.repeat(60));

  // Check for orphaned responses
  console.log('\n⚠️ Orphaned Responses (responses without valid sessions):');
  const orphanResponsesResult = await executeSupabaseQuery(`
    SELECT 
      qr.id,
      qr.session_id,
      qr.question_id,
      qr.created_at
    FROM quiz_responses qr
    LEFT JOIN quiz_sessions qs ON qr.session_id = qs.id
    WHERE qs.id IS NULL
    LIMIT 5;
  `);
  console.log('Orphaned responses:', JSON.stringify(orphanResponsesResult.data, null, 2));

  // Check response consistency within sessions
  console.log('\n📊 Response Consistency Check:');
  const consistencyResult = await executeSupabaseQuery(`
    SELECT 
      qs.id as session_id,
      qs.questions_count,
      COUNT(qr.id) as actual_responses,
      CASE 
        WHEN qs.questions_count = COUNT(qr.id) THEN 'COMPLETE'
        WHEN COUNT(qr.id) = 0 THEN 'NO_RESPONSES'
        WHEN COUNT(qr.id) < qs.questions_count THEN 'INCOMPLETE'
        ELSE 'OVER_COMPLETE'
      END as status
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.session_id
    GROUP BY qs.id, qs.questions_count
    ORDER BY qs.id DESC
    LIMIT 10;
  `);
  console.log('Session completeness status:', JSON.stringify(consistencyResult.data, null, 2));

  return { orphanResponsesResult, consistencyResult };
}

async function runCorrectedAnalysis() {
  try {
    console.log('🚀 STARTING CORRECTED QUIZ RESPONSE AND PROGRESS ANALYSIS');
    console.log('='.repeat(70));

    // Initialize MCP client
    await initializeMcpClient();

    // Run all corrected analyses
    const results = {
      tableStructures: await getTableStructures(),
      responseData: await analyzeQuizResponsesData(),
      sessionData: await analyzeQuizSessionsData(),
      relationship: await analyzeSessionResponseRelationship(),
      userProgress: await analyzeUserProgress(),
      progressTracking: await analyzeProgressTracking(),
      dataIntegrity: await analyzeDataIntegrity()
    };

    console.log('\n🎉 CORRECTED ANALYSIS COMPLETE!');
    console.log('='.repeat(70));
    
    return results;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run the corrected analysis
runCorrectedAnalysis().then(() => {
  console.log('\n✅ All corrected analyses completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Analysis failed:', error);
  process.exit(1);
});