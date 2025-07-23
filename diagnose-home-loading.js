#!/usr/bin/env node

/**
 * Comprehensive Home Screen Loading Diagnostics
 * Simulates the exact flow that happens when the Home page loads
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Home Screen Loading Diagnostics\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the exact loading flow from Home.jsx
async function simulateHomePageLoad(userId = null) {
  console.log('🏠 Simulating Home Page Load...\n');
  
  const results = {
    authContext: null,
    userActivityQuery: null,
    homeComponents: null,
    loadingTimes: {},
    errors: []
  };
  
  try {
    // 1. Simulate AuthContext initialization
    console.log('1️⃣ Testing AuthContext Flow...');
    const authStart = Date.now();
    
    try {
      // Test session retrieval (what AuthContext does)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log(`   Session Error: ${sessionError.message}`);
        results.errors.push({ component: 'AuthContext', error: sessionError.message });
      }
      
      let authUser = null;
      let userProfile = null;
      
      if (session?.user) {
        authUser = session.user;
        console.log(`   ✅ Session found for: ${authUser.email}`);
        
        // Try to fetch profile (simulating authStateManager)
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') { // Not found is OK
            console.log(`   Profile Warning: ${profileError.message}`);
            results.errors.push({ component: 'Profile', error: profileError.message });
          } else {
            userProfile = profile;
            console.log(`   ✅ Profile loaded: ${profile?.display_name || 'No name'}`);
          }
        } catch (profileErr) {
          console.log(`   Profile Error: ${profileErr.message}`);
          results.errors.push({ component: 'Profile', error: profileErr.message });
        }
      } else {
        console.log('   ℹ️ No active session (unauthenticated)');
      }
      
      results.authContext = {
        user: authUser,
        profile: userProfile,
        loading: false
      };
      
      results.loadingTimes.auth = Date.now() - authStart;
      console.log(`   Time: ${results.loadingTimes.auth}ms\n`);
      
    } catch (authError) {
      console.log(`   ❌ Auth Context Error: ${authError.message}`);
      results.errors.push({ component: 'AuthContext', error: authError.message });
      results.loadingTimes.auth = Date.now() - authStart;
    }
    
    // 2. Simulate useUserActivityQuery (the main data fetch)
    console.log('2️⃣ Testing useUserActivityQuery Flow...');
    const queryStart = Date.now();
    
    try {
      const testUserId = userId || results.authContext?.user?.id;
      console.log(`   Testing with userId: ${testUserId || 'null (new user)'}`);
      
      let userActivityData = {
        isNewUser: true,
        userStats: {
          totalQuestions: 0,
          accuracy: 0,
          studyTime: 0,
          currentStreak: 0
        },
        recentActivity: []
      };
      
      if (testUserId) {
        // Check if user has any quiz history (exact same query as useUserActivityQuery)
        const { data: quizHistory, error: historyError } = await supabase
          .from('user_question_history')
          .select('*')
          .eq('user_id', testUserId)
          .limit(1);

        if (historyError) {
          console.log(`   ❌ Quiz History Error: ${historyError.message}`);
          results.errors.push({ component: 'QuizHistory', error: historyError.message });
          throw historyError;
        }

        console.log(`   ✅ Quiz history query: ${quizHistory.length} records`);
        const hasActivity = quizHistory && quizHistory.length > 0;
        const isNewUser = !hasActivity;
        
        userActivityData.isNewUser = isNewUser;
        console.log(`   User status: ${isNewUser ? 'New User' : 'Existing User'}`);

        if (hasActivity) {
          console.log('   📊 Fetching user stats...');
          
          // Test RPC function (can be slow/problematic)
          const rpcStart = Date.now();
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_user_stats', { p_user_id: testUserId });

          const rpcTime = Date.now() - rpcStart;
          console.log(`   RPC call took: ${rpcTime}ms`);
          
          if (rpcTime > 3000) {
            console.log(`   ⚠️ RPC call is slow (${rpcTime}ms) - this could cause loading issues`);
            results.errors.push({ component: 'RPC', error: `Slow RPC call: ${rpcTime}ms` });
          }

          if (statsError) {
            console.log(`   ⚠️ RPC Error: ${statsError.message}`);
            results.errors.push({ component: 'RPC', error: statsError.message });
          } else if (statsData && statsData.length > 0) {
            const stats = statsData[0];
            userActivityData.userStats = {
              totalQuestions: stats.total_questions_attempted || 0,
              accuracy: stats.accuracy_percentage || 0,
              studyTime: Math.round((stats.total_questions_attempted * 2) / 60 * 10) / 10 || 0,
              currentStreak: 0
            };
            console.log(`   ✅ User stats: ${userActivityData.userStats.totalQuestions} questions, ${userActivityData.userStats.accuracy}% accuracy`);
          }

          // Fetch recent activity
          console.log('   📈 Fetching recent activity...');
          const sessionsStart = Date.now();
          const { data: sessions, error: sessionsError } = await supabase
            .from('quiz_sessions')
            .select('id, session_type, total_questions, correct_answers, started_at, completed_at')
            .eq('user_id', testUserId)
            .order('started_at', { ascending: false })
            .limit(5);

          const sessionsTime = Date.now() - sessionsStart;
          console.log(`   Sessions query took: ${sessionsTime}ms`);
          
          if (sessionsTime > 2000) {
            console.log(`   ⚠️ Sessions query is slow (${sessionsTime}ms)`);
            results.errors.push({ component: 'Sessions', error: `Slow sessions query: ${sessionsTime}ms` });
          }

          if (sessionsError) {
            console.log(`   ❌ Sessions Error: ${sessionsError.message}`);
            results.errors.push({ component: 'Sessions', error: sessionsError.message });
            throw sessionsError;
          }

          userActivityData.recentActivity = sessions.map(session => ({
            id: session.id,
            type: session.session_type || 'Quiz',
            score: session.correct_answers || 0,
            total: session.total_questions || 0,
            timeAgo: 'recently',
            categories: ['General']
          }));
          
          console.log(`   ✅ Recent activity: ${sessions.length} sessions`);
        }
      }
      
      results.userActivityQuery = userActivityData;
      results.loadingTimes.userActivity = Date.now() - queryStart;
      console.log(`   Total useUserActivityQuery time: ${results.loadingTimes.userActivity}ms\n`);
      
    } catch (queryError) {
      console.log(`   ❌ UserActivity Query Error: ${queryError.message}`);
      results.errors.push({ component: 'UserActivityQuery', error: queryError.message });
      results.loadingTimes.userActivity = Date.now() - queryStart;
    }
    
    // 3. Test Home Components (parallel data fetching)
    console.log('3️⃣ Testing Home Components...');
    const componentsStart = Date.now();
    
    try {
      const componentTests = await Promise.allSettled([
        // Categories (for HomeActions)
        supabase
          .from('categories')
          .select('id, name, description, icon, is_active')
          .eq('is_active', true)
          .order('name'),
        
        // Questions count (for HomeStats)
        supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
      ]);
      
      const categoriesResult = componentTests[0];
      const questionsResult = componentTests[1];
      
      if (categoriesResult.status === 'fulfilled') {
        const categories = categoriesResult.value.data;
        console.log(`   ✅ Categories loaded: ${categories.length} categories`);
      } else {
        console.log(`   ❌ Categories failed: ${categoriesResult.reason.message}`);
        results.errors.push({ component: 'Categories', error: categoriesResult.reason.message });
      }
      
      if (questionsResult.status === 'fulfilled') {
        const questionsCount = questionsResult.value.count;
        console.log(`   ✅ Questions count: ${questionsCount} questions`);
      } else {
        console.log(`   ❌ Questions count failed: ${questionsResult.reason.message}`);
        results.errors.push({ component: 'QuestionsCount', error: questionsResult.reason.message });
      }
      
      results.homeComponents = {
        categories: categoriesResult.status === 'fulfilled',
        questionsCount: questionsResult.status === 'fulfilled'
      };
      
      results.loadingTimes.homeComponents = Date.now() - componentsStart;
      console.log(`   Home components time: ${results.loadingTimes.homeComponents}ms\n`);
      
    } catch (componentsError) {
      console.log(`   ❌ Home Components Error: ${componentsError.message}`);
      results.errors.push({ component: 'HomeComponents', error: componentsError.message });
      results.loadingTimes.homeComponents = Date.now() - componentsStart;
    }
    
  } catch (overallError) {
    console.log(`💥 Overall Error: ${overallError.message}`);
    results.errors.push({ component: 'Overall', error: overallError.message });
  }
  
  return results;
}

// Test with potential performance issues
async function testPerformanceScenarios() {
  console.log('⚡ Testing Performance Scenarios...\n');
  
  // Test with timeout scenarios
  const timeoutTests = [];
  
  // Test 1: Very slow query simulation
  console.log('🐌 Testing slow query scenario...');
  const slowQueryStart = Date.now();
  
  try {
    const slowQueryPromise = supabase
      .from('user_question_history')
      .select(`
        *,
        questions (
          id, question_text, category, difficulty,
          question_options (*)
        )
      `)
      .limit(20); // More complex query
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 8000);
    });
    
    await Promise.race([slowQueryPromise, timeoutPromise]);
    const slowQueryTime = Date.now() - slowQueryStart;
    console.log(`✅ Complex query completed in ${slowQueryTime}ms`);
    
    if (slowQueryTime > 5000) {
      console.log('⚠️ This query is very slow and could cause loading issues');
    }
    
  } catch (error) {
    const slowQueryTime = Date.now() - slowQueryStart;
    if (error.message === 'Query timeout') {
      console.log(`❌ Query timed out after ${slowQueryTime}ms - this explains loading issues!`);
    } else {
      console.log(`❌ Query failed: ${error.message} after ${slowQueryTime}ms`);
    }
  }
  
  // Test 2: Concurrent load simulation
  console.log('\n🚀 Testing concurrent load scenario...');
  const concurrentStart = Date.now();
  
  const concurrentPromises = Array(5).fill().map(async (_, i) => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .limit(10);
      return { index: i, success: true, count: data?.length || 0 };
    } catch (error) {
      return { index: i, success: false, error: error.message };
    }
  });
  
  const concurrentResults = await Promise.all(concurrentPromises);
  const concurrentTime = Date.now() - concurrentStart;
  
  const successful = concurrentResults.filter(r => r.success).length;
  console.log(`✅ Concurrent test: ${successful}/5 succeeded in ${concurrentTime}ms`);
  
  if (concurrentTime > 3000) {
    console.log('⚠️ Concurrent queries are slow - this could cause loading issues under load');
  }
}

async function runFullDiagnostics() {
  console.log('🧪 Starting Full Home Screen Diagnostics...\n');
  
  const startTime = Date.now();
  
  // Test unauthenticated flow
  console.log('═══ UNAUTHENTICATED USER TEST ═══');
  const unauthResults = await simulateHomePageLoad(null);
  
  // Test authenticated flow (if session exists)
  console.log('\n═══ AUTHENTICATED USER TEST ═══');
  const authResults = await simulateHomePageLoad();
  
  // Performance tests  
  console.log('\n═══ PERFORMANCE TESTS ═══');
  await testPerformanceScenarios();
  
  const totalTime = Date.now() - startTime;
  
  // Final analysis
  console.log('\n' + '═'.repeat(50));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(50));
  
  console.log(`\n⏱️ Total diagnostic time: ${totalTime}ms`);
  
  console.log('\n🔍 Loading Times:');
  console.log(`- Auth Context: ${unauthResults.loadingTimes.auth || 'N/A'}ms`);
  console.log(`- User Activity Query: ${unauthResults.loadingTimes.userActivity || 'N/A'}ms`);
  console.log(`- Home Components: ${unauthResults.loadingTimes.homeComponents || 'N/A'}ms`);
  
  const allErrors = [...(unauthResults.errors || []), ...(authResults.errors || [])];
  
  if (allErrors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    allErrors.forEach((error, i) => {
      console.log(`${i + 1}. ${error.component}: ${error.error}`);
    });
    
    console.log('\n🔧 LIKELY CAUSES OF LOADING ISSUES:');
    
    if (allErrors.some(e => e.error.includes('timeout') || e.error.includes('slow'))) {
      console.log('- Slow database queries causing timeouts');
      console.log('- Solution: Optimize queries, add indexes, or increase timeouts');
    }
    
    if (allErrors.some(e => e.component === 'RPC')) {
      console.log('- RPC function (get_user_stats) is slow or failing');
      console.log('- Solution: Check RPC function implementation and database performance');
    }
    
    if (allErrors.some(e => e.component === 'AuthContext')) {
      console.log('- Authentication issues preventing proper data loading');
      console.log('- Solution: Check auth configuration and session handling');
    }
    
    if (allErrors.some(e => e.component === 'UserActivityQuery')) {
      console.log('- User activity query is failing');
      console.log('- Solution: Check table permissions and query logic');
    }
    
  } else {
    console.log('\n✅ NO ERRORS FOUND');
    console.log('The loading issue might be:');
    console.log('- A React-specific problem (component state, hooks)');
    console.log('- A browser-specific issue (caching, localStorage)');
    console.log('- A network connectivity problem');
    console.log('- React Query configuration issue');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Check Network tab for failed requests');
  console.log('3. Clear browser cache and localStorage');
  console.log('4. Check React Query DevTools for query states');
  console.log('5. Verify all environment variables are correct');
  
  process.exit(allErrors.length > 0 ? 1 : 0);
}

runFullDiagnostics().catch(error => {
  console.error('\n💥 Diagnostic failed:', error);
  process.exit(1);
});