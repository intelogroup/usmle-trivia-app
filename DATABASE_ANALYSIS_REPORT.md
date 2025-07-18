# Database Analysis Report: USMLE Trivia App

## Executive Summary

The USMLE Trivia application expects a comprehensive database schema with 9 tables, 5 RPC functions, and 1 view. However, **the current database is inaccessible due to disabled API keys**, preventing live data analysis. This report provides the expected schema based on application code analysis and critical gaps that need addressing.

## Current Status: 🔴 CRITICAL

- **Database Access**: ❌ FAILED - Legacy API keys are disabled
- **Schema Validation**: ❌ UNABLE - Cannot connect to live database
- **Data Population**: ❌ UNKNOWN - Cannot assess current data state
- **Function Availability**: ❌ UNKNOWN - Cannot test RPC functions

## Expected Database Schema (From Code Analysis)

### Tables Required (9 total)

#### 1. **profiles**
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Usage**: User profile management, authentication integration
**Files**: `SecurityProvider.jsx`, `profileService.js`, `authService.js`

#### 2. **questions**
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT,
    category_id UUID,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Usage**: Core quiz questions storage
**Files**: `useQuestionQueries.js`, `questionFetchService.js`, `QuizSessionManager.js`

#### 3. **tags**
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    slug TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Usage**: Question categorization and filtering
**Files**: `useCategoryQueries.js`, `useCustomQuizSetup.js`, `supabaseSetup.js`

#### 4. **question_tags** (Junction Table)
```sql
CREATE TABLE question_tags (
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);
```
**Usage**: Many-to-many relationship between questions and tags
**Files**: `questionCountService.js`, `useCategoryQueries.js`

#### 5. **quiz_sessions**
```sql
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL,
    category_tag_id UUID,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Usage**: Quiz session tracking and progress management
**Files**: `sessionService.js`, `QuizSessionManager.js`, `useUserQueries.js`

#### 6. **quiz_responses**
```sql
CREATE TABLE quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id TEXT,
    is_correct BOOLEAN,
    time_taken INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Usage**: Individual question responses within quiz sessions
**Files**: `responseService.js`, `QuizSessionManager.js`, `StatsManager.js`

#### 7. **user_question_history**
```sql
CREATE TABLE user_question_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    times_seen INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);
```
**Usage**: Track user interaction history with specific questions
**Files**: `responseService.js`, `useUserActivity.js`, `SecurityProvider.jsx`

#### 8. **categories** (Referenced but not detailed)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Usage**: High-level question categorization
**Files**: `queryClient.js`

### Views Required (1 total)

#### 1. **tag_question_counts**
```sql
CREATE OR REPLACE VIEW tag_question_counts AS
SELECT 
    t.id,
    t.name,
    COUNT(qt.question_id) as question_count
FROM tags t
LEFT JOIN question_tags qt ON t.id = qt.tag_id
GROUP BY t.id, t.name;
```
**Usage**: Real-time question counts per tag for Custom Quiz setup
**Files**: `supabaseSetup.js`

### Database Functions Required (5 total)

#### 1. **get_unseen_questions**
```sql
CREATE OR REPLACE FUNCTION get_unseen_questions(
    p_user_id UUID,
    p_category_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE(
    id UUID,
    question_text TEXT,
    options JSONB,
    correct_option_id TEXT,
    explanation TEXT,
    difficulty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question_text, q.options, q.correct_option_id, q.explanation, q.difficulty
    FROM questions q
    LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = p_user_id
    WHERE (p_category_id IS NULL OR q.category_id = p_category_id)
    AND uqh.question_id IS NULL
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```
**Usage**: Get questions user hasn't seen before
**Files**: `useQuestionQueries.js`, `questionFetchService.js`

#### 2. **record_question_interaction**
```sql
CREATE OR REPLACE FUNCTION record_question_interaction(
    p_user_id UUID,
    p_question_id UUID,
    p_is_correct BOOLEAN
) RETURNS void AS $$
BEGIN
    INSERT INTO user_question_history (user_id, question_id, times_seen, times_correct, last_seen_at)
    VALUES (p_user_id, p_question_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, NOW())
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
        times_seen = user_question_history.times_seen + 1,
        times_correct = user_question_history.times_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        last_seen_at = NOW();
END;
$$ LANGUAGE plpgsql;
```
**Usage**: Track user interaction with questions
**Files**: `responseService.js`

#### 3. **get_user_stats**
```sql
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE(
    total_sessions INTEGER,
    total_questions INTEGER,
    total_correct INTEGER,
    average_score DECIMAL,
    total_time_seconds INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_sessions,
        SUM(qs.total_questions)::INTEGER as total_questions,
        SUM(qs.correct_answers)::INTEGER as total_correct,
        AVG(qs.score) as average_score,
        SUM(qs.total_time_seconds)::INTEGER as total_time_seconds
    FROM quiz_sessions qs
    WHERE qs.user_id = p_user_id
    AND qs.completed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
```
**Usage**: Get user statistics for profile and analytics
**Files**: `useUserQueries.js`, `StatsManager.js`, `useUserActivity.js`

#### 4. **get_questions_by_category**
```sql
CREATE OR REPLACE FUNCTION get_questions_by_category(
    p_category_id UUID,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE(
    id UUID,
    question_text TEXT,
    options JSONB,
    correct_option_id TEXT,
    explanation TEXT,
    difficulty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question_text, q.options, q.correct_option_id, q.explanation, q.difficulty
    FROM questions q
    WHERE q.category_id = p_category_id
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```
**Usage**: Get questions filtered by category
**Files**: `useQuestionQueries.js`

#### 5. **get_learning_recommendations**
```sql
CREATE OR REPLACE FUNCTION get_learning_recommendations(p_user_id UUID)
RETURNS TABLE(
    tag_name TEXT,
    difficulty_level TEXT,
    success_rate DECIMAL,
    question_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name as tag_name,
        q.difficulty as difficulty_level,
        (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) as success_rate,
        COUNT(*)::INTEGER as question_count
    FROM quiz_responses qr
    JOIN questions q ON qr.question_id = q.id
    JOIN question_tags qt ON q.id = qt.question_id
    JOIN tags t ON qt.tag_id = t.id
    JOIN quiz_sessions qs ON qr.session_id = qs.id
    WHERE qs.user_id = p_user_id
    GROUP BY t.name, q.difficulty
    HAVING COUNT(*) >= 3
    ORDER BY success_rate ASC, question_count DESC;
END;
$$ LANGUAGE plpgsql;
```
**Usage**: Generate personalized learning recommendations
**Files**: `LearningManager.js`

### Indexes Required for Performance

```sql
-- Primary performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON question_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_session_id ON quiz_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_id ON quiz_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_user_id ON user_question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_question_id ON user_question_history(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_last_seen ON user_question_history(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);
```

## Critical Issues Identified

### 1. **Database Access Crisis** 🔴
**Problem**: Legacy API keys are disabled, preventing all database operations
**Impact**: Application cannot function at all
**Solution**: 
- Generate new API keys from Supabase dashboard
- Update environment variables with working keys
- Test database connectivity

### 2. **Schema Validation Impossible** 🔴
**Problem**: Cannot verify if expected schema exists in live database
**Impact**: Unknown schema state, potential missing tables/functions
**Solution**:
- Run schema validation script once API keys are fixed
- Compare actual vs expected schema
- Create missing tables/functions as needed

### 3. **Missing Database Functions** 🔴
**Problem**: 5 critical RPC functions expected by application
**Impact**: Core functionality will fail (question fetching, user stats, etc.)
**Solution**:
- Create all 5 RPC functions using SQL provided above
- Test each function with sample data
- Update function signatures if needed

### 4. **Performance Issues** 🟡
**Problem**: Missing indexes on frequently queried columns
**Impact**: Slow query performance, especially with large datasets
**Solution**:
- Add all performance indexes listed above
- Monitor query performance
- Add additional indexes based on slow query analysis

### 5. **Data Population Unknown** 🟡
**Problem**: Cannot assess current data state
**Impact**: Unknown if sample questions, tags, categories exist
**Solution**:
- Once database is accessible, run data population analysis
- Create sample data if needed
- Validate data integrity

## Immediate Action Plan

### Phase 1: Database Access (Critical - 1 hour)
1. **Generate new Supabase API keys**
   - Go to Supabase dashboard
   - Generate new publishable and service role keys
   - Update `env` file with new keys

2. **Test database connectivity**
   - Run `node scripts/mcp-database-analysis.js`
   - Verify tables are accessible
   - Confirm RLS policies are working

### Phase 2: Schema Validation (High Priority - 2 hours)
1. **Run live schema analysis**
   - Execute comprehensive schema analysis
   - Compare with expected schema
   - Identify missing tables/columns

2. **Create missing schema elements**
   - Run SQL scripts to create missing tables
   - Create all 5 RPC functions
   - Add performance indexes

### Phase 3: Data Analysis (Medium Priority - 1 hour)
1. **Analyze existing data**
   - Check question count and quality
   - Validate tag/category structure
   - Assess user data integrity

2. **Populate missing data**
   - Create sample questions if needed
   - Set up proper tag categories
   - Test data relationships

### Phase 4: Performance Optimization (Low Priority - 1 hour)
1. **Add missing indexes**
   - Create all performance indexes
   - Monitor query performance
   - Optimize slow queries

2. **Test application functionality**
   - Run quiz flows end-to-end
   - Test all database operations
   - Verify RPC function calls

## Next Steps

1. **Fix API Keys**: Update environment with working Supabase keys
2. **Run Analysis**: Execute `node scripts/mcp-database-analysis.js`
3. **Create Schema**: Apply SQL scripts to create missing tables/functions
4. **Populate Data**: Add sample questions and categories
5. **Test Application**: Verify all quiz functionality works

## Files to Monitor

- `env` - Update with new API keys
- `scripts/mcp-database-analysis.js` - Run once keys are fixed
- `scripts/analyze-expected-schema.js` - Reference for expected schema
- Database migration files - Create as needed

## Success Criteria

- ✅ Database connection established
- ✅ All 9 expected tables exist and accessible
- ✅ All 5 RPC functions created and tested
- ✅ Performance indexes added
- ✅ Sample data populated
- ✅ Application quiz flow working end-to-end

## Risk Assessment

- **High Risk**: Database remains inaccessible - application cannot function
- **Medium Risk**: Schema mismatch - core features fail
- **Low Risk**: Performance issues - slow but functional

**Recommendation**: Prioritize database access fix immediately, then focus on schema validation and creation.