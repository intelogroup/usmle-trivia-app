import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMcpTools() {
  console.log('🔍 Testing MCP Supabase server tools...\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
    shell: true,
    env: {
      SUPABASE_ACCESS_TOKEN: 'sbp_0323f6c04769a3d0229d282036f7b34481b59d33',
    },
  });

  const client = new Client({
    name: 'test-supabase-mcp-client',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // List available tools
    const toolsResponse = await client.listTools();
    console.log('\n📋 Available tools:');
    console.log(JSON.stringify(toolsResponse, null, 2));

    // Test each available tool
    if (toolsResponse.tools && toolsResponse.tools.length > 0) {
      for (const tool of toolsResponse.tools) {
        console.log(`\n🔧 Testing tool: ${tool.name}`);
        try {
          // Try a simple query for each tool
          if (tool.name.includes('query') || tool.name.includes('sql')) {
            const result = await client.callTool({
              name: tool.name,
              arguments: { 
                sql: 'SELECT COUNT(*) as count FROM questions LIMIT 1;'
              },
            });
            console.log(`   ✅ ${tool.name} result:`, JSON.stringify(result, null, 2));
          } else {
            console.log(`   ℹ️  Skipping ${tool.name} - not a query tool`);
          }
        } catch (error) {
          console.log(`   ❌ Error testing ${tool.name}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('💥 MCP connection error:', error);
  } finally {
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
}

testMcpTools();