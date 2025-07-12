import { testTagsTableMcp } from './src/lib/supabaseMcpClient.js';

async function runTest() {
  console.log('Testing Supabase MCP Client...');

  const result = await testTagsTableMcp();

  if (result.success) {
    console.log('✅ Supabase MCP Client test successful');
    console.log('Sample data:', result.data);
  } else {
    console.error('❌ Supabase MCP Client test failed:', result.error);
  }
}

runTest();
