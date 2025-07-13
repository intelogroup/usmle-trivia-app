import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function listAllTables() {
  console.log('🔍 Listing all tables in live database...\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
    shell: true,
    env: {
      SUPABASE_ACCESS_TOKEN: 'sbp_0323f6c04769a3d0229d282036f7b34481b59d33',
    },
  });

  const client = new Client({
    name: 'list-tables-client',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    
    console.log('✅ Connected to live database\n');

    // Get all table names
    console.log('📋 All tables in public schema:');
    const result = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT table_name
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `
      },
    });
    
    // Extract JSON from the MCP response
    const responseText = result.content[0].text;
    
    // Find just the JSON array
    const arrayMatch = responseText.match(/\[.*?\]/s);
    
    if (!arrayMatch) {
      console.log('Could not find JSON array');
      return;
    }
    
    const tables = JSON.parse(arrayMatch[0]);
    console.log('Tables found:', tables.map(t => t.table_name).join(', '));
    
    // Check if there are any tables with 'quiz' in the name
    console.log('\n🔍 Tables containing "quiz":');
    const quizTables = tables.filter(t => t.table_name.toLowerCase().includes('quiz'));
    if (quizTables.length > 0) {
      console.log('Quiz tables:', quizTables.map(t => t.table_name).join(', '));
    } else {
      console.log('No tables found containing "quiz"');
    }

    // Check if there are any tables with 'user' in the name
    console.log('\n🔍 Tables containing "user":');
    const userTables = tables.filter(t => t.table_name.toLowerCase().includes('user'));
    if (userTables.length > 0) {
      console.log('User tables:', userTables.map(t => t.table_name).join(', '));
    } else {
      console.log('No tables found containing "user"');
    }

    // Check if there are any tables with 'question' in the name
    console.log('\n🔍 Tables containing "question":');
    const questionTables = tables.filter(t => t.table_name.toLowerCase().includes('question'));
    if (questionTables.length > 0) {
      console.log('Question tables:', questionTables.map(t => t.table_name).join(', '));
    } else {
      console.log('No tables found containing "question"');
    }

    await client.close();
    console.log('\n✅ Table listing completed!');

  } catch (error) {
    console.error('💥 Error listing tables:', error);
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

listAllTables();