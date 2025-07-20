#!/usr/bin/env node

/**
 * Test script for leaderboard interactions
 * Tests user registration, quiz completion, and leaderboard updates
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('Service Key:', supabaseServiceKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data for users
const testUsers = [
  {
    email: 'alice@medical.edu',
    password: 'testpass123',
    display_name: 'Alice Johnson',
    full_name: 'Alice Marie Johnson',
    grade_id: 2
  },
  {
    email: 'bob@medical.edu', 
    password: 'testpass123',
    display_name: 'Bob Smith',
    full_name: 'Robert James Smith',
    grade_id: 3
  },
  {
    email: 'carol@medical.edu',
    password: 'testpass123',
    display_name: 'Carol Davis',
    full_name: 'Carol Ann Davis',
    grade_id: 1
  }
];

async function createTestUser(userData) {
  try {
    console.log(`Creating test user: ${userData.email}`);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      console.error(`Failed to create auth user ${userData.email}:`, authError);
      return null;
    }

    console.log(`Auth user created: ${authData.user.id}`);

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        display_name: userData.display_name,
        full_name: userData.full_name,
        grade_id: userData.grade_id,
        total_points: 0,
        current_streak: 0,
        best_streak: 0,
        onboarding_completed: true,
        email_verified: true
      })
      .select()
      .single();

    if (profileError) {
      console.error(`Failed to create profile for ${userData.email}:`, profileError);
      return null;
    }

    console.log(`Profile created for: ${userData.display_name}`);
    return { user: authData.user, profile };
    
  } catch (error) {
    console.error(`Error creating test user ${userData.email}:`, error);
    return null;
  }
}

async function simulateQuizSession(userId, sessionData) {
  try {
    console.log(`Creating quiz session for user: ${userId}`);
    
    // Create quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        session_type: 'quick_quiz',
        quiz_type: 'mixed',
        total_questions: sessionData.totalQuestions,
        correct_answers: sessionData.correctAnswers,
        score: sessionData.score,
        time_spent_seconds: sessionData.timeSpent,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        settings: { mode: 'test' }
      })
      .select()
      .single();

    if (sessionError) {
      console.error(`Failed to create quiz session:`, sessionError);
      return null;
    }

    console.log(`Quiz session created: ${session.id}, Score: ${sessionData.score}`);
    return session;
    
  } catch (error) {
    console.error(`Error creating quiz session:`, error);
    return null;
  }
}

async function updateUserStats(userId) {
  try {
    console.log(`Updating stats for user: ${userId}`);
    
    // This would normally be done by the statsService, but let's simulate it
    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (!sessions || sessions.length === 0) {
      console.log('No completed sessions found');
      return;
    }

    const stats = {
      user_id: userId,
      total_quizzes_completed: sessions.length,
      total_questions_answered: sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0),
      total_correct_answers: sessions.reduce((sum, s) => sum + (s.correct_answers || 0), 0),
      total_points_earned: sessions.reduce((sum, s) => sum + (s.score || 0), 0),
      total_time_spent_seconds: sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0),
      last_quiz_date: sessions[sessions.length - 1]?.completed_at
    };

    stats.overall_accuracy = stats.total_questions_answered > 0 
      ? Math.round((stats.total_correct_answers / stats.total_questions_answered) * 100) 
      : 0;

    stats.average_quiz_score = sessions.length > 0 
      ? Math.round(stats.total_points_earned / sessions.length) 
      : 0;

    stats.best_quiz_score = sessions.length > 0 
      ? Math.max(...sessions.map(s => s.score || 0)) 
      : 0;

    // Simple streak calculation
    stats.current_streak = sessions.length;
    stats.longest_streak = sessions.length;

    // Insert or update user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .upsert(stats, { onConflict: 'user_id' });

    if (statsError) {
      console.error('Failed to update user stats:', statsError);
      return;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        total_points: stats.total_points_earned,
        current_streak: stats.current_streak,
        best_streak: stats.longest_streak,
        last_active_at: stats.last_quiz_date
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Failed to update profile:', profileError);
    }

    console.log(`Stats updated - Total Points: ${stats.total_points_earned}, Accuracy: ${stats.overall_accuracy}%`);
    
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

async function checkLeaderboard() {
  try {
    console.log('\n=== LEADERBOARD ===');
    
    const { data: leaderboard, error } = await supabase
      .from('profiles')
      .select(`
        display_name,
        total_points,
        current_streak,
        user_stats (
          total_quizzes_completed,
          total_questions_answered,
          overall_accuracy
        )
      `)
      .not('display_name', 'is', null)
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Failed to fetch leaderboard:', error);
      return;
    }

    if (!leaderboard || leaderboard.length === 0) {
      console.log('No users found on leaderboard');
      return;
    }

    leaderboard.forEach((user, index) => {
      const stats = user.user_stats?.[0] || {};
      console.log(`${index + 1}. ${user.display_name}`);
      console.log(`   Points: ${user.total_points}`);
      console.log(`   Quizzes: ${stats.total_quizzes_completed || 0}`);
      console.log(`   Questions: ${stats.total_questions_answered || 0}`);
      console.log(`   Accuracy: ${stats.overall_accuracy || 0}%`);
      console.log(`   Streak: ${user.current_streak} days`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking leaderboard:', error);
  }
}

async function runTest() {
  console.log('🧪 Starting leaderboard interaction test...\n');

  try {
    // Create test users
    const createdUsers = [];
    for (const userData of testUsers) {
      const result = await createTestUser(userData);
      if (result) {
        createdUsers.push(result);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between users
    }

    console.log(`\n✅ Created ${createdUsers.length} test users\n`);

    // Simulate quiz sessions for each user
    const quizScenarios = [
      { totalQuestions: 10, correctAnswers: 8, score: 800, timeSpent: 300 }, // Alice
      { totalQuestions: 15, correctAnswers: 12, score: 1200, timeSpent: 450 }, // Bob  
      { totalQuestions: 20, correctAnswers: 15, score: 1500, timeSpent: 600 }, // Carol
    ];

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const scenario = quizScenarios[i];
      
      // Create multiple quiz sessions to test different scores
      for (let j = 0; j < 2; j++) {
        await simulateQuizSession(user.user.id, {
          ...scenario,
          score: scenario.score + (j * 100) // Vary the scores slightly
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Update user stats
      await updateUserStats(user.user.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ Simulated quiz sessions completed\n');

    // Check final leaderboard
    await checkLeaderboard();

    console.log('🎉 Test completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Visit the app at http://localhost:5173');
    console.log('2. Register a new user or login with test users');
    console.log('3. Take quizzes and see real-time leaderboard updates');
    console.log('\nTest user credentials:');
    testUsers.forEach(user => {
      console.log(`   ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runTest().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});