import { supabase } from './supabase';

/**
 * Comprehensive Supabase setup and testing utilities
 */

// Test basic connection
export const testBasicConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      return { success: false, error: error.message, step: 'basic_connection' };
    }
    
    return { success: true, message: 'Basic connection successful' };
  } catch (err) {
    return { success: false, error: err.message, step: 'basic_connection' };
  }
};

// Test questions table
export const testQuestionsTable = async () => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text')
      .limit(1);
    
    if (error) {
      return { success: false, error: error.message, step: 'questions_table' };
    }
    
    return { 
      success: true, 
      message: 'Questions table accessible',
      sampleData: data?.[0] || null
    };
  } catch (err) {
    return { success: false, error: err.message, step: 'questions_table' };
  }
};

// Test tags table (categories)
export const testTagsTable = async () => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, type')
      .limit(3);
    
    if (error) {
      return { success: false, error: error.message, step: 'tags_table' };
    }
    
    return { 
      success: true, 
      message: 'Tags table accessible',
      sampleData: data || []
    };
  } catch (err) {
    return { success: false, error: err.message, step: 'tags_table' };
  }
};

// Test tag_question_counts view
export const testTagQuestionCountsView = async () => {
  try {
    const { data, error } = await supabase
      .from('tag_question_counts')
      .select('id, name, question_count')
      .limit(3);
    
    if (error) {
      return { success: false, error: error.message, step: 'tag_question_counts_view' };
    }
    
    return { 
      success: true, 
      message: 'Tag question counts view accessible',
      sampleData: data || []
    };
  } catch (err) {
    return { success: false, error: err.message, step: 'tag_question_counts_view' };
  }
};

// Test question fetching with joins
export const testQuestionFetching = async (categoryId = 'mixed', count = 2) => {
  try {
    let query = supabase.from('questions');

    if (categoryId !== 'mixed') {
      query = query
        .select(`
          id,
          question_text,
          options,
          correct_option_id,
          explanation,
          difficulty,
          question_tags!inner(
            tag_id,
            tags(name)
          )
        `)
        .eq('question_tags.tag_id', categoryId);
    } else {
      query = query
        .select(`
          id,
          question_text,
          options,
          correct_option_id,
          explanation,
          difficulty,
          question_tags(
            tag_id,
            tags(name)
          )
        `);
    }

    const { data, error } = await query.limit(count);
    
    if (error) {
      return { success: false, error: error.message, step: 'question_fetching' };
    }
    
    return { 
      success: true, 
      message: `Successfully fetched ${data?.length || 0} questions`,
      sampleData: data || []
    };
  } catch (err) {
    return { success: false, error: err.message, step: 'question_fetching' };
  }
};

// Run comprehensive database test
export const runComprehensiveTest = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  console.log('🔍 Running comprehensive Supabase database test...');

  // Test 1: Basic connection
  console.log('1. Testing basic connection...');
  const basicTest = await testBasicConnection();
  results.tests.push({ name: 'Basic Connection', ...basicTest });
  
  // Test 2: Questions table
  console.log('2. Testing questions table...');
  const questionsTest = await testQuestionsTable();
  results.tests.push({ name: 'Questions Table', ...questionsTest });
  
  // Test 3: Tags table
  console.log('3. Testing tags table...');
  const tagsTest = await testTagsTable();
  results.tests.push({ name: 'Tags Table', ...tagsTest });
  
  // Test 4: Tag question counts view
  console.log('4. Testing tag_question_counts view...');
  const viewTest = await testTagQuestionCountsView();
  results.tests.push({ name: 'Tag Question Counts View', ...viewTest });
  
  // Test 5: Question fetching (mixed)
  console.log('5. Testing mixed question fetching...');
  const mixedFetchTest = await testQuestionFetching('mixed', 2);
  results.tests.push({ name: 'Mixed Questions Fetch', ...mixedFetchTest });
  
  // Test 6: Question fetching (specific category if tags exist)
  if (tagsTest.success && tagsTest.sampleData?.length > 0) {
    const firstTagId = tagsTest.sampleData[0].id;
    console.log(`6. Testing specific category fetching (tag ${firstTagId})...`);
    const specificFetchTest = await testQuestionFetching(firstTagId, 1);
    results.tests.push({ name: 'Specific Category Fetch', ...specificFetchTest });
  }

  // Summary
  const successCount = results.tests.filter(test => test.success).length;
  const totalTests = results.tests.length;
  
  results.summary = {
    success: successCount === totalTests,
    passed: successCount,
    total: totalTests,
    message: `${successCount}/${totalTests} tests passed`
  };

  console.log(`✅ Test completed: ${results.summary.message}`);
  return results;
};

// Environment setup check
export const checkEnvironmentSetup = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const setup = {
    configured: Boolean(supabaseUrl && supabaseKey),
    url: supabaseUrl ? '✅ Set' : '❌ Missing',
    publishableKey: supabaseKey ? '✅ Set' : '❌ Missing'
  };

  if (!setup.configured) {
    setup.instructions = [
      '1. Create a .env file in your project root',
      '2. Add your Supabase URL: VITE_SUPABASE_URL=https://your-project.supabase.co',
      '3. Add your Supabase publishable key: VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key',
      '4. Restart your development server'
    ];
  }

  return setup;
}; 