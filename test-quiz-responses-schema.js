import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bZkq0HoXxYxAHoaU3mDk0Q_iWsw7zCC';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getQuizResponsesSchema() {
  console.log('🔍 Analyzing quiz_responses table schema...\n');
  
  // Try to query quiz_responses with different approaches
  try {
    // Method 1: Try to get all columns
    console.log('Method 1: Querying all columns...');
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error with select *:', error.message);
    } else {
      console.log('✅ Success! Found columns:');
      if (data && data.length > 0) {
        Object.keys(data[0]).forEach(column => {
          console.log(`   - ${column}`);
        });
      } else {
        console.log('   No data found, but query succeeded');
      }
    }
  } catch (err) {
    console.log('💥 Exception with select *:', err.message);
  }
  
  // Method 2: Try specific common columns
  console.log('\nMethod 2: Testing specific columns...');
  const commonColumns = [
    'id', 'session_id', 'question_id', 'user_id', 
    'selected_option_id', 'is_correct', 'created_at',
    'time_taken', 'time_seconds', 'response_time',
    'answered_at', 'updated_at'
  ];
  
  for (const column of commonColumns) {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select(column)
        .limit(1);
      
      if (error) {
        if (error.message.includes('could not find') || error.message.includes('does not exist')) {
          console.log(`❌ Column '${column}': Does not exist`);
        } else {
          console.log(`❌ Column '${column}': ${error.message}`);
        }
      } else {
        console.log(`✅ Column '${column}': Exists`);
      }
    } catch (err) {
      console.log(`💥 Column '${column}': Exception - ${err.message}`);
    }
  }
  
  // Method 3: Try to insert a minimal record to see what's required
  console.log('\nMethod 3: Testing minimal insert to understand required fields...');
  
  const testInserts = [
    {
      name: 'Minimal fields',
      data: {
        session_id: '00000000-0000-0000-0000-000000000000',
        question_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        selected_option_id: 'a',
        is_correct: false
      }
    },
    {
      name: 'With timestamp',
      data: {
        session_id: '00000000-0000-0000-0000-000000000000',
        question_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        selected_option_id: 'a',
        is_correct: false,
        created_at: new Date().toISOString()
      }
    }
  ];
  
  for (const testInsert of testInserts) {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .insert(testInsert.data);
      
      if (error) {
        console.log(`❌ ${testInsert.name}: ${error.message}`);
        if (error.code) {
          console.log(`   Error code: ${error.code}`);
        }
      } else {
        console.log(`✅ ${testInsert.name}: Insert successful`);
        
        // Clean up
        if (data && data.length > 0) {
          await supabase.from('quiz_responses').delete().eq('id', data[0].id);
          console.log('   🧹 Cleaned up test record');
        }
      }
    } catch (err) {
      console.log(`💥 ${testInsert.name}: Exception - ${err.message}`);
    }
  }
  
  // Method 4: Check if there's any existing data to analyze
  console.log('\nMethod 4: Looking for any existing records...');
  
  try {
    const { count, error } = await supabase
      .from('quiz_responses')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Error getting count:', error.message);
    } else {
      console.log(`📊 Total records in quiz_responses: ${count}`);
    }
  } catch (err) {
    console.log('💥 Exception getting count:', err.message);
  }
}

// Run the schema analysis
getQuizResponsesSchema().then(() => {
  console.log('\n🎉 Quiz responses schema analysis complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Analysis failed:', error);
  process.exit(1);
});