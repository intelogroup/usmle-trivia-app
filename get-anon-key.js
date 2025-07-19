import { initializeMcpClient, executeSupabaseQuery, getMcpTools } from './src/lib/supabaseMcpClient.js';

process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';

async function getAnonKey() {
  try {
    console.log('Getting anon key via MCP...');
    
    const mcpClient = await initializeMcpClient();
    
    // Try to call get_anon_key tool
    const result = await mcpClient.callTool({
      name: 'get_anon_key',
      arguments: {},
    });
    
    console.log('Anon key result:', result);
    
  } catch (error) {
    console.error('Failed to get anon key:', error);
  }
}

getAnonKey().catch(console.error);