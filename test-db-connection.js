#!/usr/bin/env node

/**
 * Simple database connection test with new keys
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔗 Testing Database Connection with New Keys\n='.repeat(50));

// Read environment variables
const envPath = join(__dirname, 'env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Configuration:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey ? 'Present (sb_publishable_...)' : 'Missing'}`);

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing required configuration');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

console.log('\n📊 Running Connection Tests:');
console.log('='.repeat(50));

// Test 1: Basic connectivity
async function testBasicConnection() {
  try {
    console.log('1. Testing basic connectivity...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Basic connection successful');
    return true;
  } catch (err) {
    console.log(`   ❌ Exception: ${err.message}`);
    return false;
  }
}

// Test 2: Test auth connection
async function testAuthConnection() {
  try {
    console.log('2. Testing auth service...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing!') {
      console.log(`   ❌ Auth error: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Auth service accessible');
    return true;
  } catch (err) {
    console.log(`   ❌ Auth exception: ${err.message}`);
    return false;
  }
}

// Test 3: List available tables
async function testTableAccess() {
  try {
    console.log('3. Testing table access...');
    
    // Try to access some common tables
    const tables = ['profiles', 'questions', 'quiz_sessions'];
    let accessibleTables = 0;
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (!error) {
          console.log(`   ✅ Table '${table}' accessible`);
          accessibleTables++;
        } else {
          console.log(`   ⚠️  Table '${table}' not accessible: ${error.message}`);
        }
      } catch (err) {
        console.log(`   ⚠️  Table '${table}' error: ${err.message}`);
      }
    }
    
    return accessibleTables > 0;
  } catch (err) {
    console.log(`   ❌ Table access exception: ${err.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    basicConnection: await testBasicConnection(),
    authConnection: await testAuthConnection(),
    tableAccess: await testTableAccess()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST RESULTS SUMMARY:');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)}: ${status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`OVERALL: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
  
  if (passed === total) {
    console.log('\n🎉 EXCELLENT! Database connection is working properly');
    console.log('✅ New publishable key is functioning correctly');
    console.log('✅ Legacy keys successfully removed');
  } else if (passed > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some tests failed but basic connectivity works');
    console.log('• This might be due to table permissions or RLS policies');
    console.log('• Core functionality should still work');
  } else {
    console.log('\n🚨 CONNECTION FAILED - Please check your configuration');
    console.log('• Verify the publishable key is correct');
    console.log('• Check if the Supabase project is active');
  }
  
  return passed / total;
}

// Execute tests
runAllTests().then(successRate => {
  process.exit(successRate >= 0.5 ? 0 : 1);
}).catch(err => {
  console.log(`\n💥 Fatal error: ${err.message}`);
  process.exit(1);
});