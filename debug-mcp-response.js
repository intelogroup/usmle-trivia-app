import { executeSupabaseQuery } from './src/lib/supabaseMcpClient.js';

process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';

async function debugMcpResponse() {
  console.log('Testing MCP response structure...');
  
  const usersQuery = `SELECT id, email FROM auth.users LIMIT 1;`;
  const result = await executeSupabaseQuery(usersQuery);
  
  console.log('Success:', result.success);
  console.log('Full result structure:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success && result.data) {
    console.log('\nFirst item structure:');
    console.log(JSON.stringify(result.data[0], null, 2));
    
    if (result.data[0] && result.data[0].content) {
      console.log('\nContent structure:');
      console.log(JSON.stringify(result.data[0].content, null, 2));
      
      if (result.data[0].content[0] && result.data[0].content[0].text) {
        console.log('\nText content:');
        console.log(result.data[0].content[0].text);
      }
    }
  }
}

debugMcpResponse().catch(console.error);