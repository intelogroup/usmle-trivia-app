import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function verifyTableStructures() {
  console.log('🔍 Verifying specific table structures...\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
    shell: true,
    env: {
      SUPABASE_ACCESS_TOKEN: 'sbp_0323f6c04769a3d0229d282036f7b34481b59d33',
    },
  });

  const client = new Client({
    name: 'verify-structures-client',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to live database\n');

    // Helper function to extract JSON from MCP response
    function extractJSON(responseText) {
      const arrayMatch = responseText.match(/\[.*?\]/s);
      return arrayMatch ? JSON.parse(arrayMatch[0]) : [];
    }

    // Check quiz_sessions structure
    console.log('📋 Quiz Sessions Table Structure:');
    const quizSessionsResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'quiz_sessions'
          ORDER BY ordinal_position;
        `
      },
    });
    
    const quizSessionsColumns = extractJSON(quizSessionsResult.content[0].text);
    quizSessionsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Check quiz_responses structure
    console.log('\n📋 Quiz Responses Table Structure:');
    const quizResponsesResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'quiz_responses'
          ORDER BY ordinal_position;
        `
      },
    });
    
    const quizResponsesColumns = extractJSON(quizResponsesResult.content[0].text);
    quizResponsesColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Check user_question_history structure
    console.log('\n📋 User Question History Table Structure:');
    const userQuestionHistoryResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'user_question_history'
          ORDER BY ordinal_position;
        `
      },
    });
    
    const userQuestionHistoryColumns = extractJSON(userQuestionHistoryResult.content[0].text);
    userQuestionHistoryColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Check question_tags structure
    console.log('\n📋 Question Tags Table Structure:');
    const questionTagsResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'question_tags'
          ORDER BY ordinal_position;
        `
      },
    });
    
    const questionTagsColumns = extractJSON(questionTagsResult.content[0].text);
    questionTagsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    await client.close();
    console.log('\n✅ Table structure verification completed!');

  } catch (error) {
    console.error('💥 Error verifying structures:', error);
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

verifyTableStructures();