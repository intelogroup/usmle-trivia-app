import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function checkLiveSchema() {
  console.log('🔍 Checking LIVE database schema via MCP...\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
    shell: true,
    env: {
      SUPABASE_ACCESS_TOKEN: 'sbp_0323f6c04769a3d0229d282036f7b34481b59d33',
    },
  });

  const client = new Client({
    name: 'schema-check-client',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    
    console.log('✅ Connected to live database\n');

    // Get all tables in public schema
    console.log('📋 1. Getting all tables:');
    const tablesResult = await client.callTool({
      name: 'list_tables',
      arguments: { 
        schemas: ['public'] 
      },
    });
    
    console.log('Tables result:', JSON.stringify(tablesResult, null, 2));

    // Check quiz_sessions table structure
    console.log('\n📋 2. Checking quiz_sessions table structure:');
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
    
    console.log('Quiz sessions schema:', JSON.stringify(quizSessionsResult, null, 2));

    // Check quiz_responses table structure
    console.log('\n📋 3. Checking quiz_responses table structure:');
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
    
    console.log('Quiz responses schema:', JSON.stringify(quizResponsesResult, null, 2));

    // Check questions table structure
    console.log('\n📋 4. Checking questions table structure:');
    const questionsResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'questions'
          ORDER BY ordinal_position;
        `
      },
    });
    
    console.log('Questions schema:', JSON.stringify(questionsResult, null, 2));

    // Check foreign key constraints
    console.log('\n📋 5. Checking foreign key constraints:');
    const fkResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
          WHERE constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND tc.table_name IN ('quiz_sessions', 'quiz_responses', 'user_question_history', 'questions', 'question_tags');
        `
      },
    });
    
    console.log('Foreign keys:', JSON.stringify(fkResult, null, 2));

    // Check RLS policies
    console.log('\n📋 6. Checking RLS policies:');
    const rlsResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT 
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public'
          AND tablename IN ('quiz_sessions', 'quiz_responses', 'user_question_history');
        `
      },
    });
    
    console.log('RLS policies:', JSON.stringify(rlsResult, null, 2));

    // Check if RPC functions exist
    console.log('\n📋 7. Checking RPC functions:');
    const rpcResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT 
            routine_name,
            routine_type,
            data_type as return_type
          FROM information_schema.routines 
          WHERE routine_schema = 'public'
          AND routine_name IN ('get_unseen_questions', 'record_question_interaction');
        `
      },
    });
    
    console.log('RPC functions:', JSON.stringify(rpcResult, null, 2));

    // Check user profiles table structure
    console.log('\n📋 8. Checking profiles table structure:');
    const profilesResult = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
          ORDER BY ordinal_position;
        `
      },
    });
    
    console.log('Profiles schema:', JSON.stringify(profilesResult, null, 2));

    await client.close();
    console.log('\n✅ Schema check completed!');

  } catch (error) {
    console.error('💥 Error checking schema:', error);
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

checkLiveSchema();