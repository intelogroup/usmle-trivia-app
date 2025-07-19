#!/usr/bin/env node
import { executeSupabaseQuery, initializeMcpClient } from './src/lib/supabaseMcpClient.js';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables from env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, 'env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

console.log('🔍 Quiz Session Permissions Test');
console.log('================================');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key present:', !!anonKey);
console.log('🔑 Publishable Key present:', !!publishableKey);
console.log('🔑 Service Role Key present:', !!serviceRoleKey);
console.log('');

async function testMcpQuizSessionsTable() {
  console.log('📋 Testing quiz_sessions table via MCP...');
  try {
    // Test table structure
    const structureResult = await executeSupabaseQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'quiz_sessions' 
      ORDER BY ordinal_position;
    `);

    if (structureResult.success) {
      console.log('✅ quiz_sessions table structure:');
      console.log(structureResult.data);
    } else {
      console.log('❌ Failed to get table structure:', structureResult.error);
    }

    // Test current data count
    const countResult = await executeSupabaseQuery(`
      SELECT COUNT(*) as session_count FROM quiz_sessions;
    `);

    if (countResult.success) {
      console.log('📊 Current quiz_sessions count:');
      console.log(countResult.data);
    } else {
      console.log('❌ Failed to count sessions:', countResult.error);
    }

    // Test RLS policies
    const rlsResult = await executeSupabaseQuery(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies 
      WHERE tablename = 'quiz_sessions';
    `);

    if (rlsResult.success) {
      console.log('🔒 RLS policies on quiz_sessions:');
      console.log(rlsResult.data);
    } else {
      console.log('❌ Failed to get RLS policies:', rlsResult.error);
    }

  } catch (error) {
    console.error('💥 MCP test failed:', error);
  }
}

async function testDirectSupabaseConnection(keyType, key) {
  console.log(`\n🔗 Testing direct connection with ${keyType}...`);
  
  const client = createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Test basic table access
    const { data: sessionData, error: sessionError } = await client
      .from('quiz_sessions')
      .select('*')
      .limit(5);

    if (sessionError) {
      console.log(`❌ ${keyType} - Error reading quiz_sessions:`, sessionError.message);
    } else {
      console.log(`✅ ${keyType} - Successfully read ${sessionData.length} quiz_sessions`);
    }

    // Test inserting a new quiz session
    const testSession = {
      user_id: '550e8400-e29b-41d4-a716-446655440000', // Test UUID
      category_id: 1,
      questions_count: 5,
      score: 4,
      time_taken: 120,
      completed_at: new Date().toISOString(),
      answers: [
        { question_id: 1, selected_option: 'A', is_correct: true },
        { question_id: 2, selected_option: 'B', is_correct: false }
      ]
    };

    const { data: insertData, error: insertError } = await client
      .from('quiz_sessions')
      .insert([testSession])
      .select();

    if (insertError) {
      console.log(`❌ ${keyType} - Error inserting quiz_session:`, insertError.message);
      console.log('Error details:', insertError);
    } else {
      console.log(`✅ ${keyType} - Successfully inserted quiz_session:`, insertData);
      
      // Clean up - delete the test session
      const { error: deleteError } = await client
        .from('quiz_sessions')
        .delete()
        .eq('id', insertData[0].id);
        
      if (deleteError) {
        console.log(`⚠️ ${keyType} - Failed to clean up test session:`, deleteError.message);
      } else {
        console.log(`🧹 ${keyType} - Test session cleaned up successfully`);
      }
    }

    // Test current user context
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) {
      console.log(`❌ ${keyType} - Error getting user:`, userError.message);
    } else {
      console.log(`👤 ${keyType} - Current user:`, userData.user ? userData.user.id : 'No user (anonymous)');
    }

  } catch (error) {
    console.error(`💥 ${keyType} test failed:`, error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive quiz session permissions test...\n');

  // Test 1: MCP connection and table analysis
  await testMcpQuizSessionsTable();

  // Test 2: Direct connection with different keys
  if (anonKey) {
    await testDirectSupabaseConnection('Anon Key', anonKey);
  }

  if (publishableKey) {
    await testDirectSupabaseConnection('Publishable Key', publishableKey);
  }

  if (serviceRoleKey) {
    await testDirectSupabaseConnection('Service Role Key', serviceRoleKey);
  }

  console.log('\n🏁 Test completed!');
  console.log('\nKey findings:');
  console.log('- Check if the publishable key has INSERT permissions on quiz_sessions');
  console.log('- Review RLS policies that might be blocking anonymous inserts');
  console.log('- Compare error messages between different key types');
}

runAllTests().catch(console.error);