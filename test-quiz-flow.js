#!/usr/bin/env node

/**
 * Test script to debug the quiz flow end-to-end
 * Tests question fetching, session creation, and completion
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuestionFetching() {
  try {
    console.log('🔍 Testing question fetching...');
    
    // Test fetching mixed questions (should work)
    const { data: mixedQuestions, error: mixedError } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .limit(5);

    if (mixedError) {
      console.error('❌ Error fetching mixed questions:', mixedError.message);
      return false;
    }

    console.log(`✅ Mixed questions: Found ${mixedQuestions.length} questions`);
    if (mixedQuestions.length > 0) {
      console.log('Sample question:', {
        id: mixedQuestions[0].id,
        text: mixedQuestions[0].question_text.substring(0, 100) + '...',
        difficulty: mixedQuestions[0].difficulty,
        points: mixedQuestions[0].points
      });
    }

    // Test fetching questions by category (potential issue)
    console.log('\n🏷️ Testing category-based fetching...');
    
    // First, get some tag IDs
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, tag_type')
      .limit(5);

    if (tagsError) {
      console.error('❌ Error fetching tags:', tagsError.message);
      return false;
    }

    console.log(`Found ${tags.length} tags:`, tags.map(t => ({ name: t.name, type: t.tag_type })));

    if (tags.length > 0) {
      const testTag = tags[0];
      console.log(`\nTesting with tag: ${testTag.name} (${testTag.id})`);

      // Test the query that the questionFetchService uses
      const { data: categoryQuestions, error: categoryError } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          options,
          correct_option_id,
          explanation,
          difficulty,
          points,
          question_tags!inner(tag_id)
        `)
        .eq('is_active', true)
        .eq('question_tags.tag_id', testTag.id)
        .limit(3);

      if (categoryError) {
        console.error('❌ Error fetching category questions:', categoryError.message);
        console.error('Query details:', categoryError.details);
        console.error('Hint:', categoryError.hint);
      } else {
        console.log(`✅ Category questions: Found ${categoryQuestions.length} questions for ${testTag.name}`);
      }
    }

    return true;
  } catch (error) {
    console.error('💥 Error in question fetching test:', error);
    return false;
  }
}

async function testQuizSessionCreation() {
  try {
    console.log('\n🎯 Testing quiz session creation...');
    
    // Get a test user ID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      console.log('⚠️ No profiles found - cannot test session creation without user');
      return false;
    }

    const testUserId = profiles[0].id;
    console.log(`Using test user: ${profiles[0].display_name} (${testUserId})`);

    // Try to create a quiz session using the same data structure as the app
    const sessionData = {
      user_id: testUserId,
      session_type: 'quick',
      total_questions: 5,
      started_at: new Date().toISOString(),
      category_name: 'mixed',
      settings: {
        timePerQuestion: 60,
        autoAdvance: true,
        showExplanations: false
      }
    };

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error creating quiz session:', sessionError.message);
      console.error('Details:', sessionError.details);
      console.error('Hint:', sessionError.hint);
      console.error('Session data:', sessionData);
      return false;
    }

    console.log('✅ Quiz session created successfully:', {
      id: session.id,
      type: session.session_type,
      questions: session.total_questions,
      status: session.status
    });

    // Test completing the session
    console.log('\n🏁 Testing quiz session completion...');
    
    const completionData = {
      correct_answers: 3,
      time_spent_seconds: 180,
      score: 30,
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    const { data: completedSession, error: completionError } = await supabase
      .from('quiz_sessions')
      .update(completionData)
      .eq('id', session.id)
      .select()
      .single();

    if (completionError) {
      console.error('❌ Error completing quiz session:', completionError.message);
      return false;
    }

    console.log('✅ Quiz session completed successfully:', {
      id: completedSession.id,
      correct: completedSession.correct_answers,
      score: completedSession.score,
      status: completedSession.status
    });

    return { session: completedSession, userId: testUserId };
  } catch (error) {
    console.error('💥 Error in quiz session test:', error);
    return false;
  }
}

async function testStatsUpdate(userId, sessionId) {
  try {
    console.log('\n📊 Testing stats update...');
    
    // Check if user stats were updated
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId);

    if (statsError) {
      console.error('❌ Error fetching user stats:', statsError.message);
      return false;
    }

    console.log('User stats after completion:', userStats);

    // Check if profile was updated
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points, current_streak, last_active_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError.message);
      return false;
    }

    console.log('Profile after completion:', profile);

    if (profile.total_points > 0) {
      console.log('✅ Points were updated in profile!');
      return true;
    } else {
      console.log('⚠️ Points were not updated in profile');
      return false;
    }
  } catch (error) {
    console.error('💥 Error in stats update test:', error);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting quiz flow tests...\n');

  const questionTest = await testQuestionFetching();
  if (!questionTest) {
    console.log('❌ Question fetching failed - cannot proceed');
    return;
  }

  const sessionTest = await testQuizSessionCreation();
  if (!sessionTest) {
    console.log('❌ Session creation failed - cannot test stats');
    return;
  }

  const statsTest = await testStatsUpdate(sessionTest.userId, sessionTest.session.id);

  console.log('\n📋 Test Summary:');
  console.log(`  Question Fetching: ${questionTest ? '✅' : '❌'}`);
  console.log(`  Session Creation: ${sessionTest ? '✅' : '❌'}`);
  console.log(`  Session Completion: ${sessionTest ? '✅' : '❌'}`);
  console.log(`  Stats Update: ${statsTest ? '✅' : '❌'}`);

  if (questionTest && sessionTest && !statsTest) {
    console.log('\n🔍 Diagnosis: The quiz flow works but stats are not being updated automatically.');
    console.log('This means the leaderboard stats service is not being triggered on quiz completion.');
  } else if (questionTest && sessionTest && statsTest) {
    console.log('\n🎉 All tests passed! The quiz flow is working correctly.');
  }
}

runTests().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});