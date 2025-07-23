import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bZkq0HoXxYxAHoaU3mDk0Q_iWsw7zCC';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getDetailedDatabaseInfo() {
  console.log('🔍 Getting detailed database information...\n');
  
  // Get detailed table information
  const tables = ['questions', 'profiles', 'quiz_sessions', 'quiz_responses', 'user_stats'];
  
  for (const tableName of tables) {
    console.log(`📊 Table: ${tableName}`);
    console.log('=' .repeat(50));
    
    try {
      // Get sample data to understand structure
      const { data: sampleData, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);
      
      if (error) {
        console.log(`❌ Error accessing ${tableName}:`, error.message);
        continue;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log(`📈 Records found: ${sampleData.length}`);
        console.log('🔧 Column structure:');
        
        const firstRecord = sampleData[0];
        Object.entries(firstRecord).forEach(([key, value]) => {
          const valueType = value === null ? 'null' : typeof value;
          const valuePreview = value === null ? 'NULL' : 
                               typeof value === 'string' ? `"${value.slice(0, 30)}${value.length > 30 ? '...' : ''}"` :
                               typeof value === 'object' ? JSON.stringify(value).slice(0, 50) + '...' :
                               String(value);
          console.log(`   ${key}: ${valueType} = ${valuePreview}`);
        });
        
        // Show sample data
        console.log('\n📋 Sample records:');
        sampleData.forEach((record, index) => {
          console.log(`   Record ${index + 1}:`);
          if (tableName === 'questions') {
            console.log(`     ID: ${record.id}`);
            console.log(`     Question: ${record.question_text?.slice(0, 60)}...`);
            console.log(`     Difficulty: ${record.difficulty}`);
            console.log(`     Category: ${record.category_id}`);
            console.log(`     Active: ${record.is_active}`);
          } else if (tableName === 'profiles') {
            console.log(`     ID: ${record.id}`);
            console.log(`     Display Name: ${record.display_name}`);
            console.log(`     Email: ${record.email}`);
            console.log(`     Points: ${record.total_points}`);
            console.log(`     Verified: ${record.email_verified}`);
          } else if (tableName === 'quiz_sessions') {
            console.log(`     ID: ${record.id}`);
            console.log(`     User ID: ${record.user_id}`);
            console.log(`     Status: ${record.status}`);
            console.log(`     Started: ${record.started_at}`);
          } else if (tableName === 'quiz_responses') {
            console.log(`     ID: ${record.id}`);
            console.log(`     Session ID: ${record.session_id}`);
            console.log(`     Question ID: ${record.question_id}`);
            console.log(`     Correct: ${record.is_correct}`);
          } else if (tableName === 'user_stats') {
            console.log(`     User ID: ${record.user_id}`);
            console.log(`     Total Quizzes: ${record.total_quizzes_completed}`);
            console.log(`     Accuracy: ${record.overall_accuracy}`);
          }
        });
        
      } else {
        console.log('📭 No records found in this table');
      }
      
    } catch (err) {
      console.log(`💥 Exception accessing ${tableName}:`, err.message);
    }
    
    console.log('\n');
  }
  
  // Test authentication scenarios
  console.log('🔐 Authentication Analysis');
  console.log('=' .repeat(50));
  
  // Check current auth state
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.log('❌ No authenticated user:', userError.message);
  } else {
    console.log('✅ Current user:', user ? user.id : 'None');
  }
  
  // Test what happens with different operations
  console.log('\n🧪 Testing operations without authentication:');
  
  const operations = [
    {
      name: 'Read questions',
      test: () => supabase.from('questions').select('id, question_text').limit(1)
    },
    {
      name: 'Read profiles',
      test: () => supabase.from('profiles').select('id, display_name').limit(1)
    },
    {
      name: 'Create quiz session',
      test: () => supabase.from('quiz_sessions').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        status: 'in_progress',
        session_type: 'practice'
      })
    },
    {
      name: 'Read quiz sessions',
      test: () => supabase.from('quiz_sessions').select('*').limit(1)
    }
  ];
  
  for (const operation of operations) {
    try {
      const { data, error } = await operation.test();
      
      if (error) {
        console.log(`❌ ${operation.name}: ${error.message}`);
        if (error.code) {
          console.log(`   Error code: ${error.code}`);
        }
      } else {
        console.log(`✅ ${operation.name}: Success (${data?.length || 0} records)`);
      }
    } catch (err) {
      console.log(`💥 ${operation.name} exception: ${err.message}`);
    }
  }
  
  // Test environment configuration
  console.log('\n⚙️  Environment Configuration');
  console.log('=' .repeat(50));
  console.log('Supabase URL:', supabaseUrl);
  console.log('Key present:', !!supabaseKey);
  console.log('Key prefix:', supabaseKey?.substring(0, 20) + '...');
  
  // Test basic connectivity
  console.log('\n🌐 Connectivity Test');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    console.log('HTTP Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ Basic connectivity successful');
    } else {
      console.log('❌ Basic connectivity failed');
    }
    
  } catch (err) {
    console.log('💥 Connectivity test failed:', err.message);
  }
}

// Run the detailed analysis
getDetailedDatabaseInfo().then(() => {
  console.log('\n🎉 Detailed database analysis complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Analysis failed:', error);
  process.exit(1);
});