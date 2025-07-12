import {
  testTagsTableMcp,
  testQuestionsTableMcp,
  testProfilesTableMcp,
  testTagQuestionCountsViewMcp,
  testQuestionFetchingMcp
} from './src/lib/supabaseMcpClient.js';

async function runThoroughTests() {
  console.log('Starting thorough MCP Supabase tests...\n');

  const tests = [
    { name: 'Tags Table', fn: testTagsTableMcp },
    { name: 'Questions Table', fn: testQuestionsTableMcp },
    { name: 'Profiles Table', fn: testProfilesTableMcp },
    { name: 'Tag Question Counts View', fn: testTagQuestionCountsViewMcp },
    { name: 'Mixed Question Fetching', fn: () => testQuestionFetchingMcp('mixed', 2) }
  ];

  for (const test of tests) {
    console.log(`Running test: ${test.name}`);
    try {
      const result = await test.fn();
      if (result.success) {
        console.log(`✅ ${test.name} test passed`);
        console.log('Sample data:', result.data);
      } else {
        console.error(`❌ ${test.name} test failed:`, result.error);
      }
    } catch (error) {
      console.error(`❌ ${test.name} test threw an error:`, error);
    }
    console.log('-----------------------------\n');
  }

  console.log('Thorough MCP Supabase tests completed.');
}

runThoroughTests();
