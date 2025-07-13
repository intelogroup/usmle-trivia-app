import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Copy the fixed fetchQuestions logic
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function fetchQuestions({ categoryId = 'mixed', questionCount = 10, difficulty = null }) {
  let query;
  
  if (categoryId && categoryId !== 'mixed') {
    // Use join query to filter by tag
    query = supabase
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
      .eq('question_tags.tag_id', categoryId);
  } else {
    // Simple query for mixed/all questions
    query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true);
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  query = query.limit(questionCount * 2); // Get more for better randomization

  const startTime = performance.now();
  const { data, error } = await query;
  const duration = performance.now() - startTime;

  if (error) {
    console.error('❌ [QuizService] Error fetching questions:', {
      message: error.message,
      details: error.details,
      categoryId,
      questionCount,
      difficulty,
      duration: `${duration.toFixed(2)}ms`
    });
    throw new Error(`FETCH_QUESTIONS_ERROR: ${error.message}`);
  }

  // Shuffle and limit to requested count
  const shuffledQuestions = shuffleArray([...data]);
  const limitedQuestions = shuffledQuestions.slice(0, questionCount);

  console.log('✅ [QuizService] Successfully fetched questions:', {
    totalFound: data.length,
    returned: limitedQuestions.length,
    categoryId,
    difficulty,
    duration: `${duration.toFixed(2)}ms`
  });
  return limitedQuestions;
}

async function testFixedQuestionFetching() {
  console.log('🧪 Testing FIXED question fetching logic...\n');

  try {
    // Test 1: Mixed questions
    console.log('1. Testing mixed questions:');
    const mixedQuestions = await fetchQuestions({ 
      categoryId: 'mixed', 
      questionCount: 5 
    });
    console.log(`   ✅ Got ${mixedQuestions.length} mixed questions`);

    // Test 2: Cardiology questions using tag ID
    console.log('\n2. Testing cardiology questions by tag ID:');
    const cardiologyQuestions = await fetchQuestions({ 
      categoryId: 'bdea4b78-06a4-4e9f-a34d-fd3f4963dae0', // Cardiology tag ID
      questionCount: 3 
    });
    console.log(`   ✅ Got ${cardiologyQuestions.length} cardiology questions`);
    
    // Test 3: Questions with difficulty filter
    console.log('\n3. Testing questions with difficulty filter:');
    const easyQuestions = await fetchQuestions({ 
      categoryId: 'mixed', 
      questionCount: 3,
      difficulty: 'easy'
    });
    console.log(`   ✅ Got ${easyQuestions.length} easy questions`);

    // Test 4: Non-existent category
    console.log('\n4. Testing non-existent category:');
    try {
      const nonExistentQuestions = await fetchQuestions({ 
        categoryId: 'non-existent-id', 
        questionCount: 3 
      });
      console.log(`   ⚠️  Got ${nonExistentQuestions.length} questions for non-existent category`);
    } catch (error) {
      console.log(`   ❌ Error with non-existent category: ${error.message}`);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testFixedQuestionFetching();