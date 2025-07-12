// Test MCP Supabase connection
const { spawn } = require('child_process');

console.log('Testing MCP Supabase server connection...');

// Set environment variables
process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
process.env.SUPABASE_PROJECT_REF = 'bkuowoowlmwranfoliea';
process.env.SUPABASE_DB_PASSWORD = 'Goldyear23#';

// Test the MCP server command
const mcpProcess = spawn('npx', ['-y', '@supabase/mcp-server-supabase@latest'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

mcpProcess.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

mcpProcess.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

mcpProcess.on('close', (code) => {
  console.log(`MCP server process exited with code ${code}`);
});

mcpProcess.on('error', (error) => {
  console.error('Error starting MCP server:', error);
});

// Send a test message after a short delay
setTimeout(() => {
  console.log('Sending test message to MCP server...');
  const testMessage = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  }) + '\n';
  
  mcpProcess.stdin.write(testMessage);
}, 2000);

// Clean up after 10 seconds
setTimeout(() => {
  console.log('Terminating test...');
  mcpProcess.kill();
}, 10000);
