import { supabase } from '../lib/supabase';

/**
 * Utility functions to test database connectivity and verify schema fixes
 */

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, type')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Database connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('💥 Connection test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const testQuestionFetching = async (categoryId = 'mixed', questionCount = 5) => {
  console.log(`🔍 Testing question fetching for category: ${categoryId}`);
  
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        options,
        correct_option_id,
        question_tags!inner(
          tag_id,
          tags!inner(name, type)
        )
      `)
      .limit(questionCount);
    
    if (error) {
      console.error('❌ Question fetching failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Successfully fetched ${data.length} questions`);
    return { success: true, data, count: data.length };
  } catch (error) {
    console.error('💥 Question fetch test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const testTagsWithQuestionCounts = async () => {
  console.log('🔍 Testing tags with question counts...');
  
  try {
    // Get tags
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, type, is_active')
      .eq('is_active', true)
      .limit(5);
    
    if (tagsError) {
      console.error('❌ Tags fetching failed:', tagsError.message);
      return { success: false, error: tagsError.message };
    }
    
    // Test counting questions for one tag
    if (tags.length > 0) {
      const sampleTag = tags[0];
      const { count, error: countError } = await supabase
        .from('question_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', sampleTag.id);
      
      if (countError) {
        console.error('❌ Question counting failed:', countError.message);
        return { success: false, error: countError.message };
      }
      
      console.log(`✅ Tag "${sampleTag.name}" has ${count} questions`);
      return { 
        success: true, 
        data: { ...sampleTag, question_count: count },
        totalTags: tags.length 
      };
    }
    
    return { success: true, data: [], totalTags: 0 };
  } catch (error) {
    console.error('💥 Tags test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const testQuizSessionCreation = async (userId, categoryId = 'mixed') => {
  console.log('🔍 Testing quiz session creation...');
  
  if (!userId) {
    console.warn('⚠️ No user ID provided, skipping session test');
    return { success: false, error: 'No user ID provided' };
  }
  
  try {
    // Get a tag ID for testing
    let categoryTagId = null;
    if (categoryId !== 'mixed') {
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', `%${categoryId}%`)
        .limit(1)
        .single();
      
      categoryTagId = tag?.id;
    }
    
    // Create test session
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        session_type: 'self_paced',
        category_tag_id: categoryTagId, // Should now work with INTEGER
        total_questions: 5
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Quiz session creation failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Quiz session created successfully');
    
    // Clean up - delete the test session
    await supabase
      .from('quiz_sessions')
      .delete()
      .eq('id', data.id);
    
    return { success: true, data };
  } catch (error) {
    console.error('💥 Session creation test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const runAllDatabaseTests = async (userId = null) => {
  console.log('🚀 Running comprehensive database tests...\n');
  
  const results = {
    connection: await testDatabaseConnection(),
    questions: await testQuestionFetching(),
    tags: await testTagsWithQuestionCounts(),
    session: userId ? await testQuizSessionCreation(userId) : { skipped: true }
  };
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.values(results).filter(r => !r.skipped).length;
  
  console.log(`\n🏁 Database tests completed: ${successCount}/${totalTests} passed`);
  
  if (successCount === totalTests) {
    console.log('✅ All database tests passed! QuickQuiz should work properly.');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
  }
  
  return results;
}; 