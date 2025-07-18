-- =====================================================
-- USMLE Trivia App: Missing RPC Functions Migration
-- =====================================================
-- This script creates the 5 missing RPC functions required by the application
-- Run this script in your Supabase SQL Editor or via psql

-- 1. get_unseen_questions
-- Purpose: Get questions that a user hasn't seen before
-- Used by: useQuestionQueries.js, questionFetchService.js
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
    difficulty TEXT,
    points INTEGER,
    category_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question_text, q.options, q.correct_option_id, 
           q.explanation, q.difficulty, q.points, q.category_id
    FROM questions q
    LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = p_user_id
    WHERE q.is_active = true
    AND (p_category_id IS NULL OR q.category_id = p_category_id)
    AND uqh.question_id IS NULL
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. record_question_interaction
-- Purpose: Record user interaction with questions and update statistics
-- Used by: responseService.js
CREATE OR REPLACE FUNCTION record_question_interaction(
    p_user_id UUID,
    p_question_id UUID,
    p_is_correct BOOLEAN
) RETURNS void AS $$
BEGIN
    -- Insert or update user question history
    INSERT INTO user_question_history (user_id, question_id, times_seen, times_correct, last_seen_at)
    VALUES (p_user_id, p_question_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, NOW())
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
        times_seen = user_question_history.times_seen + 1,
        times_correct = user_question_history.times_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        last_seen_at = NOW();
    
    -- Update question usage statistics
    UPDATE questions 
    SET usage_count = usage_count + 1,
        correct_count = correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END
    WHERE id = p_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. get_user_stats
-- Purpose: Get comprehensive user statistics for profile and analytics
-- Used by: useUserQueries.js, StatsManager.js, useUserActivity.js
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE(
    total_sessions INTEGER,
    total_questions INTEGER,
    total_correct INTEGER,
    average_score DECIMAL,
    total_time_seconds INTEGER,
    current_streak INTEGER,
    best_streak INTEGER,
    total_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT qs.id)::INTEGER as total_sessions,
        COALESCE(SUM(qs.total_questions), 0)::INTEGER as total_questions,
        COALESCE(SUM(qs.correct_answers), 0)::INTEGER as total_correct,
        CASE 
            WHEN COUNT(DISTINCT qs.id) = 0 THEN 0::DECIMAL
            ELSE COALESCE(AVG(qs.score), 0)::DECIMAL
        END as average_score,
        COALESCE(SUM(
            CASE 
                WHEN qs.total_time_seconds IS NOT NULL THEN qs.total_time_seconds
                ELSE 0
            END
        ), 0)::INTEGER as total_time_seconds,
        COALESCE(p.current_streak, 0)::INTEGER as current_streak,
        COALESCE(p.best_streak, 0)::INTEGER as best_streak,
        COALESCE(p.total_points, 0)::INTEGER as total_points
    FROM profiles p
    LEFT JOIN quiz_sessions qs ON p.id::TEXT = qs.user_id AND qs.completed_at IS NOT NULL
    WHERE p.id = p_user_id
    GROUP BY p.current_streak, p.best_streak, p.total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. get_questions_by_category
-- Purpose: Get questions filtered by category for quiz modes
-- Used by: useQuestionQueries.js
CREATE OR REPLACE FUNCTION get_questions_by_category(
    p_category_id UUID,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE(
    id UUID,
    question_text TEXT,
    options JSONB,
    correct_option_id TEXT,
    explanation TEXT,
    difficulty TEXT,
    points INTEGER,
    category_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.question_text, q.options, q.correct_option_id, 
           q.explanation, q.difficulty, q.points, q.category_id
    FROM questions q
    WHERE q.is_active = true
    AND q.category_id = p_category_id
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. get_learning_recommendations
-- Purpose: Generate personalized learning recommendations based on user performance
-- Used by: LearningManager.js
CREATE OR REPLACE FUNCTION get_learning_recommendations(p_user_id UUID)
RETURNS TABLE(
    tag_name TEXT,
    difficulty_level TEXT,
    success_rate DECIMAL,
    question_count INTEGER,
    recommendation_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name as tag_name,
        q.difficulty as difficulty_level,
        CASE 
            WHEN COUNT(qr.id) = 0 THEN 0.0::DECIMAL
            ELSE (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(qr.id))
        END as success_rate,
        COUNT(qr.id)::INTEGER as question_count,
        CASE 
            WHEN COUNT(qr.id) = 0 THEN 'new_topic'
            WHEN (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(qr.id)) < 0.6 THEN 'needs_review'
            ELSE 'continue_practice'
        END as recommendation_type
    FROM tags t
    JOIN question_tags qt ON t.id = qt.tag_id
    JOIN questions q ON qt.question_id = q.id
    LEFT JOIN quiz_responses qr ON q.id = qr.question_id
    LEFT JOIN quiz_sessions qs ON qr.session_id = qs.id AND qs.user_id = p_user_id::TEXT
    WHERE t.is_active = true
    GROUP BY t.name, q.difficulty
    HAVING COUNT(qt.question_id) > 0  -- Only include tags that have questions
    ORDER BY 
        CASE 
            WHEN COUNT(qr.id) = 0 THEN 1  -- New topics first
            WHEN (SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(qr.id)) < 0.6 THEN 2  -- Review topics second
            ELSE 3  -- Continue practice topics last
        END,
        success_rate ASC,
        question_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Additional Helper Functions
-- =====================================================

-- 6. get_questions_by_tags
-- Purpose: Get questions filtered by multiple tags (for Custom Quiz)
-- Used by: Custom Quiz advanced mode
CREATE OR REPLACE FUNCTION get_questions_by_tags(
    p_tag_ids UUID[],
    p_limit INTEGER DEFAULT 10,
    p_user_id UUID DEFAULT NULL
) RETURNS TABLE(
    id UUID,
    question_text TEXT,
    options JSONB,
    correct_option_id TEXT,
    explanation TEXT,
    difficulty TEXT,
    points INTEGER,
    category_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT q.id, q.question_text, q.options, q.correct_option_id, 
           q.explanation, q.difficulty, q.points, q.category_id
    FROM questions q
    JOIN question_tags qt ON q.id = qt.question_id
    LEFT JOIN user_question_history uqh ON q.id = uqh.question_id AND uqh.user_id = p_user_id
    WHERE q.is_active = true
    AND qt.tag_id = ANY(p_tag_ids)
    AND (p_user_id IS NULL OR uqh.question_id IS NULL)  -- Exclude seen questions if user specified
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. update_quiz_session
-- Purpose: Update quiz session with completion data
-- Used by: Quiz completion flow
CREATE OR REPLACE FUNCTION update_quiz_session(
    p_session_id UUID,
    p_total_questions INTEGER,
    p_correct_answers INTEGER,
    p_total_time_seconds INTEGER DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_score DECIMAL;
    v_user_id TEXT;
    v_points INTEGER;
BEGIN
    -- Calculate score
    v_score := CASE 
        WHEN p_total_questions = 0 THEN 0
        ELSE (p_correct_answers::DECIMAL / p_total_questions) * 100
    END;
    
    -- Calculate points (2 points per correct answer)
    v_points := p_correct_answers * 2;
    
    -- Update quiz session
    UPDATE quiz_sessions 
    SET 
        total_questions = p_total_questions,
        correct_answers = p_correct_answers,
        score = v_score,
        completed_at = NOW(),
        total_time_seconds = p_total_time_seconds
    WHERE id = p_session_id
    RETURNING user_id INTO v_user_id;
    
    -- Update user profile points
    UPDATE profiles 
    SET 
        total_points = total_points + v_points,
        last_active_at = NOW()
    WHERE id = v_user_id::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on tables if not already enabled
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_question_history
CREATE POLICY "Users can view their own question history" ON user_question_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question history" ON user_question_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question history" ON user_question_history
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
    FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- RLS Policies for quiz_responses
CREATE POLICY "Users can view their own quiz responses" ON quiz_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quiz_sessions 
            WHERE quiz_sessions.id = quiz_responses.session_id 
            AND quiz_sessions.user_id = auth.uid()::TEXT
        )
    );

CREATE POLICY "Users can insert their own quiz responses" ON quiz_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM quiz_sessions 
            WHERE quiz_sessions.id = quiz_responses.session_id 
            AND quiz_sessions.user_id = auth.uid()::TEXT
        )
    );

-- =====================================================
-- Performance Indexes
-- =====================================================

-- Indexes for better performance (only create if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_question_history_user_id ON user_question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_question_id ON user_question_history(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_last_seen ON user_question_history(last_seen_at);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_completed_at ON quiz_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_session_type ON quiz_sessions(session_type);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_session_id ON quiz_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_id ON quiz_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_is_correct ON quiz_responses(is_correct);

CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON question_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Test the functions after creation
-- SELECT * FROM get_unseen_questions('ae428e9d-4700-42da-b0d1-37fba5e28c94'::UUID, NULL, 5);
-- SELECT * FROM get_user_stats('ae428e9d-4700-42da-b0d1-37fba5e28c94'::UUID);
-- SELECT * FROM get_questions_by_category('6a419be0-0478-452a-ae6e-5e7cc4f472ee'::UUID, 5);
-- SELECT * FROM get_learning_recommendations('ae428e9d-4700-42da-b0d1-37fba5e28c94'::UUID);

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: All RPC functions have been created successfully!';
    RAISE NOTICE 'You can now test the USMLE Trivia application with full functionality.';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test question fetching in the application';
    RAISE NOTICE '2. Complete a quiz session to verify data recording';
    RAISE NOTICE '3. Check user statistics and recommendations';
END $$;