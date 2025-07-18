import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Role Key:', serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : 'NOT FOUND');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getCompleteSchemaAnalysis() {
  console.log('\n=== LIVE DATABASE SCHEMA ANALYSIS ===');
  
  try {
    // 1. Get all tables in the database
    console.log('\n📊 DISCOVERING ALL TABLES...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_all_tables');
    
    if (tablesError) {
      console.log('❌ Using fallback table discovery method...');
      
      // Fallback: Try known tables
      const knownTables = [
        'profiles', 'questions', 'tags', 'categories', 'question_tags', 
        'quiz_sessions', 'user_responses', 'user_question_history',
        'category_tags', 'quiz_responses', 'auth.users'
      ];
      
      console.log('\n🔍 CHECKING KNOWN TABLES:');
      for (const tableName of knownTables) {
        await analyzeTable(tableName);
      }
    } else {
      console.log('✅ Found tables:', tables?.map(t => t.table_name).join(', '));
      for (const table of tables || []) {
        await analyzeTable(table.table_name);
      }
    }
    
    // 2. Get database functions and views
    console.log('\n🔧 CHECKING DATABASE FUNCTIONS & VIEWS...');
    await checkDatabaseFunctions();
    
    // 3. Get RLS policies
    console.log('\n🛡️ CHECKING ROW LEVEL SECURITY POLICIES...');
    await checkRLSPolicies();
    
    // 4. Get indexes and performance info
    console.log('\n⚡ CHECKING INDEXES & PERFORMANCE...');
    await checkIndexes();
    
    // 5. Get relationship constraints
    console.log('\n🔗 CHECKING FOREIGN KEY RELATIONSHIPS...');
    await checkForeignKeys();
    
  } catch (error) {
    console.error('❌ Schema analysis error:', error);
  }
}

async function analyzeTable(tableName) {
  console.log(`\n📋 TABLE: ${tableName.toUpperCase()}`);
  
  try {
    // Get table structure
    const { data: structure, error: structureError } = await supabase.rpc('get_table_structure', { table_name: tableName });
    
    if (structureError) {
      // Fallback: Try to get sample data to understand structure
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log(`  ❌ Cannot access table: ${sampleError.message}`);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log(`  📝 Columns: ${Object.keys(sampleData[0]).join(', ')}`);
        console.log(`  📊 Sample data:`, JSON.stringify(sampleData[0], null, 2).substring(0, 300) + '...');
      }
    } else {
      console.log('  📝 Table structure:', structure);
    }
    
    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`  📊 Total rows: ${count}`);
    }
    
    // Get recent sample data
    const { data: recentData, error: recentError } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: false })
      .limit(3);
    
    if (!recentError && recentData?.length > 0) {
      console.log(`  📅 Recent data (${recentData.length} rows):`);
      recentData.forEach((row, index) => {
        console.log(`    Row ${index + 1}:`, JSON.stringify(row, null, 2).substring(0, 200) + '...');
      });
    }
    
  } catch (error) {
    console.log(`  ❌ Error analyzing table ${tableName}:`, error.message);
  }
}

async function checkDatabaseFunctions() {
  const functionsToCheck = [
    'get_unseen_questions',
    'record_question_interaction',
    'get_user_progress',
    'update_user_stats',
    'get_leaderboard_data'
  ];
  
  for (const funcName of functionsToCheck) {
    try {
      const { data, error } = await supabase.rpc(funcName);
      if (error) {
        console.log(`  ❌ Function ${funcName}: NOT FOUND or ERROR - ${error.message}`);
      } else {
        console.log(`  ✅ Function ${funcName}: EXISTS`);
      }
    } catch (error) {
      console.log(`  ❌ Function ${funcName}: ERROR - ${error.message}`);
    }
  }
}

async function checkRLSPolicies() {
  const tablesToCheck = [
    'profiles', 'questions', 'tags', 'quiz_sessions', 
    'user_responses', 'question_tags', 'user_question_history'
  ];
  
  for (const tableName of tablesToCheck) {
    try {
      // Try to access with anon role to test RLS
      const anonSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
      const { data, error } = await anonSupabase.from(tableName).select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`  🛡️ ${tableName}: RLS ENABLED, NO POLICIES (blocked)`);
        } else {
          console.log(`  ❌ ${tableName}: RLS ERROR - ${error.message}`);
        }
      } else {
        console.log(`  ⚠️ ${tableName}: RLS DISABLED or OPEN POLICY (accessible)`);
      }
    } catch (error) {
      console.log(`  ❌ ${tableName}: RLS CHECK ERROR - ${error.message}`);
    }
  }
}

async function checkIndexes() {
  try {
    const { data: indexes, error } = await supabase.rpc('get_table_indexes');
    if (error) {
      console.log('  ❌ Cannot retrieve index information:', error.message);
    } else {
      console.log('  📊 Database indexes:', indexes);
    }
  } catch (error) {
    console.log('  ❌ Index check error:', error.message);
  }
}

async function checkForeignKeys() {
  try {
    const { data: foreignKeys, error } = await supabase.rpc('get_foreign_keys');
    if (error) {
      console.log('  ❌ Cannot retrieve foreign key information:', error.message);
    } else {
      console.log('  🔗 Foreign key relationships:', foreignKeys);
    }
  } catch (error) {
    console.log('  ❌ Foreign key check error:', error.message);
  }
}

// Run the analysis
getCompleteSchemaAnalysis().then(() => {
  console.log('\n✅ Database analysis complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Database analysis failed:', error);
  process.exit(1);
});