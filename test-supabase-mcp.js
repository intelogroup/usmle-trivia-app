// Test script to verify Supabase MCP server setup
const { spawn } = require('child_process');

console.log('Testing Supabase MCP Server Configuration...\n');

// Set up environment
const env = {
  ...process.env,
  SUPABASE_ACCESS_TOKEN: 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5'
};

// Spawn the MCP server process
const mcp = spawn('npx', [
  '-y',
  '@supabase/mcp-server-supabase@latest',
  '--read-only'
], {
  env: env,
  shell: true
});

// Handle stdout
mcp.stdout.on('data', (data) => {
  console.log(`MCP Server Output: ${data}`);
});

// Handle stderr
mcp.stderr.on('data', (data) => {
  console.error(`MCP Server Error: ${data}`);
});

// Handle process exit
mcp.on('close', (code) => {
  console.log(`MCP Server process exited with code ${code}`);
});

// Send a test message after a short delay
setTimeout(() => {
  console.log('\nSending test initialization message...');
  const initMessage = JSON.stringify({
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '0.1.0',
      capabilities: {}
    },
    id: 1
  }) + '\n';
  
  mcp.stdin.write(initMessage);
}, 2000);

// Keep the process running for 10 seconds
setTimeout(() => {
  console.log('\nTest complete. Terminating MCP server...');
  mcp.kill();
  process.exit(0);
}, 10000);
