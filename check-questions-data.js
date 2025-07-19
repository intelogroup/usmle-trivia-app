import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

async function checkQuestionsData() {
  console.log('🔍 Checking questions table and related quiz data...');
  
  try {
    // Set the access token
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // 1. Count total questions
    console.log('\n1. Counting total questions...');
    const totalQuestionsResult = await executeSupabaseQuery(`
      SELECT COUNT(*) as total_questions FROM questions WHERE is_active = true;
    `);
    
    if (totalQuestionsResult.success) {
      console.log('✅ Total questions count successful');
      console.log('Total active questions:', totalQuestionsResult.data);
    } else {
      console.error('❌ Total questions count failed:', totalQuestionsResult.error);
    }
    
    // 2. Sample questions structure
    console.log('\n2. Getting sample questions structure...');
    const sampleQuestionsResult = await executeSupabaseQuery(`
      SELECT 
        id, 
        question_text, 
        options, 
        correct_option_id, 
        explanation, 
        difficulty, 
        points, 
        image_url,
        is_active,
        category_id,
        source,
        created_at
      FROM questions 
      WHERE is_active = true 
      LIMIT 3;
    `);
    
    if (sampleQuestionsResult.success) {
      console.log('✅ Sample questions query successful');
      console.log('Sample questions:', sampleQuestionsResult.data);
    } else {
      console.error('❌ Sample questions query failed:', sampleQuestionsResult.error);
    }
    
    // 3. Check tags/categories
    console.log('\n3. Getting tags/categories data...');
    const tagsResult = await executeSupabaseQuery(`
      SELECT 
        id, 
        name, 
        type, 
        slug, 
        description, 
        color, 
        is_active,
        (SELECT COUNT(*) FROM question_tags qt WHERE qt.tag_id = tags.id) as question_count
      FROM tags 
      WHERE is_active = true 
      ORDER BY name
      LIMIT 10;
    `);
    
    if (tagsResult.success) {
      console.log('✅ Tags query successful');
      console.log('Active tags with question counts:', tagsResult.data);
    } else {
      console.error('❌ Tags query failed:', tagsResult.error);
    }
    
    // 4. Check question-tag relationships
    console.log('\n4. Getting question-tag relationships...');
    const questionTagsResult = await executeSupabaseQuery(`
      SELECT 
        qt.question_id,
        qt.tag_id,
        t.name as tag_name,
        t.type as tag_type,
        q.question_text
      FROM question_tags qt
      INNER JOIN tags t ON qt.tag_id = t.id
      INNER JOIN questions q ON qt.question_id = q.id
      WHERE q.is_active = true AND t.is_active = true
      LIMIT 5;
    `);
    
    if (questionTagsResult.success) {
      console.log('✅ Question-tag relationships query successful');
      console.log('Sample question-tag relationships:', questionTagsResult.data);
    } else {
      console.error('❌ Question-tag relationships query failed:', questionTagsResult.error);
    }
    
    // 5. Check quiz sessions with data
    console.log('\n5. Checking quiz sessions...');
    const quizSessionsResult = await executeSupabaseQuery(`
      SELECT 
        qs.id,
        qs.user_id,
        qs.session_type,
        qs.category_tag_id,
        qs.total_questions,
        qs.questions_answered,
        qs.correct_count,
        qs.status,
        qs.created_at,
        qs.completed_at,
        t.name as category_name
      FROM quiz_sessions qs
      LEFT JOIN tags t ON qs.category_tag_id = t.id
      ORDER BY qs.created_at DESC
      LIMIT 5;
    `);
    
    if (quizSessionsResult.success) {
      console.log('✅ Quiz sessions query successful');
      console.log('Recent quiz sessions:', quizSessionsResult.data);
    } else {
      console.error('❌ Quiz sessions query failed:', quizSessionsResult.error);
    }
    
    // 6. Check quiz responses
    console.log('\n6. Checking quiz responses...');
    const quizResponsesResult = await executeSupabaseQuery(`
      SELECT 
        COUNT(*) as total_responses,
        COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_responses,
        COUNT(CASE WHEN is_correct = false THEN 1 END) as incorrect_responses
      FROM quiz_responses;
    `);
    
    if (quizResponsesResult.success) {
      console.log('✅ Quiz responses stats query successful');
      console.log('Quiz responses statistics:', quizResponsesResult.data);
    } else {
      console.error('❌ Quiz responses stats query failed:', quizResponsesResult.error);
    }
    
    // 7. Check for any recent activity
    console.log('\n7. Checking recent quiz activity...');
    const recentActivityResult = await executeSupabaseQuery(`
      SELECT 
        qr.created_at,
        qr.is_correct,
        qr.time_spent_seconds,
        q.question_text,
        t.name as category
      FROM quiz_responses qr
      INNER JOIN questions q ON qr.question_id = q.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      ORDER BY qr.created_at DESC
      LIMIT 3;
    `);
    
    if (recentActivityResult.success) {
      console.log('✅ Recent activity query successful');
      console.log('Recent quiz activity:', recentActivityResult.data);
    } else {
      console.error('❌ Recent activity query failed:', recentActivityResult.error);
    }
    
    console.log('\n🏁 Questions data check completed!');
    
  } catch (error) {
    console.error('❌ Questions data check failed with error:', error);
  }
}

checkQuestionsData();