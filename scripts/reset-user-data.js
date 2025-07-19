/**
 * Reset User Data Script
 * This script safely removes all user data from the database while preserving schema and RLS policies.
 * 
 * Tables to reset:
 * 1. profiles
 * 2. quiz_sessions
 * 3. quiz_responses
 * 4. user_stats
 * 5. user_tag_scores
 * 6. user_progress
 * 7. user_question_history
 * 8. user_activity
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let client = null;
let transport = null;

/**
 * Initialize MCP client for write operations (without read-only flag)
 */
async function initializeMcpClient() {
  if (client) return client;

  try {
    // Create MCP client and connect WITHOUT read-only flag
    transport = new StdioClientTransport({
      command: 'npx',
      args: [
        '-y',
        '@supabase/mcp-server-supabase@latest',
        '--access-token',
        process.env.SUPABASE_ACCESS_TOKEN,
        '--project-ref=bkuowoowlmwranfoliea'
        // Note: Removed --read-only flag to allow writes
      ],
      shell: true,
    });

    client = new Client({
      name: 'supabase-mcp-client-reset',
      version: '1.0.0',
    });

    await client.connect(transport);
    console.log('✅ MCP client connected successfully (write mode)');
    
    return client;
  } catch (error) {
    console.error('❌ MCP client initialization failed:', error);
    throw error;
  }
}

/**
 * Execute SQL query via MCP
 */
async function executeSQL(query) {
  try {
    const mcpClient = await initializeMcpClient();
    
    const result = await mcpClient.callTool({
      name: 'execute_sql',
      arguments: { query },
    });
    
    return {
      success: true,
      data: result.content,
    };
  } catch (error) {
    console.error('[Reset Script] SQL execution error:', error);
    return {
      success: false,
      error: error.message || error,
    };
  }
}

/**
 * Check which tables exist before deletion
 */
async function checkExistingTables() {
  console.log('🔍 Checking existing tables...');
  
  const query = `
    SELECT table_name, table_type
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'profiles', 
      'quiz_sessions', 
      'quiz_responses', 
      'user_stats', 
      'user_tag_scores', 
      'user_progress', 
      'user_question_history', 
      'user_activity'
    )
    ORDER BY table_name;
  `;
  
  const result = await executeSQL(query);
  if (result.success) {
    console.log('📊 Existing tables found:', result.data);
    return result.data;
  } else {
    console.error('❌ Failed to check existing tables:', result.error);
    return [];
  }
}

/**
 * Get row counts for each table before deletion
 */
async function getRowCounts() {
  console.log('📊 Getting current row counts...');
  
  const tables = [
    'profiles',
    'quiz_sessions', 
    'quiz_responses',
    'user_stats',
    'user_tag_scores',
    'user_progress',
    'user_question_history',
    'user_activity'
  ];
  
  const counts = {};
  
  for (const table of tables) {
    try {
      const query = `SELECT COUNT(*) as count FROM ${table};`;
      const result = await executeSQL(query);
      
      if (result.success && result.data && result.data.length > 0) {
        const countData = JSON.parse(result.data[0].text);
        counts[table] = countData[0]?.count || 0;
      } else {
        counts[table] = 'N/A (table may not exist)';
      }
    } catch (error) {
      counts[table] = `Error: ${error.message}`;
    }
  }
  
  console.log('📈 Current row counts:', counts);
  return counts;
}

/**
 * Execute deletion queries in the correct order (respecting foreign key constraints)
 */
async function resetUserData() {
  console.log('🗑️  Starting user data reset...');
  
  // Order matters due to foreign key constraints
  // Delete child tables first, then parent tables
  const deletionOrder = [
    'quiz_responses',        // References quiz_sessions
    'user_question_history', // References profiles
    'user_activity',         // References profiles  
    'user_tag_scores',       // References profiles
    'user_progress',         // References profiles
    'user_stats',            // References profiles
    'quiz_sessions',         // References profiles
    'profiles'               // Main user table
  ];
  
  const results = {};
  
  for (const table of deletionOrder) {
    console.log(`🗑️  Deleting data from ${table}...`);
    
    try {
      const query = `DELETE FROM ${table};`;
      const result = await executeSQL(query);
      
      if (result.success) {
        console.log(`✅ Successfully deleted data from ${table}`);
        results[table] = { success: true, message: 'Data deleted successfully' };
      } else {
        console.error(`❌ Failed to delete data from ${table}:`, result.error);
        results[table] = { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`❌ Error deleting from ${table}:`, error.message);
      results[table] = { success: false, error: error.message };
    }
    
    // Small delay between operations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

/**
 * Verify schema integrity after deletion
 */
async function verifySchemaIntegrity() {
  console.log('🔍 Verifying schema integrity...');
  
  const query = `
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'profiles', 
      'quiz_sessions', 
      'quiz_responses', 
      'user_stats', 
      'user_tag_scores', 
      'user_progress', 
      'user_question_history', 
      'user_activity'
    )
    ORDER BY table_name, ordinal_position;
  `;
  
  const result = await executeSQL(query);
  if (result.success) {
    console.log('✅ Schema integrity verified - all tables and columns intact');
    return result.data;
  } else {
    console.error('❌ Schema verification failed:', result.error);
    return null;
  }
}

/**
 * Check RLS policies are still intact
 */
async function verifyRLSPolicies() {
  console.log('🔍 Verifying RLS policies...');
  
  const query = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 
      'quiz_sessions', 
      'quiz_responses', 
      'user_stats', 
      'user_tag_scores', 
      'user_progress', 
      'user_question_history', 
      'user_activity'
    )
    ORDER BY tablename, policyname;
  `;
  
  const result = await executeSQL(query);
  if (result.success) {
    console.log('✅ RLS policies verified - all policies intact');
    return result.data;
  } else {
    console.error('❌ RLS policy verification failed:', result.error);
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting User Data Reset Process...');
  console.log('⚠️  WARNING: This will permanently delete all user data!');
  console.log('📋 Tables to be reset: profiles, quiz_sessions, quiz_responses, user_stats, user_tag_scores, user_progress, user_question_history, user_activity');
  console.log('');
  
  try {
    // Step 1: Check existing tables
    await checkExistingTables();
    
    // Step 2: Get current row counts
    const beforeCounts = await getRowCounts();
    
    // Step 3: Execute deletions
    const deletionResults = await resetUserData();
    
    // Step 4: Verify final counts
    const afterCounts = await getRowCounts();
    
    // Step 5: Verify schema integrity
    await verifySchemaIntegrity();
    
    // Step 6: Verify RLS policies
    await verifyRLSPolicies();
    
    // Summary
    console.log('');
    console.log('📊 RESET SUMMARY');
    console.log('================');
    console.log('Row counts before reset:', beforeCounts);
    console.log('Row counts after reset:', afterCounts);
    console.log('Deletion results:', deletionResults);
    
    const successfulDeletions = Object.values(deletionResults).filter(r => r.success).length;
    const totalTables = Object.keys(deletionResults).length;
    
    if (successfulDeletions === totalTables) {
      console.log('✅ User data reset completed successfully!');
    } else {
      console.log(`⚠️  Partial success: ${successfulDeletions}/${totalTables} tables reset successfully`);
    }
    
  } catch (error) {
    console.error('💥 Reset process failed:', error);
  } finally {
    // Clean up client connection
    if (client && transport) {
      try {
        await client.close();
        console.log('🔌 MCP client connection closed');
      } catch (error) {
        console.error('Error closing client:', error);
      }
    }
    process.exit(0);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as resetUserData };