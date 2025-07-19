import { executeSupabaseQuery, initializeMcpClient } from './src/lib/supabaseMcpClient.js';

// Set the access token
process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';

/**
 * Comprehensive analysis of quiz responses and user progress tracking
 */

async function analyzeQuizResponsesTable() {
  console.log('\n🔍 ANALYZING QUIZ_RESPONSES TABLE STRUCTURE AND DATA');
  console.log('='.repeat(60));

  // 1. Check table structure
  console.log('\n📋 Table Structure:');
  const structureResult = await executeSupabaseQuery(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'quiz_responses' 
    ORDER BY ordinal_position;
  `);
  
  if (structureResult.success) {
    console.log('Quiz responses table columns:');
    console.log(structureResult.data);
  } else {
    console.error('❌ Failed to get table structure:', structureResult.error);
  }

  // 2. Check total number of responses
  console.log('\n📊 Response Statistics:');
  const countResult = await executeSupabaseQuery(`
    SELECT COUNT(*) as total_responses FROM quiz_responses;
  `);
  
  if (countResult.success) {
    console.log('Total quiz responses:', countResult.data);
  }

  // 3. Check recent responses with session info
  console.log('\n📝 Recent Quiz Responses (with session details):');
  const recentResponsesResult = await executeSupabaseQuery(`
    SELECT 
      qr.id,
      qr.quiz_session_id,
      qr.question_id,
      qr.selected_option_id,
      qr.is_correct,
      qr.time_spent_seconds,
      qr.created_at,
      qs.user_id,
      qs.status as session_status,
      qs.total_questions,
      qs.completed_questions
    FROM quiz_responses qr
    LEFT JOIN quiz_sessions qs ON qr.quiz_session_id = qs.id
    ORDER BY qr.created_at DESC
    LIMIT 10;
  `);
  
  if (recentResponsesResult.success) {
    console.log('Recent responses with session info:');
    console.log(JSON.stringify(recentResponsesResult.data, null, 2));
  } else {
    console.error('❌ Failed to get recent responses:', recentResponsesResult.error);
  }

  return { structureResult, countResult, recentResponsesResult };
}

async function analyzeUserProgressStatistics() {
  console.log('\n📈 ANALYZING USER PROGRESS AND STATISTICS');
  console.log('='.repeat(60));

  // 1. User response accuracy by user
  console.log('\n🎯 User Accuracy Statistics:');
  const accuracyResult = await executeSupabaseQuery(`
    SELECT 
      qs.user_id,
      COUNT(qr.id) as total_answers,
      SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_answers,
      ROUND(
        (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::decimal / COUNT(qr.id)) * 100, 
        2
      ) as accuracy_percentage
    FROM quiz_responses qr
    JOIN quiz_sessions qs ON qr.quiz_session_id = qs.id
    GROUP BY qs.user_id
    ORDER BY accuracy_percentage DESC
    LIMIT 10;
  `);
  
  if (accuracyResult.success) {
    console.log('User accuracy statistics:');
    console.log(JSON.stringify(accuracyResult.data, null, 2));
  } else {
    console.error('❌ Failed to get accuracy stats:', accuracyResult.error);
  }

  // 2. Average time spent per question
  console.log('\n⏱️ Time Analysis:');
  const timeResult = await executeSupabaseQuery(`
    SELECT 
      AVG(time_spent_seconds) as avg_time_per_question,
      MIN(time_spent_seconds) as fastest_answer,
      MAX(time_spent_seconds) as slowest_answer,
      COUNT(*) as total_timed_responses
    FROM quiz_responses 
    WHERE time_spent_seconds IS NOT NULL AND time_spent_seconds > 0;
  `);
  
  if (timeResult.success) {
    console.log('Time spent statistics:');
    console.log(JSON.stringify(timeResult.data, null, 2));
  }

  // 3. Question difficulty vs accuracy
  console.log('\n📊 Difficulty vs Accuracy Analysis:');
  const difficultyResult = await executeSupabaseQuery(`
    SELECT 
      q.difficulty,
      COUNT(qr.id) as times_attempted,
      SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_answers,
      ROUND(
        (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::decimal / COUNT(qr.id)) * 100, 
        2
      ) as success_rate
    FROM quiz_responses qr
    JOIN questions q ON qr.question_id = q.id
    GROUP BY q.difficulty
    ORDER BY q.difficulty;
  `);
  
  if (difficultyResult.success) {
    console.log('Difficulty vs success rate:');
    console.log(JSON.stringify(difficultyResult.data, null, 2));
  }

  return { accuracyResult, timeResult, difficultyResult };
}

async function analyzeSessionResponseRelationship() {
  console.log('\n🔗 ANALYZING QUIZ_SESSIONS AND QUIZ_RESPONSES RELATIONSHIP');
  console.log('='.repeat(60));

  // 1. Sessions with and without responses
  console.log('\n📋 Sessions vs Responses:');
  const sessionResponseResult = await executeSupabaseQuery(`
    SELECT 
      qs.status,
      COUNT(DISTINCT qs.id) as session_count,
      COUNT(qr.id) as response_count,
      ROUND(AVG(qs.completed_questions), 2) as avg_completed_questions,
      ROUND(AVG(qs.total_questions), 2) as avg_total_questions
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.quiz_session_id
    GROUP BY qs.status
    ORDER BY session_count DESC;
  `);
  
  if (sessionResponseResult.success) {
    console.log('Sessions by status with response counts:');
    console.log(JSON.stringify(sessionResponseResult.data, null, 2));
  }

  // 2. Sessions without any responses (potential data integrity issues)
  console.log('\n⚠️ Sessions Without Responses:');
  const orphanSessionsResult = await executeSupabaseQuery(`
    SELECT 
      qs.id,
      qs.user_id,
      qs.status,
      qs.total_questions,
      qs.completed_questions,
      qs.created_at,
      qs.updated_at
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.quiz_session_id
    WHERE qr.id IS NULL
    ORDER BY qs.created_at DESC
    LIMIT 5;
  `);
  
  if (orphanSessionsResult.success) {
    console.log('Sessions without any responses:');
    console.log(JSON.stringify(orphanSessionsResult.data, null, 2));
  }

  // 3. Response count vs session completed_questions consistency
  console.log('\n🔍 Data Consistency Check:');
  const consistencyResult = await executeSupabaseQuery(`
    SELECT 
      qs.id as session_id,
      qs.completed_questions,
      COUNT(qr.id) as actual_responses,
      CASE 
        WHEN qs.completed_questions = COUNT(qr.id) THEN 'CONSISTENT'
        ELSE 'INCONSISTENT'
      END as consistency_status
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.quiz_session_id
    GROUP BY qs.id, qs.completed_questions
    HAVING qs.completed_questions != COUNT(qr.id)
    ORDER BY qs.id DESC
    LIMIT 10;
  `);
  
  if (consistencyResult.success) {
    console.log('Sessions with inconsistent response counts:');
    console.log(JSON.stringify(consistencyResult.data, null, 2));
  }

  return { sessionResponseResult, orphanSessionsResult, consistencyResult };
}

async function analyzeCompletionPatterns() {
  console.log('\n📊 ANALYZING COMPLETION PATTERNS AND USER BEHAVIOR');
  console.log('='.repeat(60));

  // 1. Completion rate analysis
  console.log('\n📈 Completion Rate Analysis:');
  const completionResult = await executeSupabaseQuery(`
    SELECT 
      qs.status,
      COUNT(*) as session_count,
      ROUND(AVG(
        CASE 
          WHEN qs.total_questions > 0 
          THEN (qs.completed_questions::decimal / qs.total_questions) * 100
          ELSE 0
        END
      ), 2) as avg_completion_percentage
    FROM quiz_sessions qs
    GROUP BY qs.status
    ORDER BY session_count DESC;
  `);
  
  if (completionResult.success) {
    console.log('Completion rates by status:');
    console.log(JSON.stringify(completionResult.data, null, 2));
  }

  // 2. User engagement patterns
  console.log('\n👤 User Engagement Patterns:');
  const engagementResult = await executeSupabaseQuery(`
    SELECT 
      COUNT(DISTINCT qs.user_id) as unique_users,
      COUNT(qs.id) as total_sessions,
      ROUND(COUNT(qs.id)::decimal / COUNT(DISTINCT qs.user_id), 2) as avg_sessions_per_user,
      COUNT(CASE WHEN qs.status = 'completed' THEN 1 END) as completed_sessions,
      ROUND(
        (COUNT(CASE WHEN qs.status = 'completed' THEN 1 END)::decimal / COUNT(qs.id)) * 100, 
        2
      ) as completion_rate_percentage
    FROM quiz_sessions qs;
  `);
  
  if (engagementResult.success) {
    console.log('Overall user engagement:');
    console.log(JSON.stringify(engagementResult.data, null, 2));
  }

  // 3. Session duration analysis (based on created_at and updated_at)
  console.log('\n⏰ Session Duration Analysis:');
  const durationResult = await executeSupabaseQuery(`
    SELECT 
      qs.status,
      COUNT(*) as session_count,
      ROUND(AVG(EXTRACT(EPOCH FROM (qs.updated_at - qs.created_at))), 2) as avg_duration_seconds,
      ROUND(AVG(EXTRACT(EPOCH FROM (qs.updated_at - qs.created_at)) / 60), 2) as avg_duration_minutes
    FROM quiz_sessions qs
    WHERE qs.updated_at > qs.created_at
    GROUP BY qs.status
    ORDER BY avg_duration_seconds DESC;
  `);
  
  if (durationResult.success) {
    console.log('Session duration by status:');
    console.log(JSON.stringify(durationResult.data, null, 2));
  }

  return { completionResult, engagementResult, durationResult };
}

async function verifyProgressTracking() {
  console.log('\n✅ VERIFYING PROGRESS TRACKING SYSTEMS');
  console.log('='.repeat(60));

  // 1. Check if quiz_sessions.completed_questions is being updated correctly
  console.log('\n🔄 Progress Update Verification:');
  const progressResult = await executeSupabaseQuery(`
    SELECT 
      qs.id,
      qs.user_id,
      qs.total_questions,
      qs.completed_questions,
      COUNT(qr.id) as actual_response_count,
      qs.status,
      qs.created_at,
      qs.updated_at
    FROM quiz_sessions qs
    LEFT JOIN quiz_responses qr ON qs.id = qr.quiz_session_id
    GROUP BY qs.id, qs.user_id, qs.total_questions, qs.completed_questions, qs.status, qs.created_at, qs.updated_at
    ORDER BY qs.updated_at DESC
    LIMIT 10;
  `);
  
  if (progressResult.success) {
    console.log('Recent sessions with progress tracking:');
    console.log(JSON.stringify(progressResult.data, null, 2));
  }

  // 2. Check for any database triggers or functions that might be updating progress
  console.log('\n🔧 Database Automation Check:');
  const triggersResult = await executeSupabaseQuery(`
    SELECT 
      trigger_name,
      event_manipulation,
      event_object_table,
      action_statement
    FROM information_schema.triggers 
    WHERE event_object_table IN ('quiz_responses', 'quiz_sessions')
    ORDER BY trigger_name;
  `);
  
  if (triggersResult.success) {
    console.log('Database triggers for progress tracking:');
    console.log(JSON.stringify(triggersResult.data, null, 2));
  }

  // 3. Check recent activity to see if progress is being tracked in real-time
  console.log('\n⚡ Real-time Tracking Check:');
  const realtimeResult = await executeSupabaseQuery(`
    SELECT 
      qr.created_at as response_time,
      qs.updated_at as session_updated_time,
      qr.quiz_session_id,
      qs.completed_questions,
      COUNT(qr2.id) as responses_up_to_this_point
    FROM quiz_responses qr
    JOIN quiz_sessions qs ON qr.quiz_session_id = qs.id
    LEFT JOIN quiz_responses qr2 ON qr2.quiz_session_id = qr.quiz_session_id 
                                 AND qr2.created_at <= qr.created_at
    GROUP BY qr.id, qr.created_at, qs.updated_at, qr.quiz_session_id, qs.completed_questions
    ORDER BY qr.created_at DESC
    LIMIT 10;
  `);
  
  if (realtimeResult.success) {
    console.log('Real-time progress tracking verification:');
    console.log(JSON.stringify(realtimeResult.data, null, 2));
  }

  return { progressResult, triggersResult, realtimeResult };
}

async function runCompleteAnalysis() {
  try {
    console.log('🚀 STARTING COMPREHENSIVE QUIZ RESPONSE AND PROGRESS ANALYSIS');
    console.log('='.repeat(70));

    // Initialize MCP client
    await initializeMcpClient();

    // Run all analyses
    const results = {
      quizResponsesAnalysis: await analyzeQuizResponsesTable(),
      userProgressAnalysis: await analyzeUserProgressStatistics(),
      relationshipAnalysis: await analyzeSessionResponseRelationship(),
      completionPatterns: await analyzeCompletionPatterns(),
      progressTracking: await verifyProgressTracking()
    };

    console.log('\n🎉 ANALYSIS COMPLETE!');
    console.log('='.repeat(70));
    
    return results;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Run the analysis
runCompleteAnalysis().then(() => {
  console.log('\n✅ All analyses completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Analysis failed:', error);
  process.exit(1);
});