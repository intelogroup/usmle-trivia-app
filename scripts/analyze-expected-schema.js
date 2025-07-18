import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('🔍 ANALYZING EXPECTED DATABASE SCHEMA FROM APPLICATION CODE');

// Function to extract table names and operations from code
function extractDatabaseUsage(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const usage = {
    tables: new Set(),
    operations: [],
    columns: new Set(),
    relationships: new Set()
  };

  // Extract .from() calls
  const fromMatches = content.match(/\.from\(['"`](\w+)['"`]\)/g);
  if (fromMatches) {
    fromMatches.forEach(match => {
      const table = match.match(/\.from\(['"`](\w+)['"`]\)/)[1];
      usage.tables.add(table);
    });
  }

  // Extract .select() calls to understand columns
  const selectMatches = content.match(/\.select\(['"`]([^'"`]+)['"`]\)/g);
  if (selectMatches) {
    selectMatches.forEach(match => {
      const fields = match.match(/\.select\(['"`]([^'"`]+)['"`]\)/)[1];
      fields.split(',').forEach(field => {
        const cleanField = field.trim().split(' ')[0]; // Remove aliases
        if (cleanField && !cleanField.includes('*')) {
          usage.columns.add(cleanField);
        }
      });
    });
  }

  // Extract JOIN operations to understand relationships
  const joinMatches = content.match(/\.join\(['"`](\w+)['"`]/g);
  if (joinMatches) {
    joinMatches.forEach(match => {
      const joinTable = match.match(/\.join\(['"`](\w+)['"`]/)[1];
      usage.relationships.add(joinTable);
    });
  }

  // Extract RPC function calls
  const rpcMatches = content.match(/\.rpc\(['"`](\w+)['"`]/g);
  if (rpcMatches) {
    rpcMatches.forEach(match => {
      const func = match.match(/\.rpc\(['"`](\w+)['"`]/)[1];
      usage.operations.push(`RPC: ${func}`);
    });
  }

  return usage;
}

// Function to scan directory recursively
function scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  function scanRecursively(currentDir) {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanRecursively(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanRecursively(dir);
  return files;
}

// Analyze the codebase
const srcDir = './src';
const files = scanDirectory(srcDir);

console.log(`\n📊 Analyzing ${files.length} files for database usage...`);

const allUsage = {
  tables: new Set(),
  operations: [],
  columns: new Set(),
  relationships: new Set(),
  fileAnalysis: {}
};

files.forEach(file => {
  try {
    const usage = extractDatabaseUsage(file);
    
    // Merge results
    usage.tables.forEach(table => allUsage.tables.add(table));
    usage.operations.forEach(op => allUsage.operations.push(op));
    usage.columns.forEach(col => allUsage.columns.add(col));
    usage.relationships.forEach(rel => allUsage.relationships.add(rel));
    
    // Store file-specific analysis
    if (usage.tables.size > 0 || usage.operations.length > 0) {
      allUsage.fileAnalysis[file] = {
        tables: Array.from(usage.tables),
        operations: usage.operations,
        columns: Array.from(usage.columns),
        relationships: Array.from(usage.relationships)
      };
    }
  } catch (error) {
    console.log(`⚠️  Error analyzing ${file}: ${error.message}`);
  }
});

console.log('\n=== EXPECTED DATABASE SCHEMA ===');

console.log('\n📋 TABLES FOUND IN CODE:');
const sortedTables = Array.from(allUsage.tables).sort();
sortedTables.forEach(table => {
  console.log(`  - ${table}`);
});

console.log('\n🔧 DATABASE FUNCTIONS (RPC) EXPECTED:');
const rpcFunctions = allUsage.operations.filter(op => op.startsWith('RPC:')).map(op => op.substring(4));
const uniqueRpcFunctions = [...new Set(rpcFunctions)].sort();
uniqueRpcFunctions.forEach(func => {
  console.log(`  - ${func}`);
});

console.log('\n📊 COLUMNS REFERENCED:');
const sortedColumns = Array.from(allUsage.columns).sort();
sortedColumns.forEach(col => {
  console.log(`  - ${col}`);
});

console.log('\n🔗 RELATIONSHIPS INFERRED:');
const sortedRelationships = Array.from(allUsage.relationships).sort();
sortedRelationships.forEach(rel => {
  console.log(`  - ${rel}`);
});

console.log('\n📁 FILE-BY-FILE ANALYSIS:');
Object.entries(allUsage.fileAnalysis).forEach(([file, analysis]) => {
  console.log(`\n  📄 ${file}:`);
  if (analysis.tables.length > 0) {
    console.log(`    Tables: ${analysis.tables.join(', ')}`);
  }
  if (analysis.operations.length > 0) {
    console.log(`    Operations: ${analysis.operations.join(', ')}`);
  }
  if (analysis.columns.length > 0) {
    console.log(`    Columns: ${analysis.columns.slice(0, 10).join(', ')}${analysis.columns.length > 10 ? '...' : ''}`);
  }
});

// Generate expected schema structure
console.log('\n=== EXPECTED SCHEMA STRUCTURE ===');

const expectedSchema = {
  tables: {
    questions: {
      columns: ['id', 'question_text', 'options', 'correct_option_id', 'explanation', 'difficulty', 'category_id'],
      relationships: ['question_tags', 'quiz_responses', 'user_question_history']
    },
    tags: {
      columns: ['id', 'name', 'type', 'description', 'is_active'],
      relationships: ['question_tags', 'tag_question_counts']
    },
    profiles: {
      columns: ['id', 'user_id', 'full_name', 'email', 'avatar_url', 'created_at', 'updated_at'],
      relationships: ['quiz_sessions', 'user_question_history']
    },
    question_tags: {
      columns: ['question_id', 'tag_id'],
      relationships: ['questions', 'tags']
    },
    quiz_sessions: {
      columns: ['id', 'user_id', 'session_type', 'category_tag_id', 'total_questions', 'correct_answers', 'score', 'completed_at'],
      relationships: ['profiles', 'quiz_responses']
    },
    quiz_responses: {
      columns: ['id', 'session_id', 'question_id', 'selected_option_id', 'is_correct', 'time_taken'],
      relationships: ['quiz_sessions', 'questions']
    },
    user_question_history: {
      columns: ['id', 'user_id', 'question_id', 'times_seen', 'times_correct', 'last_seen_at'],
      relationships: ['profiles', 'questions']
    }
  },
  views: {
    tag_question_counts: {
      columns: ['id', 'name', 'question_count'],
      description: 'View showing question counts per tag'
    }
  },
  functions: {
    get_unseen_questions: 'Get questions not seen by user',
    record_question_interaction: 'Record user interaction with question',
    get_user_progress: 'Get user progress statistics',
    update_user_stats: 'Update user statistics',
    get_leaderboard_data: 'Get leaderboard rankings'
  }
};

console.log('\n📊 COMPREHENSIVE EXPECTED SCHEMA:');
console.log(JSON.stringify(expectedSchema, null, 2));

// Generate SQL to create expected schema
console.log('\n=== SQL TO CREATE EXPECTED SCHEMA ===');

const createTableSQL = `
-- Create tables based on application code analysis
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_tags (
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL,
    category_tag_id UUID,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id TEXT,
    is_correct BOOLEAN,
    time_taken INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_question_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    times_seen INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Create view for tag question counts
CREATE OR REPLACE VIEW tag_question_counts AS
SELECT 
    t.id,
    t.name,
    COUNT(qt.question_id) as question_count
FROM tags t
LEFT JOIN question_tags qt ON t.id = qt.tag_id
GROUP BY t.id, t.name;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON question_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_session_id ON quiz_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_id ON quiz_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_user_id ON user_question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_question_id ON user_question_history(question_id);
`;

console.log(createTableSQL);

console.log('\n✅ Expected schema analysis complete!');
console.log('\n📋 NEXT STEPS TO GET LIVE DATA:');
console.log('1. Update API keys in environment file');
console.log('2. Create/update database schema using the SQL above');
console.log('3. Run the live database analysis script');
console.log('4. Compare expected vs actual schema and identify gaps');