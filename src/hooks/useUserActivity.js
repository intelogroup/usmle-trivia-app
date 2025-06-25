import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useUserActivity = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(true)
  const [userStats, setUserStats] = useState({
    totalQuestions: 0,
    accuracy: 0,
    studyTime: 0,
    currentStreak: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Security: Only check current user's quiz history
        const { data: quizHistory, error: historyError } = await supabase
          .from('user_question_history')
          .select('*')
          .eq('user_id', user.id) // Explicit user filtering
          .limit(1)

        if (historyError) throw historyError

        const hasActivity = quizHistory && quizHistory.length > 0
        setIsNewUser(!hasActivity)

        if (hasActivity) {
          // Fetch user stats if they have activity
          const [statsResult, activityResult] = await Promise.all([
            fetchUserStats(),
            fetchRecentActivity()
          ])

          if (statsResult) setUserStats(statsResult)
          if (activityResult) setRecentActivity(activityResult)
        }
      } catch (error) {
        console.error('Error fetching user activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserActivity()
  }, [user])

  const fetchUserStats = async () => {
    if (!user) return null;

    try {
      // Use secure RPC function that verifies user access
      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: user.id })

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      if (data && data.length > 0) {
        const stats = data[0]
        return {
          totalQuestions: stats.total_questions_attempted || 0,
          accuracy: stats.accuracy_percentage || 0,
          studyTime: Math.round((stats.total_questions_attempted * 2) / 60 * 10) / 10 || 0, // Rough estimation
          currentStreak: 0 // Would need streak calculation
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
    return null
  }

  const fetchRecentActivity = async () => {
    if (!user) return [];

    try {
      // Security: Only fetch current user's quiz sessions with explicit filtering
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          quiz_responses (
            questions (
              question_tags (
                tags (name)
              )
            )
          )
        `)
        .eq('user_id', user.id) // Explicit user filtering for security
        .not('completed_at', 'is', null) // Only completed sessions
        .order('completed_at', { ascending: false })
        .limit(4)

      if (error) throw error

      const activities = data?.map(session => {
        // Get the most common category from this session
        const categories = session.quiz_responses
          ?.flatMap(response => 
            response.questions?.question_tags?.map(qt => qt.tags.name) || []
          ) || []
        
        const category = categories[0] || 'General'
        const score = `${session.correct_answers || 0}/${session.total_questions || 0}`
        const timeAgo = getTimeAgo(session.completed_at)

        return {
          category,
          score,
          time: timeAgo,
          color: getCategoryColor(category)
        }
      }) || []

      return activities
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
    return []
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Cardiology': 'text-red-500',
      'Neurology': 'text-purple-500',
      'Pharmacology': 'text-green-500',
      'Anatomy': 'text-blue-500',
      'Pathology': 'text-orange-500',
      'Biochemistry': 'text-teal-500',
      'Physiology': 'text-indigo-500',
      'General': 'text-gray-500'
    }
    return colors[category] || 'text-gray-500'
  }

  // Security check - only return data if user is authenticated
  if (!user) {
    return {
      loading: false,
      isNewUser: true,
      userStats: {
        totalQuestions: 0,
        accuracy: 0,
        studyTime: 0,
        currentStreak: 0
      },
      recentActivity: []
    }
  }

  return {
    loading,
    isNewUser,
    userStats,
    recentActivity
  }
} 