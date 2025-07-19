# Quiz Sessions Table Analysis Report

## Table Schema

Based on the MCP query results, here is the complete structure of the `quiz_sessions` table:

### Column Structure

| Column Name | Data Type | Nullable | Default Value | Notes |
|------------|-----------|----------|---------------|--------|
| `id` | uuid | NO | `uuid_generate_v4()` | Primary key |
| `user_id` | uuid | **NO** | null | **NOT NULL constraint** |
| `quiz_type` | text | YES | `'practice'::character varying` | |
| `total_questions` | integer | NO | 0 | |
| `correct_answers` | integer | YES | 0 | |
| `time_spent_seconds` | integer | YES | 0 | |
| `completed_at` | timestamp with time zone | YES | null | |
| `settings` | jsonb | YES | `'{}'::jsonb` | |
| `created_at` | timestamp with time zone | YES | `now()` | |
| `category_name` | text | YES | null | |
| `time_per_question` | integer | YES | null | |
| `total_time_limit` | integer | YES | null | |
| `auto_advance` | boolean | YES | false | |
| `show_explanations` | boolean | YES | false | |
| `session_type` | text | YES | null | |
| `paused_at` | timestamp with time zone | YES | null | |
| `status` | text | YES | `'incomplete'::text` | |
| `category_id` | uuid | YES | null | |
| `difficulty` | text | YES | null | |
| `score` | integer | YES | 0 | |
| `duration_minutes` | integer | YES | 0 | |
| `questions_served` | jsonb | YES | null | |
| `temporary_answers` | jsonb | YES | null | |
| `commit_to_history` | boolean | YES | false | |
| `updated_at` | timestamp with time zone | YES | `now()` | |
| `time_spent` | integer | YES | 0 | |
| `questions_count` | integer | YES | 0 | |
| `accuracy` | numeric | YES | `0.00` | |
| `started_at` | timestamp with time zone | YES | null | |

## Key Constraints and Issues

### 1. User ID Column Analysis
- **Data Type**: `uuid`
- **NOT NULL**: Yes - This is a **strict constraint**
- **Foreign Key**: Yes - References `auth.users(id)` with CASCADE options
- **Critical**: Any attempt to insert a record without a valid `user_id` will fail

### 2. Table Constraints Found
From the query results, the following constraints exist:
- **Primary Key**: `quiz_sessions_pkey` on `id` column
- **Foreign Key**: `quiz_sessions_user_id_fkey` on `user_id` → `auth.users(id)`
  - `ON DELETE CASCADE`
  - `ON UPDATE CASCADE`

### 3. Row Level Security (RLS)
- **RLS Enabled**: `true` 
- **Impact**: All queries are subject to RLS policies
- **Policies**: Multiple policies exist (from the query results) that control access based on user authentication

### 4. Sample Data Analysis
From the 3 sample records retrieved:

```json
[
  {
    "id": "97658016-7e94-4ef4-823e-8622d9f745f4",
    "user_id": "af4e2125-8175-4082-91d7-c0ed2fe22b65", // Valid UUID
    "quiz_type": "practice",
    "total_questions": 10,
    "status": "incomplete",
    "session_type": "quick",
    "created_at": "2025-07-13 20:01:11.805775+00"
  },
  // ... 2 more similar records
]
```

All sample records have valid `user_id` values and consistent structure.

## Potential Issues for Session Creation

### 1. **Authentication Required**
- Sessions require a valid authenticated user
- `user_id` must reference an existing user in `auth.users`

### 2. **RLS Policy Enforcement**
- Insert operations are subject to RLS policies
- User must have appropriate permissions to create sessions

### 3. **Foreign Key Constraint**
- `user_id` must exist in the `auth.users` table
- Invalid or non-existent user IDs will cause insert failures

### 4. **Data Redundancy**
The table has some potentially redundant columns:
- Both `time_spent_seconds` and `time_spent` (both integers)
- Both `total_questions` and `questions_count`
- Settings stored in both individual columns and `settings` JSONB

## Recommendations for Troubleshooting Session Creation

1. **Verify User Authentication**
   ```sql
   SELECT id, email FROM auth.users WHERE id = '<user_id>';
   ```

2. **Check RLS Policies**
   ```sql
   SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'quiz_sessions';
   ```

3. **Test Insert with Minimal Data**
   ```sql
   INSERT INTO quiz_sessions (user_id, total_questions) 
   VALUES ('<valid_user_id>', 10);
   ```

4. **Monitor for Constraint Violations**
   - Ensure `user_id` is not null
   - Ensure `user_id` exists in `auth.users`
   - Verify user has insert permissions via RLS

## Table Statistics
- **RLS Status**: Enabled (`rowsecurity: true`)
- **Records Found**: At least 3 existing sessions
- **Date Range**: Sessions from 2025-07-13 to 2025-07-15
- **Common Pattern**: Most sessions appear to be "quick" practice sessions with 10 questions

## Next Steps for Debugging
1. Check the specific error messages when session creation fails
2. Verify the user authentication state before attempting inserts
3. Review RLS policies to ensure they allow the intended operations
4. Consider using the service role key for admin operations if needed