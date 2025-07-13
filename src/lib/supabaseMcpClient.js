import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Supabase MCP Client
 * This client interacts with the Supabase MCP server using MCP tools.
 */

const SUPABASE_MCP_TOOL_NAME = 'execute_sql'; // The actual tool name from MCP server

// Create MCP client and connect to the MCP server process
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
  shell: true,
  env: {
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
  },
});

const client = new Client({
  name: 'supabase-mcp-client',
  version: '1.0.0',
});

await client.connect(transport);

/**
 * Execute a Supabase query via MCP tool
 * @param {string} sql - The SQL query string to execute
 * @returns {Promise<object>} - The query result or error
 */
export async function executeSupabaseQuery(sql) {
  try {
    const result = await client.callTool({
      name: SUPABASE_MCP_TOOL_NAME,
      arguments: { query: sql }, // Use 'query' parameter as expected by the tool
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
