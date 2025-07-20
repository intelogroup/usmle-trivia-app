#!/usr/bin/env node

/**
 * Comprehensive Quiz Functionality Test Script
 * Tests sound effects, custom quiz setup, question counts, and validation
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = join(__dirname, 'env');
let supabaseUrl, supabaseAnonKey;

try {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('Error loading environment variables:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuestionCounts() {
  console.log('\n🔍 Testing Question Counts...');
  
  try {
    // Test subjects count
    const { data: subjects, error: subjectsError } = await supabase
      .from('tags')
      .select('id, name, slug')
      .eq('type', 'subject')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (subjectsError) throw subjectsError;

    console.log(`✅ Found ${subjects.length} subjects:`);
    for (const subject of subjects.slice(0, 5)) {
      // Get question count for each subject
      const { data: questionTags, error: countError } = await supabase
        .from('question_tags')
        .select('question_id')
        .eq('tag_id', subject.id);

      if (!countError) {
        console.log(`   - ${subject.name}: ${questionTags.length} questions`);
      }
    }

    // Test systems count for first subject
    if (subjects.length > 0) {
      const { data: systems, error: systemsError } = await supabase
        .from('tags')
        .select('id, name')
        .eq('type', 'system')
        .eq('parent_id', subjects[0].id)
        .eq('is_active', true)
        .limit(3);

      if (!systemsError && systems.length > 0) {
        console.log(`✅ Found ${systems.length} systems for ${subjects[0].name}:`);
        for (const system of systems) {
          const { data: questionTags, error: countError } = await supabase
            .from('question_tags')
            .select('question_id')
            .eq('tag_id', system.id);

          if (!countError) {
            console.log(`   - ${system.name}: ${questionTags.length} questions`);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Question counts test failed:', error.message);
    return false;
  }
}

async function testQuestionFetching() {
  console.log('\n📚 Testing Question Fetching...');
  
  try {
    // Test basic question fetching
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_text, options, correct_option_id, difficulty')
      .eq('is_active', true)
      .limit(5);

    if (error) throw error;

    console.log(`✅ Found ${questions.length} sample questions:`);
    for (const q of questions) {
      console.log(`   - ID: ${q.id}, Difficulty: ${q.difficulty || 'N/A'}`);
      console.log(`     Question: ${q.question_text.substring(0, 60)}...`);
      console.log(`     Options: ${q.options?.length || 0} choices`);
    }

    // Test question filtering by difficulty
    const { data: easyQuestions, error: easyError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('difficulty', 'easy');

    if (!easyError) {
      console.log(`✅ Easy questions available: ${easyQuestions || 0}`);
    }

    const { data: mediumQuestions, error: mediumError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('difficulty', 'medium');

    if (!mediumError) {
      console.log(`✅ Medium questions available: ${mediumQuestions || 0}`);
    }

    const { data: hardQuestions, error: hardError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('difficulty', 'hard');

    if (!hardError) {
      console.log(`✅ Hard questions available: ${hardQuestions || 0}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Question fetching test failed:', error.message);
    return false;
  }
}

async function testTagHierarchy() {
  console.log('\n🏗️ Testing Tag Hierarchy...');
  
  try {
    // Test subject -> system -> topic hierarchy
    const { data: subjects, error: subjectsError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('type', 'subject')
      .eq('is_active', true)
      .limit(1);

    if (subjectsError) throw subjectsError;

    if (subjects.length > 0) {
      const subject = subjects[0];
      console.log(`✅ Testing hierarchy for subject: ${subject.name}`);

      // Get systems for this subject
      const { data: systems, error: systemsError } = await supabase
        .from('tags')
        .select('id, name')
        .eq('type', 'system')
        .eq('parent_id', subject.id)
        .eq('is_active', true)
        .limit(1);

      if (!systemsError && systems.length > 0) {
        const system = systems[0];
        console.log(`   └─ System: ${system.name}`);

        // Get topics for this system
        const { data: topics, error: topicsError } = await supabase
          .from('tags')
          .select('id, name')
          .eq('type', 'topic')
          .eq('parent_id', system.id)
          .eq('is_active', true)
          .limit(3);

        if (!topicsError && topics.length > 0) {
          console.log(`      └─ Topics: ${topics.map(t => t.name).join(', ')}`);
        }

        // Test combination question count
        const { data: combinationQuestions, error: combError } = await supabase
          .from('questions')
          .select(`
            id,
            question_tags!inner(tag_id)
          `)
          .eq('is_active', true);

        if (!combError) {
          // Filter questions that have both subject and system tags
          const questionTagMap = {};
          combinationQuestions.forEach(item => {
            if (!questionTagMap[item.id]) {
              questionTagMap[item.id] = [];
            }
            questionTagMap[item.id].push(item.question_tags.tag_id);
          });

          let combinationCount = 0;
          Object.entries(questionTagMap).forEach(([questionId, tagIds]) => {
            const hasSubject = tagIds.includes(subject.id);
            const hasSystem = tagIds.includes(system.id);
            if (hasSubject && hasSystem) {
              combinationCount++;
            }
          });

          console.log(`   └─ Questions with both tags: ${combinationCount}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Tag hierarchy test failed:', error.message);
    return false;
  }
}

async function testSoundFiles() {
  console.log('\n🔊 Testing Sound Files...');
  
  try {
    const soundFiles = [
      'src/assets/sounds/correct.mp3',
      'src/assets/sounds/wrong.wav',
      'src/assets/sounds/timesup.wav',
      'src/assets/sounds/next.ogg',
      'src/assets/sounds/completed.wav'
    ];

    let allFilesExist = true;
    
    for (const soundFile of soundFiles) {
      try {
        const fullPath = join(__dirname, soundFile);
        const stats = readFileSync(fullPath);
        console.log(`✅ ${soundFile} exists (${stats.length} bytes)`);
      } catch (error) {
        console.log(`❌ ${soundFile} missing`);
        allFilesExist = false;
      }
    }

    return allFilesExist;
  } catch (error) {
    console.error('❌ Sound files test failed:', error.message);
    return false;
  }
}

async function testUserQuestionHistory() {
  console.log('\n📖 Testing User Question History...');
  
  try {
    // Check if user_question_history table exists and has correct structure
    const { data: historyData, error: historyError } = await supabase
      .from('user_question_history')
      .select('user_id, question_id, last_seen_at')
      .limit(5);

    if (historyError) {
      console.log(`⚠️ User question history table may not exist: ${historyError.message}`);
      return false;
    }

    console.log(`✅ User question history table exists with ${historyData.length} sample records`);

    // Test RPC function for getting unseen questions
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_unseen_questions', {
      p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      p_category_id: null,
      p_difficulty: null,
      p_limit: 5
    });

    if (rpcError) {
      console.log(`⚠️ get_unseen_questions RPC may not exist: ${rpcError.message}`);
      return false;
    }

    console.log(`✅ get_unseen_questions RPC function works`);
    return true;
  } catch (error) {
    console.error('❌ User question history test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Quiz Functionality Tests...\n');

  const tests = [
    { name: 'Sound Files', fn: testSoundFiles },
    { name: 'Question Counts', fn: testQuestionCounts },
    { name: 'Question Fetching', fn: testQuestionFetching },
    { name: 'Tag Hierarchy', fn: testTagHierarchy },
    { name: 'User Question History', fn: testUserQuestionHistory }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Quiz functionality is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }

  return passedTests === totalTests;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });