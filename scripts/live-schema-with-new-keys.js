import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'env' });

console.log('🔗 Testing Live Database Connection with New Keys...');

// Test different key combinations
const configs = [
  {
    name: 'New Publishable Key',
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.Publishable_key || 'sb_publishable_bZkq0HoXxYxAHoaU3mDk0Q_iWsw7zCC'
  },
  {
    name: 'Original Anon Key',
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  },
  {
    name: 'Service Role Key',
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.SERVICE_ROLE_KEY
  }
];

console.log('Environment variables loaded:');
console.log('URL:', process.env.VITE_SUPABASE_URL);
console.log('New Publishable Key:', process.env.Publishable_key ? `${process.env.Publishable_key.substring(0, 20)}...` : 'NOT FOUND');
console.log('Token:', process.env.Token ? `${process.env.Token.substring(0, 20)}...` : 'NOT FOUND');

async function testDatabaseConnection() {
  for (const config of configs) {
    console.log(`\n🔑 Testing ${config.name}:`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Key: ${config.key ? `${config.key.substring(0, 20)}...` : 'NOT FOUND'}`);
    
    try {
      const supabase = createClient(config.url, config.key);
      
      // Test basic connection
      console.log('   Testing connection...');
      const { data, error } = await supabase.from('questions').select('count').limit(1);
      
      if (error) {
        console.log(`   ❌ Connection failed: ${error.message}`);
        continue;
      }
      
      console.log(`   ✅ Connection successful!`);
      
      // Get schema information
      await getFullSchemaInfo(supabase, config.name);
      
      // If we get here, this key works
      console.log(`\n🎉 SUCCESS: ${config.name} is working!`);
      return supabase;
      
    } catch (err) {
      console.log(`   ❌ Connection error: ${err.message}`);
    }
  }
  
  console.log('\n❌ No working database connection found');
  return null;
}

async function getFullSchemaInfo(supabase, keyName) {
  console.log(`\n📊 Getting schema information with ${keyName}...`);
  
  // Test known tables
  const tablesToTest = [
    'questions', 'tags', 'profiles', 'question_tags', 
    'quiz_sessions', 'quiz_responses', 'user_question_history', 
    'categories', 'tag_question_counts'
  ];
  
  console.log('\n🔍 Testing table access:');
  const accessibleTables = [];
  
  for (const tableName of tablesToTest) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${tableName}: ${count} rows`);
        accessibleTables.push(tableName);
      }
    } catch (err) {
      console.log(`   ❌ ${tableName}: ${err.message}`);
    }
  }
  
  console.log(`\n📋 Accessible tables: ${accessibleTables.join(', ')}`);
  
  // Get sample data from accessible tables
  if (accessibleTables.length > 0) {
    console.log('\n📝 Getting sample data:');
    
    for (const tableName of accessibleTables.slice(0, 5)) { // Limit to first 5 tables
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);
        
        if (error) {
          console.log(`   ❌ ${tableName} sample data: ${error.message}`);
        } else {
          console.log(`   📊 ${tableName} (${data?.length || 0} rows):`);
          if (data && data.length > 0) {
            console.log(`      Columns: ${Object.keys(data[0]).join(', ')}`);
            console.log(`      Sample: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
          }
        }
      } catch (err) {
        console.log(`   ❌ ${tableName} sample data error: ${err.message}`);
      }
    }
  }
  
  // Test RPC functions
  console.log('\n🔧 Testing RPC functions:');
  const rpcFunctions = [
    'get_unseen_questions',
    'record_question_interaction', 
    'get_user_stats',
    'get_questions_by_category',
    'get_learning_recommendations'
  ];
  
  for (const funcName of rpcFunctions) {
    try {
      const { data, error } = await supabase.rpc(funcName);
      if (error) {
        console.log(`   ❌ ${funcName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${funcName}: Function exists`);
      }
    } catch (err) {
      console.log(`   ❌ ${funcName}: ${err.message}`);
    }
  }
}

// Run the test
testDatabaseConnection().then(workingClient => {
  if (workingClient) {
    console.log('\n✅ Database analysis complete with working connection!');
  } else {
    console.log('\n❌ No working database connection found. Check your API keys.');
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Database analysis failed:', error);
  process.exit(1);
});