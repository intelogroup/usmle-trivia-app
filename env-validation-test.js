// Comprehensive Environment Variables and MCP Validation Test
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 USMLE Trivia App - Environment & MCP Validation Test');
console.log('=' .repeat(60));

// Test 1: Check if .env file exists
console.log('\n📁 1. Environment File Check:');
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file not found');
}

if (fs.existsSync(envExamplePath)) {
  console.log('✅ env.example file exists');
  
  // Read env.example to see expected variables
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  console.log('\n📋 Expected Environment Variables from env.example:');
  const envLines = envExample.split('\n').filter(line => 
    line.trim() && !line.startsWith('#') && line.includes('=')
  );
  
  envLines.forEach(line => {
    const [key] = line.split('=');
    console.log(`   - ${key}`);
  });
} else {
  console.log('❌ env.example file not found');
}

// Test 2: Test Vite dev server environment loading
console.log('\n🚀 2. Testing Vite Environment Loading:');
console.log('Starting Vite dev server to check environment variables...');

const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

let viteOutput = '';
let environmentVariablesDetected = {
  VITE_SUPABASE_URL: false,
  VITE_SUPABASE_ANON_KEY: false,
  database_connection: false
};

viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  viteOutput += output;
  
  // Check for environment variable indicators
  if (output.includes('VITE_SUPABASE_URL')) {
    environmentVariablesDetected.VITE_SUPABASE_URL = true;
  }
  if (output.includes('VITE_SUPABASE_ANON_KEY') || output.includes('Key present: true')) {
    environmentVariablesDetected.VITE_SUPABASE_ANON_KEY = true;
  }
  if (output.includes('Database ready!') || output.includes('Connection test successful')) {
    environmentVariablesDetected.database_connection = true;
  }
});

viteProcess.stderr.on('data', (data) => {
  viteOutput += data.toString();
});

// Test 3: MCP Server Test
console.log('\n🔌 3. Testing MCP Server Connectivity:');

const testMCPServer = () => {
  return new Promise((resolve) => {
    const env = {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5'
    };

    const mcpProcess = spawn('npx', [
      '-y',
      '@supabase/mcp-server-supabase@latest',
      '--help'
    ], {
      env: env,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let mcpOutput = '';
    let mcpError = '';

    mcpProcess.stdout.on('data', (data) => {
      mcpOutput += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      mcpError += data.toString();
    });

    mcpProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        output: mcpOutput,
        error: mcpError,
        exitCode: code
      });
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      mcpProcess.kill();
      resolve({
        success: false,
        output: mcpOutput,
        error: 'Timeout after 10 seconds',
        exitCode: -1
      });
    }, 10000);
  });
};

// Run MCP test
testMCPServer().then(mcpResult => {
  console.log(`MCP Server Test Result: ${mcpResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (mcpResult.output) {
    console.log('MCP Output:', mcpResult.output.substring(0, 200) + '...');
  }
  if (mcpResult.error && !mcpResult.success) {
    console.log('MCP Error:', mcpResult.error.substring(0, 200) + '...');
  }
  console.log('MCP Exit Code:', mcpResult.exitCode);
});

// Wait for Vite to start and then analyze results
setTimeout(() => {
  console.log('\n📊 4. Environment Variables Analysis:');
  
  Object.entries(environmentVariablesDetected).forEach(([key, detected]) => {
    console.log(`${detected ? '✅' : '❌'} ${key}: ${detected ? 'DETECTED' : 'NOT DETECTED'}`);
  });

  console.log('\n🔍 5. Vite Server Output Analysis:');
  if (viteOutput.includes('Local:')) {
    console.log('✅ Vite server started successfully');
  } else {
    console.log('❌ Vite server may not have started properly');
  }

  if (viteOutput.includes('Database ready!')) {
    console.log('✅ Database connection established');
  } else if (viteOutput.includes('Connection test successful')) {
    console.log('✅ Database connection test passed');
  } else {
    console.log('❌ Database connection issues detected');
  }

  // Test 4: MCP Settings File Check
  console.log('\n⚙️  6. MCP Configuration Check:');
  const mcpSettingsPath = path.join(
    process.env.APPDATA || process.env.HOME,
    'BLACKBOXAI/User/globalStorage/blackboxapp.blackboxagent/settings/blackbox_mcp_settings.json'
  );
  
  try {
    if (fs.existsSync(mcpSettingsPath)) {
      const mcpSettings = JSON.parse(fs.readFileSync(mcpSettingsPath, 'utf8'));
      console.log('✅ MCP settings file found');
      console.log('📋 Configured MCP Servers:');
      Object.keys(mcpSettings.mcpServers || {}).forEach(serverName => {
        console.log(`   - ${serverName}`);
      });
      
      if (mcpSettings.mcpServers && mcpSettings.mcpServers['github.com/supabase-community/supabase-mcp']) {
        console.log('✅ Supabase MCP server configured');
        const supabaseConfig = mcpSettings.mcpServers['github.com/supabase-community/supabase-mcp'];
        console.log(`   Access Token: ${supabaseConfig.env?.SUPABASE_ACCESS_TOKEN ? 'PRESENT' : 'MISSING'}`);
      } else {
        console.log('❌ Supabase MCP server not configured');
      }
    } else {
      console.log('❌ MCP settings file not found');
    }
  } catch (error) {
    console.log('❌ Error reading MCP settings:', error.message);
  }

  console.log('\n🎯 7. Final Summary:');
  const criticalChecks = [
    environmentVariablesDetected.VITE_SUPABASE_URL,
    environmentVariablesDetected.VITE_SUPABASE_ANON_KEY,
    environmentVariablesDetected.database_connection
  ];
  
  const passedChecks = criticalChecks.filter(Boolean).length;
  console.log(`Critical Environment Checks: ${passedChecks}/3 passed`);
  
  if (passedChecks === 3) {
    console.log('🎉 Environment configuration is WORKING CORRECTLY!');
  } else {
    console.log('⚠️  Some environment configuration issues detected');
  }

  // Clean up
  console.log('\n🧹 Cleaning up...');
  viteProcess.kill();
  process.exit(0);
}, 8000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  if (viteProcess && !viteProcess.killed) {
    viteProcess.kill();
  }
  process.exit(0);
});
