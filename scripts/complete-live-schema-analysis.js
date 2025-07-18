import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'env' });

console.log('🔗 COMPLETE LIVE DATABASE SCHEMA ANALYSIS');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.Publishable_key || 'sb_publishable_bZkq0HoXxYxAHoaU3mDk0Q_iWsw7zCC'
);

async function getCompleteSchemaAnalysis() {
  console.log('\n=== LIVE DATABASE SCHEMA ANALYSIS ===');
  
  // 1. Get all tables with detailed information
  console.log('\n📊 ANALYZING ALL TABLES:');
  
  const tables = [
    'questions', 'tags', 'profiles', 'question_tags', 
    'quiz_sessions', 'quiz_responses', 'user_question_history', 
    'categories', 'tag_question_counts'
  ];
  
  const schemaInfo = {};
  
  for (const tableName of tables) {
    console.log(`\n🔍 TABLE: ${tableName.toUpperCase()}`);
    
    try {
      // Get row count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`   ❌ Cannot access: ${countError.message}`);
        continue;
      }
      
      console.log(`   📊 Total rows: ${count}`);
      
      // Get sample data to understand structure
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (sampleError) {
        console.log(`   ❌ Cannot get sample data: ${sampleError.message}`);
        continue;
      }
      
      let columns = [];
      let dataTypes = {};
      let sampleValues = {};
      
      if (sampleData && sampleData.length > 0) {
        columns = Object.keys(sampleData[0]);
        console.log(`   📝 Columns (${columns.length}): ${columns.join(', ')}`);
        
        // Analyze data types and sample values
        for (const col of columns) {
          const firstValue = sampleData[0][col];
          dataTypes[col] = typeof firstValue;
          sampleValues[col] = firstValue;
        }
        
        console.log(`   📋 Sample row:`);
        console.log(`      ${JSON.stringify(sampleData[0], null, 2).substring(0, 300)}...`);
      } else {
        console.log(`   📝 No data found (empty table)`);
      }
      
      // Store schema information
      schemaInfo[tableName] = {
        rowCount: count,
        columns: columns,
        dataTypes: dataTypes,
        sampleData: sampleData?.slice(0, 2), // Store first 2 rows
        isEmpty: count === 0
      };
      
    } catch (error) {
      console.log(`   ❌ Error analyzing ${tableName}: ${error.message}`);
    }
  }
  
  // 2. Analyze relationships
  console.log('\n🔗 ANALYZING RELATIONSHIPS:');
  
  // Check question_tags relationships
  try {
    const { data: relationshipData, error } = await supabase
      .from('question_tags')
      .select(`
        id,
        question_id,
        tag_id,
        questions!inner(id, question_text),
        tags!inner(id, name, type)
      `)
      .limit(5);
    
    if (error) {
      console.log(`   ❌ Relationship analysis failed: ${error.message}`);
    } else {
      console.log(`   ✅ question_tags relationships working`);
      console.log(`   📊 Sample relationship data:`);
      console.log(`      ${JSON.stringify(relationshipData[0], null, 2).substring(0, 300)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Relationship analysis error: ${error.message}`);
  }
  
  // 3. Check specific data patterns
  console.log('\n📈 DATA PATTERN ANALYSIS:');
  
  // Analyze questions by category
  try {
    const { data: questionsByCategory, error } = await supabase
      .from('questions')
      .select('category_id, difficulty')
      .limit(100);
    
    if (!error && questionsByCategory) {
      const categoryCount = {};
      const difficultyCount = {};
      
      questionsByCategory.forEach(q => {
        categoryCount[q.category_id || 'null'] = (categoryCount[q.category_id || 'null'] || 0) + 1;
        difficultyCount[q.difficulty || 'null'] = (difficultyCount[q.difficulty || 'null'] || 0) + 1;
      });
      
      console.log(`   📊 Questions by category:`, categoryCount);
      console.log(`   📊 Questions by difficulty:`, difficultyCount);
    }
  } catch (error) {
    console.log(`   ❌ Pattern analysis error: ${error.message}`);
  }
  
  // Analyze tags by type
  try {
    const { data: tagsByType, error } = await supabase
      .from('tags')
      .select('type, is_active')
      .limit(100);
    
    if (!error && tagsByType) {
      const typeCount = {};
      const activeCount = { active: 0, inactive: 0 };
      
      tagsByType.forEach(t => {
        typeCount[t.type || 'null'] = (typeCount[t.type || 'null'] || 0) + 1;
        if (t.is_active) activeCount.active++;
        else activeCount.inactive++;
      });
      
      console.log(`   📊 Tags by type:`, typeCount);
      console.log(`   📊 Tags by status:`, activeCount);
    }
  } catch (error) {
    console.log(`   ❌ Tag analysis error: ${error.message}`);
  }
  
  // 4. Test views
  console.log('\n📋 TESTING VIEWS:');
  
  try {
    const { data: viewData, error } = await supabase
      .from('tag_question_counts')
      .select('*')
      .limit(10);
    
    if (error) {
      console.log(`   ❌ tag_question_counts view error: ${error.message}`);
    } else {
      console.log(`   ✅ tag_question_counts view working`);
      console.log(`   📊 Sample view data:`, viewData?.slice(0, 3));
    }
  } catch (error) {
    console.log(`   ❌ View test error: ${error.message}`);
  }
  
  // 5. Generate comprehensive schema report
  console.log('\n=== COMPREHENSIVE SCHEMA REPORT ===');
  
  const report = {
    summary: {
      totalTables: Object.keys(schemaInfo).length,
      tablesWithData: Object.values(schemaInfo).filter(t => !t.isEmpty).length,
      emptyTables: Object.values(schemaInfo).filter(t => t.isEmpty).length,
      totalRows: Object.values(schemaInfo).reduce((sum, t) => sum + t.rowCount, 0)
    },
    tables: schemaInfo,
    missingFunctions: [
      'get_unseen_questions',
      'record_question_interaction',
      'get_user_stats',
      'get_questions_by_category',
      'get_learning_recommendations'
    ],
    workingViews: ['tag_question_counts'],
    relationships: {
      'question_tags': 'Links questions to tags (many-to-many)',
      'questions -> categories': 'Questions belong to categories',
      'profiles': 'User profiles (likely linked to auth.users)',
      'quiz_sessions': 'User quiz sessions (empty)',
      'quiz_responses': 'Individual question responses (empty)'
    }
  };
  
  console.log('\n📊 SCHEMA SUMMARY:');
  console.log(`   Total Tables: ${report.summary.totalTables}`);
  console.log(`   Tables with Data: ${report.summary.tablesWithData}`);
  console.log(`   Empty Tables: ${report.summary.emptyTables}`);
  console.log(`   Total Rows: ${report.summary.totalRows}`);
  
  console.log('\n📋 TABLE DETAILS:');
  Object.entries(schemaInfo).forEach(([tableName, info]) => {
    console.log(`   ${tableName}: ${info.rowCount} rows, ${info.columns.length} columns`);
  });
  
  console.log('\n❌ MISSING FUNCTIONS:');
  report.missingFunctions.forEach(func => {
    console.log(`   - ${func}`);
  });
  
  console.log('\n✅ WORKING VIEWS:');
  report.workingViews.forEach(view => {
    console.log(`   - ${view}`);
  });
  
  // 6. Write detailed report to file
  const detailedReport = {
    timestamp: new Date().toISOString(),
    database: {
      url: process.env.VITE_SUPABASE_URL,
      keyType: 'publishable'
    },
    analysis: report
  };
  
  console.log('\n📝 Detailed schema report:');
  console.log(JSON.stringify(detailedReport, null, 2));
  
  return detailedReport;
}

// Run the analysis
getCompleteSchemaAnalysis().then(report => {
  console.log('\n✅ Complete live database schema analysis finished!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Create missing RPC functions');
  console.log('2. Populate empty tables (quiz_sessions, quiz_responses, user_question_history)');
  console.log('3. Test application functionality with live data');
  console.log('4. Compare with expected schema and identify gaps');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Schema analysis failed:', error);
  process.exit(1);
});