import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuestionFetching() {
  console.log('🧪 Testing question fetching logic...\n');

  try {
    // Test 1: Basic questions query
    console.log('1. Testing basic questions query:');
    const { data: basicQuestions, error: basicError } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .limit(3);
    
    if (basicError) {
      console.log('   ❌ Basic query error:', basicError.message);
    } else {
      console.log(`   ✅ Found ${basicQuestions.length} questions`);
      console.log('   Sample question structure:', Object.keys(basicQuestions[0] || {}));
    }

    // Test 2: Questions with category filtering using joins
    console.log('\n2. Testing questions with tag filtering:');
    const { data: taggedQuestions, error: taggedError } = await supabase
      .from('questions')
      .select(`
        *,
        question_tags!inner(
          tag_id,
          tags!inner(
            id,
            name
          )
        )
      `)
      .eq('is_active', true)
      .eq('question_tags.tags.name', 'Cardiology')
      .limit(3);
    
    if (taggedError) {
      console.log('   ❌ Tagged query error:', taggedError.message);
    } else {
      console.log(`   ✅ Found ${taggedQuestions.length} cardiology questions`);
    }

    // Test 3: Check if RPC function exists
    console.log('\n3. Testing RPC function:');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_unseen_questions', {
      p_user_id: '123',
      p_category_id: null,
      p_difficulty: null,
      p_limit: 2
    });
    
    if (rpcError) {
      console.log('   ❌ RPC function error:', rpcError.message);
      console.log('   📝 RPC function does not exist - will fall back to basic queries');
    } else {
      console.log('   ✅ RPC function works:', rpcData?.length, 'results');
    }

    // Test 4: Get available tags
    console.log('\n4. Testing tags query:');
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, type')
      .eq('type', 'subject')
      .eq('is_active', true)
      .order('name');
    
    if (tagsError) {
      console.log('   ❌ Tags query error:', tagsError.message);
    } else {
      console.log(`   ✅ Found ${tags.length} subject tags:`);
      tags.forEach(tag => console.log(`      - ${tag.name} (${tag.id})`));
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testQuestionFetching();