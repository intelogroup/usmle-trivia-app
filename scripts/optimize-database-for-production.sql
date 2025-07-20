-- Production Database Optimization for 500+ Concurrent Users
-- Execute these queries in your Supabase SQL editor

-- ============================================================================
-- 1. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Leaderboard queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_leaderboard 
ON profiles (total_points DESC, created_at ASC) 
WHERE display_name IS NOT NULL;

-- User session queries optimization  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sessions_user_status 
ON quiz_sessions (user_id, status, completed_at DESC);

-- Question fetching optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questions_active_difficulty 
ON questions (is_active, difficulty, created_at);

-- Question-tag join optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_question_tags_lookup 
ON question_tags (tag_id, question_id);

-- User stats queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_points 
ON user_stats (total_points_earned DESC, overall_accuracy DESC);

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_question_history_lookup 
ON user_question_history (user_id, last_seen_at DESC);

-- ============================================================================
-- 2. QUERY OPTIMIZATION VIEWS
-- ============================================================================

-- Optimized leaderboard view for high concurrency
CREATE OR REPLACE VIEW leaderboard_optimized AS
SELECT 
    p.id,
    p.display_name,
    p.total_points,
    p.current_streak,
    p.avatar_url,
    us.total_quizzes_completed,
    us.overall_accuracy,
    us.total_questions_answered,
    ROW_NUMBER() OVER (ORDER BY p.total_points DESC, p.created_at ASC) as rank
FROM profiles p
LEFT JOIN user_stats us ON p.id = us.user_id
WHERE p.display_name IS NOT NULL
ORDER BY p.total_points DESC, p.created_at ASC;

-- Quick user stats view
CREATE OR REPLACE VIEW user_stats_summary AS
SELECT 
    user_id,
    total_points_earned,
    total_quizzes_completed,
    overall_accuracy,
    best_quiz_score,
    current_streak,
    longest_streak
FROM user_stats;

-- ============================================================================
-- 3. PERFORMANCE FUNCTIONS
-- ============================================================================

-- Function to get paginated leaderboard (reduces load)
CREATE OR REPLACE FUNCTION get_leaderboard_page(
    page_size INT DEFAULT 50,
    page_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    total_points INT,
    current_streak INT,
    avatar_url TEXT,
    total_quizzes_completed INT,
    overall_accuracy INT,
    rank BIGINT
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        l.id,
        l.display_name,
        l.total_points,
        l.current_streak,
        l.avatar_url,
        l.total_quizzes_completed,
        l.overall_accuracy,
        l.rank
    FROM leaderboard_optimized l
    LIMIT page_size
    OFFSET page_offset;
$$;

-- Function to get user rank efficiently
CREATE OR REPLACE FUNCTION get_user_rank(user_uuid UUID)
RETURNS INT
LANGUAGE SQL
STABLE
AS $$
    SELECT rank::INT
    FROM leaderboard_optimized
    WHERE id = user_uuid;
$$;

-- Batch update user stats (for background processing)
CREATE OR REPLACE FUNCTION update_user_stats_batch(user_ids UUID[])
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INT := 0;
    user_id UUID;
BEGIN
    FOREACH user_id IN ARRAY user_ids
    LOOP
        -- Update user stats from quiz sessions
        INSERT INTO user_stats (
            user_id,
            total_quizzes_completed,
            total_questions_answered,
            total_correct_answers,
            total_points_earned,
            overall_accuracy,
            best_quiz_score,
            last_quiz_date
        )
        SELECT 
            user_id,
            COUNT(*) as total_quizzes,
            SUM(total_questions) as total_questions,
            SUM(correct_answers) as total_correct,
            SUM(score) as total_points,
            CASE 
                WHEN SUM(total_questions) > 0 
                THEN ROUND((SUM(correct_answers)::FLOAT / SUM(total_questions)::FLOAT) * 100)
                ELSE 0 
            END as accuracy,
            MAX(score) as best_score,
            MAX(completed_at) as last_quiz
        FROM quiz_sessions 
        WHERE quiz_sessions.user_id = user_id 
        AND status = 'completed'
        GROUP BY quiz_sessions.user_id
        ON CONFLICT (user_id) 
        DO UPDATE SET
            total_quizzes_completed = EXCLUDED.total_quizzes_completed,
            total_questions_answered = EXCLUDED.total_questions_answered,
            total_correct_answers = EXCLUDED.total_correct_answers,
            total_points_earned = EXCLUDED.total_points_earned,
            overall_accuracy = EXCLUDED.overall_accuracy,
            best_quiz_score = EXCLUDED.best_quiz_score,
            last_quiz_date = EXCLUDED.last_quiz_date,
            updated_at = NOW();
            
        -- Update profile total_points
        UPDATE profiles 
        SET total_points = (
            SELECT COALESCE(total_points_earned, 0) 
            FROM user_stats 
            WHERE user_stats.user_id = profiles.id
        )
        WHERE id = user_id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$;

-- ============================================================================
-- 4. CONNECTION OPTIMIZATION
-- ============================================================================

-- Set connection limits (adjust based on your Supabase plan)
-- These are PostgreSQL settings that may need to be set by Supabase support

-- ALTER SYSTEM SET max_connections = 200;
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET track_activity_query_size = 2048;
-- ALTER SYSTEM SET log_min_duration_statement = 1000;

-- ============================================================================
-- 5. QUERY PERFORMANCE MONITORING
-- ============================================================================

-- Enable query statistics (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View to monitor slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE calls > 100
ORDER BY mean_time DESC;

-- ============================================================================
-- 6. CLEANUP AND MAINTENANCE
-- ============================================================================

-- Function to clean up old data (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INT := 0;
BEGIN
    -- Delete old incomplete quiz sessions (older than 24 hours)
    DELETE FROM quiz_sessions 
    WHERE status = 'incomplete' 
    AND started_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Vacuum tables to reclaim space
    VACUUM ANALYZE quiz_sessions;
    VACUUM ANALYZE quiz_responses;
    VACUUM ANALYZE user_stats;
    
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- 7. RATE LIMITING TABLES
-- ============================================================================

-- Table to track API usage per user (for rate limiting)
CREATE TABLE IF NOT EXISTS user_rate_limits (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INT DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, endpoint)
);

-- Index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON user_rate_limits (user_id, endpoint, window_start);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT,
    p_max_requests INT DEFAULT 60,
    p_window_minutes INT DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    current_count INT;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get or create rate limit record
    INSERT INTO user_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, NOW())
    ON CONFLICT (user_id, endpoint)
    DO UPDATE SET
        request_count = CASE 
            WHEN user_rate_limits.window_start < window_start THEN 1
            ELSE user_rate_limits.request_count + 1
        END,
        window_start = CASE
            WHEN user_rate_limits.window_start < window_start THEN NOW()
            ELSE user_rate_limits.window_start
        END
    RETURNING request_count INTO current_count;
    
    RETURN current_count <= p_max_requests;
END;
$$;

-- ============================================================================
-- 8. PRODUCTION STATISTICS
-- ============================================================================

-- View for monitoring application health
CREATE OR REPLACE VIEW app_health_stats AS
SELECT 
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM profiles
WHERE display_name IS NOT NULL

UNION ALL

SELECT 
    'Active Sessions (24h)' as metric,
    COUNT(*)::TEXT as value
FROM quiz_sessions 
WHERE started_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'Completed Quizzes (24h)' as metric,
    COUNT(*)::TEXT as value
FROM quiz_sessions 
WHERE status = 'completed' 
AND completed_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'Average Response Time' as metric,
    COALESCE(ROUND(AVG(time_spent_seconds))::TEXT || 's', 'N/A') as value
FROM quiz_sessions 
WHERE status = 'completed'
AND completed_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value;

-- ============================================================================
-- EXECUTION NOTES
-- ============================================================================

/*
To apply these optimizations:

1. Run this script in your Supabase SQL editor
2. Monitor the slow_queries view regularly  
3. Set up periodic cleanup with: SELECT cleanup_old_data();
4. Use the optimized functions in your application
5. Monitor app_health_stats for system health

For rate limiting, integrate check_rate_limit() into your RLS policies:

Example RLS policy with rate limiting:
CREATE POLICY "quiz_sessions_rate_limited" ON quiz_sessions
FOR INSERT TO authenticated
WITH CHECK (
    check_rate_limit(auth.uid(), 'quiz_session_create', 30, 1)
    AND user_id = auth.uid()
);

Performance Tips:
- Use get_leaderboard_page() instead of fetching all leaderboard data
- Monitor slow_queries view weekly
- Run cleanup_old_data() daily via a cron job
- Consider partitioning large tables if they exceed 1M rows
*/