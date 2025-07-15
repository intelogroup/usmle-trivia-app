import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bkuowoowlmwranfoliea.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIwMDg1NCwiZXhwIjoyMDY1Nzc2ODU0fQ.V1-SQLXxMeMj6P638-gRpU3i38m2CqYdT2C8nLubLpc'
);

async function getFullDatabaseContext() {
  try {
    console.log('=== COMPLETE DATABASE SCHEMA ANALYSIS ===');

    // Define known tables to analyze
    const knownTables = ['questions', 'categories', 'tags', 'quiz_sessions', 'user_responses', 'users'];

    console.log('\n📊 ANALYZING CORE TABLES:');

    for (const tableName of knownTables) {
      console.log(`\n🔍 TABLE: ${tableName.toUpperCase()}`);

      // Get sample data and count
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);

      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (sampleError) {
        console.log(`  ❌ Table not found or error: ${sampleError.message}`);
        continue;
      }

      console.log(`  📊 Total rows: ${count || 0}`);

      if (sampleData && sampleData.length > 0) {
        console.log(`  📝 Sample data (${sampleData.length} rows):`);
        console.log('  Structure:', Object.keys(sampleData[0]).join(', '));
        console.log('  First row:', JSON.stringify(sampleData[0], null, 2).substring(0, 200) + '...');
      } else {
        console.log('  📝 No data found');
      }
    }
    
    // Get specific quiz-related data
    console.log('\n🎯 QUIZ-SPECIFIC DATA:');
    
    const { data: questionCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true });
    console.log(`Total Questions: ${questionCount || 0}`);
    
    const { data: categoryCount } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true });
    console.log(`Total Categories: ${categoryCount || 0}`);
    
    const { data: activeCategories } = await supabase
      .from('categories')
      .select('name, question_count, is_active')
      .eq('is_active', true)
      .order('sort_order');
    
    console.log('\n📚 ACTIVE CATEGORIES:');
    activeCategories?.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.question_count} questions`);
    });
    
    // Check for quiz sessions and user progress tables
    const { data: userSessions } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);
    
    console.log(`\n📈 Quiz Sessions Table: ${userSessions ? 'EXISTS' : 'NOT FOUND'}`);
    
  } catch (error) {
    console.error('Database analysis error:', error);
  }
}

getFullDatabaseContext();
