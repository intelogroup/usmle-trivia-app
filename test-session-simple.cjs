#!/usr/bin/env node

/**
 * Simple test using the existing database test functions
 */

const { spawn } = require('child_process');

console.log('🚀 Testing Quiz Session Creation via Browser Context\n');

// Create a simple HTML test page that can run the session creation test
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Quiz Session Test</title>
    <script type="module">
        import { runAllDatabaseTests, testQuizSessionCreation } from './src/utils/databaseTestFunctions.js';
        
        async function runTest() {
            const output = document.getElementById('output');
            
            function log(message) {
                output.innerHTML += message + '\\n';
                console.log(message);
            }
            
            log('🚀 Starting Quiz Session Creation Test');
            log('');
            
            try {
                // Test with known user IDs
                const testUserIds = [
                    'ae428e9d-4700-42da-b0d1-37fba5e28c94', // jimkalinov@gmail.com
                    '02998230-6a6e-48b4-9549-5f7fbfbd4c83'  // test@usmletrivia.com
                ];
                
                for (const userId of testUserIds) {
                    log(\`Testing with user ID: \${userId}\`);
                    
                    const result = await testQuizSessionCreation(userId, 'mixed');
                    
                    if (result.success) {
                        log('✅ Quiz session creation successful!');
                        log(\`   Session details: \${JSON.stringify(result.data, null, 2)}\`);
                    } else {
                        log(\`❌ Quiz session creation failed: \${result.error}\`);
                    }
                    log('');
                }
                
                // Run comprehensive database tests
                log('🔍 Running comprehensive database tests...');
                const dbResults = await runAllDatabaseTests(testUserIds[0]);
                
                log('📊 Database test results:');
                for (const [test, result] of Object.entries(dbResults)) {
                    if (result.success) {
                        log(\`✅ \${test}: \${result.message || 'Success'}\`);
                    } else if (result.skipped) {
                        log(\`⏭️  \${test}: Skipped\`);
                    } else {
                        log(\`❌ \${test}: \${result.error}\`);
                    }
                }
                
                log('');
                log('🎉 Test completed!');
                
            } catch (error) {
                log(\`💥 Test failed: \${error.message}\`);
                log(\`Stack: \${error.stack}\`);
            }
        }
        
        // Run test when page loads
        window.addEventListener('load', runTest);
    </script>
    <style>
        body { font-family: monospace; padding: 20px; }
        #output { 
            white-space: pre-line; 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 5px;
            max-height: 80vh;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <h1>Quiz Session Creation Test</h1>
    <div id="output">Loading...</div>
</body>
</html>
`;

// Write the test HTML file
const fs = require('fs');
fs.writeFileSync('/root/repo/test-session-browser.html', testHtml);

console.log('📝 Created test-session-browser.html');
console.log('');
console.log('💡 To run the test:');
console.log('   1. Start the development server: npm run dev');
console.log('   2. Open http://localhost:5173/test-session-browser.html in your browser');
console.log('   3. Check the browser console and the page output for test results');
console.log('');
console.log('📋 This test will:');
console.log('   ✓ Test quiz session creation with known user IDs');
console.log('   ✓ Run comprehensive database connectivity tests');
console.log('   ✓ Show whether the session creation logic works');
console.log('   ✓ Help isolate if the issue is authentication or session creation');
console.log('');

// Also create a simple Node.js summary based on our findings
console.log('📊 Based on our investigation so far:');
console.log('');
console.log('✅ Database connectivity: Working (MCP tests successful)');
console.log('✅ User accounts exist: jimkalinov@gmail.com and test@usmletrivia.com');
console.log('✅ quiz_sessions table: Accessible');
console.log('❓ Authentication flow: Needs browser testing');
console.log('❓ Session creation: Needs testing with authenticated user');
console.log('');
console.log('🔍 Next steps:');
console.log('   1. Run the browser test to check session creation');
console.log('   2. If session creation works, the issue is likely frontend auth');
console.log('   3. If session creation fails, check database permissions');
console.log('   4. Test the actual authentication flow in the app');
console.log('');
console.log('🎯 Most likely issues:');
console.log('   • User context not properly initialized in React app');
console.log('   • Authentication state timing issues');
console.log('   • Environment variables not loaded correctly');
console.log('   • RLS policies preventing session creation');
console.log('');

console.log('✨ Test setup complete! Run the browser test to continue.');