import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function quickSchemaCheck() {
  console.log('🔍 Checking missing tables in live database...\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
    shell: true,
    env: {
      SUPABASE_ACCESS_TOKEN: 'sbp_0323f6c04769a3d0229d282036f7b34481b59d33',
    },
  });

  const client = new Client({
    name: 'quick-schema-check',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    
    console.log('✅ Connected to live database\n');

    // Check for missing quiz tables
    const missingTables = ['quiz_sessions', 'quiz_responses', 'user_question_history', 'question_tags', 'user_tag_scores', 'user_stats'];
    
    for (const tableName of missingTables) {
      console.log(`\n📋 Checking if table '${tableName}' exists:`);
      const result = await client.callTool({
        name: 'execute_sql',
        arguments: { 
          query: `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = '${tableName}'
            );
          `
        },
      });
      
      const exists = JSON.parse(result.content[0].text)[0].exists;
      console.log(`Table '${tableName}': ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (exists) {
        // Get table structure
        const structureResult = await client.callTool({
          name: 'execute_sql',
          arguments: { 
            query: `
              SELECT column_name, data_type, is_nullable, column_default
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = '${tableName}'
              ORDER BY ordinal_position;
            `
          },
        });
        
        console.log('  Structure:', JSON.stringify(JSON.parse(structureResult.content[0].text), null, 2));
      }
    }

    // Check profiles table for username column
    console.log('\n📋 Checking profiles table for username column:');
    const usernameResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
          AND column_name = 'username';
        `
      },
    });
    
    const hasUsername = JSON.parse(usernameResult.content[0].text).length > 0;
    console.log(`Username column in profiles: ${hasUsername ? '✅ EXISTS' : '❌ MISSING'}`);

    await client.close();
    console.log('\n✅ Quick schema check completed!');

  } catch (error) {
    console.error('💥 Error checking schema:', error);
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

quickSchemaCheck();