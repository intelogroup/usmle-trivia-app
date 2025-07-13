import { createClient } from '@supabase/supabase-js';

// Read from .env file manually or use hardcoded values for testing
const supabaseUrl = 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDA4NTQsImV4cCI6MjA2NTc3Njg1NH0.lNbEJRUEOl3nVtRPNqKsJu4w031DHae5bjOxZIFlSpI';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Supabase database schema and data...\n');

  try {
    // Check if tables exist by trying to query them
    console.log('📊 Checking available tables...');
    
    // Test questions table
    console.log('\n1. Questions table:');
    const { data: questions, error: questionsError, count: questionsCount } = await supabase
      .from('questions')
      .select('id, question_text, difficulty, is_active', { count: 'exact' })
      .limit(3);
    
    if (questionsError) {
      console.log('   ❌ Questions table error:', questionsError.message);
    } else {
      console.log(`   ✅ Questions table exists (${questionsCount} total records)`);
      console.log('   Sample records:', questions);
    }

    // Test tags table
    console.log('\n2. Tags table:');
    const { data: tags, error: tagsError, count: tagsCount } = await supabase
      .from('tags')
      .select('id, name, type, is_active', { count: 'exact' })
      .limit(10);
    
    if (tagsError) {
      console.log('   ❌ Tags table error:', tagsError.message);
    } else {
      console.log(`   ✅ Tags table exists (${tagsCount} total records)`);
      console.log('   Sample records:', tags);
    }

    // Test question_tags junction table
    console.log('\n3. Question_tags table:');
    const { data: questionTags, error: questionTagsError, count: questionTagsCount } = await supabase
      .from('question_tags')
      .select('question_id, tag_id', { count: 'exact' })
      .limit(5);
    
    if (questionTagsError) {
      console.log('   ❌ Question_tags table error:', questionTagsError.message);
    } else {
      console.log(`   ✅ Question_tags table exists (${questionTagsCount} total records)`);
      console.log('   Sample records:', questionTags);
    }

    // Test profiles table
    console.log('\n4. Profiles table:');
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('id, username', { count: 'exact' })
      .limit(3);
    
    if (profilesError) {
      console.log('   ❌ Profiles table error:', profilesError.message);
    } else {
      console.log(`   ✅ Profiles table exists (${profilesCount} total records)`);
      console.log('   Sample records:', profiles);
    }

    // Test quiz_sessions table
    console.log('\n5. Quiz_sessions table:');
    const { data: sessions, error: sessionsError, count: sessionsCount } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, session_type', { count: 'exact' })
      .limit(3);
    
    if (sessionsError) {
      console.log('   ❌ Quiz_sessions table error:', sessionsError.message);
    } else {
      console.log(`   ✅ Quiz_sessions table exists (${sessionsCount} total records)`);
      console.log('   Sample records:', sessions);
    }

    // Check if any questions have actual data
    if (!questionsError && questions && questions.length > 0) {
      console.log('\n📋 Sample question data:');
      const { data: fullQuestion, error: fullQuestionError } = await supabase
        .from('questions')
        .select('*')
        .limit(1)
        .single();
      
      if (!fullQuestionError && fullQuestion) {
        console.log('   Full question structure:', JSON.stringify(fullQuestion, null, 2));
      }
    }

    // Get categories/tags breakdown
    if (!tagsError && tags && tags.length > 0) {
      console.log('\n🏷️  Available tag types:');
      const tagsByType = tags.reduce((acc, tag) => {
        acc[tag.type] = (acc[tag.type] || 0) + 1;
        return acc;
      }, {});
      console.log('   Tag distribution:', tagsByType);
    }

  } catch (error) {
    console.error('💥 Database check failed:', error.message);
  }
}

checkSchema();