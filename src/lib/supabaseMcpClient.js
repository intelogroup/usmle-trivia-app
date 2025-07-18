import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Supabase MCP Client
 * This client interacts with the Supabase MCP server using MCP tools.
 * Based on official Supabase MCP documentation.
 */

let client = null;
let transport = null;

/**
 * Initialize the MCP client connection
 */
export async function initializeMcpClient() {
  if (client) return client;

  try {
    // Create MCP client and connect to the MCP server process
    transport = new StdioClientTransport({
      command: 'npx',
      args: [
        '-y',
        '@supabase/mcp-server-supabase@latest',
        '--access-token',
        process.env.SUPABASE_ACCESS_TOKEN,
        '--project-ref=bkuowoowlmwranfoliea',
        '--read-only'
      ],
      shell: true,
    });

    client = new Client({
      name: 'supabase-mcp-client',
      version: '1.0.0',
    });

    await client.connect(transport);
    console.log('✅ MCP client connected successfully');
    
    // List available tools
    const tools = await client.listTools();
    console.log('Available MCP tools:', tools.tools.map(t => t.name));
    
    return client;
  } catch (error) {
    console.error('❌ MCP client initialization failed:', error);
    throw error;
  }
}

/**
 * Execute a Supabase SQL query via MCP tool
 * @param {string} sql - The SQL query string to execute
 * @returns {Promise<object>} - The query result or error
 */
export async function executeSupabaseQuery(sql) {
  try {
    const mcpClient = await initializeMcpClient();
    
    // Try common tool names for SQL queries
    const possibleToolNames = [
      'supabase_query',
      'query_database',
      'sql_query',
      'execute_sql',
      'database_query',
      'run_sql'
    ];
    
    // Get available tools
    const tools = await mcpClient.listTools();
    const availableToolNames = tools.tools.map(t => t.name);
    
    // Find the correct tool name
    const sqlToolName = possibleToolNames.find(name => 
      availableToolNames.includes(name)
    );
    
    if (!sqlToolName) {
      console.log('Available tools:', availableToolNames);
      throw new Error(`No SQL query tool found. Available tools: ${availableToolNames.join(', ')}`);
    }
    
    const result = await mcpClient.callTool({
      name: sqlToolName,
      arguments: { query: sql },
    });
    
    return {
      success: true,
      data: result.content,
    };
  } catch (error) {
    console.error('[Supabase MCP] Query execution error:', error);
    return {
      success: false,
      error: error.message || error,
    };
  }
}

/**
 * Get available MCP tools
 */
export async function getMcpTools() {
  try {
    const mcpClient = await initializeMcpClient();
    const tools = await mcpClient.listTools();
    return {
      success: true,
      tools: tools.tools,
    };
  } catch (error) {
    console.error('[Supabase MCP] Failed to get tools:', error);
    return {
      success: false,
      error: error.message || error,
    };
  }
}

/**
 * Test functions for various tables and views
 */

export async function testTagsTableMcp() {
  const sql = 'SELECT id, name, type FROM tags LIMIT 3;';
  return await executeSupabaseQuery(sql);
}

export async function testQuestionsTableMcp() {
  const sql = 'SELECT id, question_text FROM questions LIMIT 3;';
  return await executeSupabaseQuery(sql);
}

export async function testProfilesTableMcp() {
  const sql = 'SELECT count(*) FROM profiles LIMIT 1;';
  return await executeSupabaseQuery(sql);
}

export async function testTagQuestionCountsViewMcp() {
  const sql = 'SELECT id, name, question_count FROM tag_question_counts LIMIT 3;';
  return await executeSupabaseQuery(sql);
}

export async function testQuestionFetchingMcp(categoryId = 'mixed', count = 2) {
  let sql;
  if (categoryId !== 'mixed') {
    sql = `
      SELECT q.id, q.question_text, q.options, q.correct_option_id, q.explanation, q.difficulty,
        tq.tag_id, t.name
      FROM questions q
      INNER JOIN question_tags tq ON q.id = tq.question_id
      INNER JOIN tags t ON tq.tag_id = t.id
      WHERE tq.tag_id = ${categoryId}
      LIMIT ${count};
    `;
  } else {
    sql = `
      SELECT q.id, q.question_text, q.options, q.correct_option_id, q.explanation, q.difficulty,
        tq.tag_id, t.name
      FROM questions q
      LEFT JOIN question_tags tq ON q.id = tq.question_id
      LEFT JOIN tags t ON tq.tag_id = t.id
      LIMIT ${count};
    `;
  }
  return await executeSupabaseQuery(sql);
}