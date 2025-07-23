import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bkuowoowlmwranfoliea.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_bZkq0HoXxYxAHoaU3mDk0Q_iWsw7zCC';

console.log('🔍 Connecting to Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function getDatabaseSchema() {
  try {
    console.log('\n🔍 Getting database schema...');
    
    // Get list of tables from information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.log('❌ Could not get tables from information_schema, trying direct table queries...');
      console.log('Error:', tablesError);
      
      // Try to query specific tables we know might exist
      const knownTables = ['questions', 'profiles', 'quiz_sessions', 'quiz_responses', 'user_stats'];
      
      for (const tableName of knownTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(`✅ Table '${tableName}' exists and accessible`);
            if (data && data.length > 0) {
              console.log(`   Sample data keys:`, Object.keys(data[0]));
            }
          } else {
            console.log(`❌ Table '${tableName}' - Error:`, error.message);
          }
        } catch (err) {
          console.log(`❌ Table '${tableName}' - Exception:`, err.message);
        }
      }
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name));
    }
    
    // Test authentication status
    console.log('\n🔍 Checking authentication...');
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth status:', user ? 'Authenticated' : 'Not authenticated');
      if (user) {
        console.log('   User ID:', user.id);
      }
    }
    
    // Test RLS policies by trying to query tables
    console.log('\n🔍 Testing Row Level Security (RLS)...');
    
    const testTables = ['questions', 'profiles', 'quiz_sessions'];
    
    for (const table of testTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ RLS Test - ${table}:`, error.message);
          if (error.message.includes('401') || error.message.includes('permission')) {
            console.log(`   → This indicates RLS is enabled and requires authentication`);
          }
        } else {
          console.log(`✅ RLS Test - ${table}: Accessible (${data.length} records)`);
        }
      } catch (err) {
        console.log(`❌ RLS Test - ${table} Exception:`, err.message);
      }
    }
    
    // Test specific queries that the app uses
    console.log('\n🔍 Testing app-specific queries...');
    
    // Test the exact query from supabase.js testConnection
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('❌ App query test (questions.id):', error.message);
      } else {
        console.log('✅ App query test (questions.id): Success', data);
      }
    } catch (err) {
      console.log('❌ App query test exception:', err.message);
    }
    
  } catch (error) {
    console.error('💥 Database schema check failed:', error);
  }
}

// Run the test
getDatabaseSchema().then(() => {
  console.log('\n🎉 Database analysis complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Analysis failed:', error);
  process.exit(1);
});