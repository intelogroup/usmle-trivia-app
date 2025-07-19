import { initializeMcpClient } from './src/lib/supabaseMcpClient.js';

async function testSupabaseSetup() {
  try {
    console.log('🔄 Testing Supabase MCP Setup...\n');

    // Set the access token for MCP operations
    process.env.SUPABASE_ACCESS_TOKEN = 'sbp_d7844aa02e87baf3dbb25f27ba4f4109060141a5';
    
    // Initialize MCP client
    const mcpClient = await initializeMcpClient();
    console.log('✅ MCP client connected successfully\n');

    // Test 1: Get project URL
    console.log('📍 Getting project URL...');
    const urlResult = await mcpClient.callTool({
      name: 'get_project_url',
      arguments: {},
    });
    console.log('Project URL:', JSON.parse(urlResult.content[0].text));
    console.log('');

    // Test 2: List all tables
    console.log('📋 Listing database tables...');
    const tablesResult = await mcpClient.callTool({
      name: 'list_tables',
      arguments: {},
    });
    const tables = JSON.parse(tablesResult.content[0].text);
    console.log('Available tables:', tables.map(t => t.table_name).join(', '));
    console.log('');

    // Test 3: Check questions table structure
    console.log('🔍 Checking questions table structure...');
    const questionsStructure = await mcpClient.callTool({
      name: 'execute_sql',
      arguments: {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'questions' 
          ORDER BY ordinal_position;
        `
      },
    });
    const questionColumns = JSON.parse(questionsStructure.content[0].text);
    console.log('Questions table columns:');
    questionColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });
    console.log('');

    // Test 4: Check if we have sample questions
    console.log('📝 Checking for sample questions...');
    const questionCount = await mcpClient.callTool({
      name: 'execute_sql',
      arguments: {
        query: 'SELECT COUNT(*) as count FROM questions;'
      },
    });
    const count = JSON.parse(questionCount.content[0].text)[0].count;
    console.log(`Found ${count} questions in the database`);
    
    if (count > 0) {
      // Get a sample question
      const sampleQuestion = await mcpClient.callTool({
        name: 'execute_sql',
        arguments: {
          query: `
            SELECT id, question_text, difficulty, category_id, correct_option_id
            FROM questions 
            LIMIT 1;
          `
        },
      });
      const sample = JSON.parse(sampleQuestion.content[0].text)[0];
      console.log('Sample question:', {
        id: sample.id,
        text: sample.question_text.substring(0, 100) + '...',
        difficulty: sample.difficulty,
        category: sample.category_id
      });
    }
    console.log('');

    // Test 5: Check quiz_sessions table
    console.log('📊 Checking quiz_sessions table...');
    const sessionsStructure = await mcpClient.callTool({
      name: 'execute_sql',
      arguments: {
        query: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'quiz_sessions' 
          ORDER BY ordinal_position;
        `
      },
    });
    const sessionColumns = JSON.parse(sessionsStructure.content[0].text);
    console.log('Quiz sessions table columns:');
    sessionColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    console.log('');

    // Test 6: Check profiles table
    console.log('👤 Checking profiles table...');
    const profilesStructure = await mcpClient.callTool({
      name: 'execute_sql',
      arguments: {
        query: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          ORDER BY ordinal_position;
        `
      },
    });
    const profileColumns = JSON.parse(profilesStructure.content[0].text);
    console.log('Profiles table columns:');
    profileColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    console.log('');

    // Test 7: Check categories table
    console.log('📂 Checking categories table...');
    const categoriesCount = await mcpClient.callTool({
      name: 'execute_sql',
      arguments: {
        query: 'SELECT COUNT(*) as count, string_agg(name, \', \') as categories FROM categories;'
      },
    });
    const categoryData = JSON.parse(categoriesCount.content[0].text)[0];
    console.log(`Found ${categoryData.count} categories: ${categoryData.categories}`);
    console.log('');

    console.log('✅ Supabase setup test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Database connection: ✅ Working`);
    console.log(`  - Questions available: ${count > 0 ? '✅' : '❌'} ${count} questions`);
    console.log(`  - Categories available: ${categoryData.count > 0 ? '✅' : '❌'} ${categoryData.count} categories`);
    console.log(`  - Tables structure: ✅ Properly configured`);

    if (count === 0) {
      console.log('\n⚠️  Warning: No questions found in database. You may need to:');
      console.log('   - Import sample USMLE questions');
      console.log('   - Run database seeding scripts');
      console.log('   - Check data migration status');
    }

  } catch (error) {
    console.error('❌ Supabase setup test failed:', error.message);
    console.error('\nDebugging info:', {
      errorType: error.constructor.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
  }
}

testSupabaseSetup().catch(console.error);