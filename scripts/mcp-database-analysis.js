import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function getLiveDatabaseSchema() {
  console.log('🔗 Connecting to Supabase via MCP...');
  
  // Create MCP client
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea'],
    shell: true
  });

  const client = new Client({
    name: 'supabase-schema-client',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // Get list of available tools
    const tools = await client.listTools();
    console.log('🔧 Available tools:', tools.tools.map(t => t.name));

    // Try to execute schema queries
    const schemaQueries = [
      {
        name: 'List all tables',
        sql: `SELECT table_name, table_schema 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              ORDER BY table_name;`
      },
      {
        name: 'List all columns',
        sql: `SELECT table_name, column_name, data_type, is_nullable, column_default
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              ORDER BY table_name, ordinal_position;`
      },
      {
        name: 'List foreign keys',
        sql: `SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
              FROM information_schema.table_constraints AS tc
              JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
              WHERE tc.constraint_type = 'FOREIGN KEY'
              ORDER BY tc.table_name;`
      },
      {
        name: 'List indexes',
        sql: `SELECT
                schemaname,
                tablename,
                indexname,
                indexdef
              FROM pg_indexes
              WHERE schemaname = 'public'
              ORDER BY tablename, indexname;`
      }
    ];

    console.log('\n=== DATABASE SCHEMA ANALYSIS ===');
    
    for (const query of schemaQueries) {
      console.log(`\n📊 ${query.name}:`);
      try {
        const result = await client.callTool({
          name: 'supabase',
          arguments: { sql: query.sql }
        });
        console.log(JSON.stringify(result.content, null, 2));
      } catch (error) {
        console.error(`❌ Error executing query: ${error.message}`);
      }
    }

    // Get sample data from known tables
    const tableQueries = [
      'SELECT * FROM questions LIMIT 3;',
      'SELECT * FROM tags LIMIT 10;',
      'SELECT * FROM profiles LIMIT 3;',
      'SELECT * FROM question_tags LIMIT 5;',
      'SELECT * FROM quiz_sessions LIMIT 3;',
      'SELECT * FROM user_question_history LIMIT 3;'
    ];

    console.log('\n=== SAMPLE DATA ANALYSIS ===');
    
    for (const sql of tableQueries) {
      const tableName = sql.match(/FROM (\w+)/)[1];
      console.log(`\n📋 Sample data from ${tableName}:`);
      try {
        const result = await client.callTool({
          name: 'supabase',
          arguments: { sql }
        });
        console.log(JSON.stringify(result.content, null, 2));
      } catch (error) {
        console.error(`❌ Error getting data from ${tableName}: ${error.message}`);
      }
    }

    await client.close();
    console.log('\n✅ Database analysis complete!');
    
  } catch (error) {
    console.error('❌ MCP Connection error:', error);
    console.log('\nTrying alternative approach...');
    
    // Alternative: Try to run queries using the existing working keys
    await tryDirectDatabaseAccess();
  }
}

async function tryDirectDatabaseAccess() {
  console.log('\n🔄 Trying direct database access...');
  
  // Try with both anon and service role keys
  const { createClient } = await import('@supabase/supabase-js');
  
  const configs = [
    {
      name: 'Anon Key',
      url: 'https://bkuowoowlmwranfoliea.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI'
    },
    {
      name: 'Service Role Key',
      url: 'https://bkuowoowlmwranfoliea.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIwMDg1NCwiZXhwIjoyMDY1Nzc2ODU0fQ.V1-SQLXxMeMj6P638-gRpU3i38m2CqYdT2C8nLubLpc'
    }
  ];

  for (const config of configs) {
    console.log(`\n🔑 Testing with ${config.name}:`);
    
    try {
      const supabase = createClient(config.url, config.key);
      
      // Test basic connectivity
      const { data, error } = await supabase.from('questions').select('count').limit(1);
      
      if (error) {
        console.log(`❌ ${config.name} failed: ${error.message}`);
        continue;
      }
      
      console.log(`✅ ${config.name} working! Testing table access...`);
      
      // Test access to known tables
      const tables = ['questions', 'tags', 'profiles', 'question_tags', 'quiz_sessions'];
      
      for (const tableName of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3);
          
          if (tableError) {
            console.log(`  ❌ ${tableName}: ${tableError.message}`);
          } else {
            console.log(`  ✅ ${tableName}: ${tableData?.length || 0} rows`);
            if (tableData && tableData.length > 0) {
              console.log(`    📊 Columns: ${Object.keys(tableData[0]).join(', ')}`);
              console.log(`    📝 Sample: ${JSON.stringify(tableData[0], null, 2).substring(0, 200)}...`);
            }
          }
        } catch (err) {
          console.log(`  ❌ ${tableName}: ${err.message}`);
        }
      }
      
      // If we found a working key, break
      if (!error) {
        console.log(`\n🎉 Successfully connected with ${config.name}!`);
        break;
      }
      
    } catch (err) {
      console.log(`❌ ${config.name} connection failed: ${err.message}`);
    }
  }
}

// Run the analysis
getLiveDatabaseSchema().then(() => {
  console.log('\n🏁 Analysis complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
});