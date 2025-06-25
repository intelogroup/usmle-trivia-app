import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useUserActivity } from '../hooks/useUserActivity'
import { Lightbulb, Award, Calendar } from 'lucide-react'
import { Target, Clock, BookOpen, Brain, Trophy, TrendingUp, Play } from 'lucide-react'

// Import new components
import WelcomeCard from '../components/dashboard/WelcomeCard'
import StatsSection from '../components/dashboard/StatsSection'
import ActionsSection from '../components/dashboard/ActionsSection'

const Home = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { loading, isNewUser, userStats, recentActivity } = useUserActivity()

  const studyTips = [
    "Review your incorrect answers immediately after each quiz to reinforce learning.",
    "Focus on understanding concepts rather than memorizing isolated facts.",
    "Practice with timed quizzes to simulate real exam conditions.",
    "Take breaks every 45-60 minutes to maintain peak concentration.",
    "Study high-yield topics that frequently appear on the USMLE Step 1.",
    "Use spaced repetition to review previously learned material.",
    "Form study groups to discuss difficult concepts with peers."
  ]

  // Define enhanced stats data based on user state
  const getStatsData = () => {
    if (isNewUser) {
      return [
        { 
          icon: Target, 
          value: '0%', 
          label: 'Accuracy', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-700', 
          iconColor: 'text-red-500',
          trend: { value: 0, direction: 'neutral', period: 'week' },
          goal: { current: 0, target: 75, unit: '%' },
          subtitle: 'No data yet',
          detailed: 'Complete your first quiz to track accuracy'
        },
        { 
          icon: Clock, 
          value: '0h', 
          label: 'Study Time', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-700', 
          iconColor: 'text-blue-500',
          trend: { value: 0, direction: 'neutral', period: 'week' },
          goal: { current: 0, target: 2, unit: 'hrs/day' },
          subtitle: 'Ready to start',
          detailed: 'Recommended: 2 hours daily study time'
        },
        { 
          icon: TrendingUp, 
          value: '0', 
          label: 'Streak', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-100 dark:bg-gray-700', 
          iconColor: 'text-purple-500',
          trend: { value: 0, direction: 'neutral', period: 'all time' },
          goal: { current: 0, target: 7, unit: 'days' },
          subtitle: 'Build momentum',
          detailed: 'Start your first study streak today'
        }
      ]
    } else {
      const accuracyTrend = userStats.accuracy > 70 ? 'up' : userStats.accuracy > 50 ? 'neutral' : 'down'
      const streakTrend = userStats.currentStreak > userStats.longestStreak - 3 ? 'up' : 'neutral'
      
      return [
        { 
          icon: Target, 
          value: `${Math.round(userStats.accuracy)}%`, 
          label: 'Accuracy', 
          color: 'text-green-600 dark:text-green-400', 
          bgColor: 'bg-green-100 dark:bg-green-900/30', 
          iconColor: 'text-green-600',
          trend: { value: 8, direction: accuracyTrend, period: 'this week' },
          goal: { current: Math.round(userStats.accuracy), target: 85, unit: '%' },
          subtitle: accuracyTrend === 'up' ? '+8% this week' : 'Room for improvement',
          detailed: `${userStats.totalQuestions} questions answered, ${Math.round(userStats.accuracy * userStats.totalQuestions / 100)} correct`
        },
        { 
          icon: Clock, 
          value: `${userStats.studyTime}h`, 
          label: 'Study Time', 
          color: 'text-blue-600 dark:text-blue-400', 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
          iconColor: 'text-blue-600',
          trend: { value: 3.5, direction: 'up', period: 'this week' },
          goal: { current: userStats.studyTime, target: 50, unit: 'hours' },
          subtitle: '+3.5h this week',
          detailed: `${Math.round(userStats.studyTime / 7 * 10) / 10}h daily average, ${50 - userStats.studyTime}h to goal`
        },
        { 
          icon: TrendingUp, 
          value: `${userStats.currentStreak}`, 
          label: 'Day Streak', 
          color: 'text-purple-600 dark:text-purple-400', 
          bgColor: 'bg-purple-100 dark:bg-purple-900/30', 
          iconColor: 'text-purple-600',
          trend: { value: userStats.currentStreak - Math.max(0, userStats.longestStreak - 5), direction: streakTrend, period: 'personal best' },
          goal: { current: userStats.currentStreak, target: Math.max(30, userStats.longestStreak + 5), unit: 'days' },
          subtitle: userStats.currentStreak >= userStats.longestStreak ? 'Personal best!' : `Best: ${userStats.longestStreak} days`,
          detailed: `${userStats.currentStreak >= 7 ? '🔥' : ''} ${userStats.currentStreak >= userStats.longestStreak ? 'New record!' : `${Math.max(30, userStats.longestStreak + 5) - userStats.currentStreak} days to goal`}`
        }
      ]
    }
  }

  // Define enhanced quick actions based on user state
  const getQuickActions = () => {
    if (isNewUser) {
      return [
        {
          icon: Play,
          title: 'Start Your First Quiz',
          subtitle: 'Take 10 practice questions',
          color: 'bg-purple-600',
          iconColor: 'text-purple-600',
          action: () => navigate('/categories'),
          timeEstimate: '~15 min',
          difficulty: 'Beginner',
          description: 'Get familiar with the format and start building confidence',
          progress: 0,
          recommended: true
        },
        {
          icon: BookOpen,
          title: 'Learn the Basics',
          subtitle: 'Start with study materials',
          color: 'bg-blue-600',
          iconColor: 'text-green-600',
          action: () => navigate('/learn'),
          timeEstimate: '~30 min',
          difficulty: 'Easy',
          description: 'Review fundamental concepts and terminology',
          progress: 0,
          recommended: true
        },
        {
          icon: Trophy,
          title: 'Set Goals',
          subtitle: 'Plan your study schedule',
          color: 'bg-orange-600',
          iconColor: 'text-orange-600',
          action: () => navigate('/profile'),
          timeEstimate: '~5 min',
          difficulty: 'Easy',
          description: 'Set daily targets and study preferences',
          progress: 0,
          recommended: false
        }
      ]
    } else {
      const recommendedAction = userStats.accuracy < 70 ? 'study' : 'practice'
      
      return [
        {
          icon: Play,
          title: 'Quick Practice',
          subtitle: '10 random questions',
          color: 'bg-purple-600',
          iconColor: 'text-purple-600',
          action: () => navigate('/quiz', { state: { categoryId: 'mixed', categoryName: 'Mixed Practice', questionCount: 10 } }),
          timeEstimate: '~12 min',
          difficulty: 'Mixed',
          description: 'Maintain momentum with focused practice',
          progress: Math.round((userStats.totalQuestions % 50) / 50 * 100),
          recommended: recommendedAction === 'practice',
          lastUsed: '2 hours ago'
        },
        {
          icon: BookOpen,
          title: 'Continue Learning',
          subtitle: 'Resume where you left off',
          color: 'bg-blue-600',
          iconColor: 'text-green-600',
          action: () => navigate('/learn'),
          timeEstimate: '~25 min',
          difficulty: 'Medium',
          description: 'Strengthen weak areas with targeted study',
          progress: Math.round(userStats.studyTime % 10 / 10 * 100),
          recommended: recommendedAction === 'study',
          lastUsed: '1 day ago'
        },
        {
          icon: Trophy,
          title: 'Challenge Mode',
          subtitle: '20 advanced questions',
          color: 'bg-red-600',
          iconColor: 'text-red-600',
          action: () => navigate('/quiz', { state: { categoryId: 'advanced', categoryName: 'Challenge Mode', questionCount: 20 } }),
          timeEstimate: '~25 min',
          difficulty: 'Hard',
          description: 'Test your knowledge with difficult scenarios',
          progress: 0,
          recommended: userStats.accuracy > 80,
          lastUsed: userStats.accuracy > 75 ? '3 days ago' : null
        }
      ]
    }
  }

  // Welcome message based on user state
  const getWelcomeMessage = () => {
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student'
    if (isNewUser) {
      return {
        title: `Hello, ${firstName}!`,
        subtitle: 'Ready to start your USMLE journey?',
        emoji: '👋'
      }
    } else {
      return {
        title: `Welcome back, ${firstName}!`,
        subtitle: 'Let\'s continue your preparation',
        emoji: '🎯'
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 overflow-x-hidden">
        <div className="px-3 md:px-6 lg:px-8 pt-2 pb-3 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl">
                  <div className="h-12 md:h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const welcomeMessage = getWelcomeMessage()
  const statsData = getStatsData()
  const quickActions = getQuickActions()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 overflow-x-hidden">
      {/* Welcome Section */}
      <div className="px-2 sm:px-3 md:px-6 lg:px-8 pt-2 pb-2 sm:pb-3 md:pt-4 md:pb-6 lg:pt-6 lg:pb-8">
        <WelcomeCard welcomeMessage={welcomeMessage} isNewUser={isNewUser} />
      </div>

      {/* Stats Section */}
      <div className="px-2 sm:px-3 md:px-6 lg:px-8 mb-3 sm:mb-4 md:mb-8 lg:mb-10">
        <StatsSection statsData={statsData} />
      </div>

      {/* Quick Actions */}
      <div className="px-2 sm:px-3 md:px-6 lg:px-8 mb-3 sm:mb-4 md:mb-8 lg:mb-10">
        <ActionsSection quickActions={quickActions} />
      </div>

      {/* Study Section */}
      <div className="px-2 sm:px-3 md:px-6 lg:px-8 mb-3 sm:mb-4 md:mb-8 lg:mb-10 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
        {/* Study Tip */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-8 lg:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-6">
            <Lightbulb size={20} className="text-yellow-500 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Study Tip</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-lg lg:text-xl leading-relaxed">
            {studyTips[Math.floor(Math.random() * studyTips.length)]}
          </p>
        </div>

        {/* Recent Activity or Achievements (for returning users) */}
        {!isNewUser && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3 sm:p-4 md:p-8 lg:p-10 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-6">
              <Award size={20} className="text-purple-600 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Recent Achievement</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 dark:text-purple-300 text-sm md:text-lg lg:text-xl font-medium">
                  {userStats.currentStreak >= 7 ? '🔥 Weekly Streak!' : 
                   userStats.accuracy > 80 ? '🎯 High Accuracy!' : 
                   userStats.totalQuestions > 100 ? '💯 Century Club!' : 
                   '⭐ Making Progress!'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base lg:text-lg">
                  {userStats.currentStreak >= 7 ? 'Studied 7 days in a row' : 
                   userStats.accuracy > 80 ? `${Math.round(userStats.accuracy)}% accuracy maintained` : 
                   userStats.totalQuestions > 100 ? 'Completed 100+ questions' : 
                   'Keep up the good work!'}
                </p>
              </div>
              <div className="text-3xl md:text-5xl lg:text-6xl">
                {userStats.currentStreak >= 7 ? '🔥' : 
                 userStats.accuracy > 80 ? '🎯' : 
                 userStats.totalQuestions > 100 ? '💯' : '⭐'}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Goals Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-8 lg:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-6 lg:mb-8">
            <Calendar size={20} className="text-blue-500 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">This Week</h3>
          </div>
          <div className="space-y-3 md:space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">Questions answered</span>
              <span className="text-sm md:text-lg lg:text-xl font-medium text-gray-800 dark:text-gray-200">
                {isNewUser ? '0/50' : `${Math.min(50, userStats.totalQuestions % 50 + 35)}/50`}
              </span>
            </div>
            <div className="w-full h-2 md:h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: isNewUser ? '0%' : `${Math.min(100, (userStats.totalQuestions % 50 + 35) / 50 * 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">Study sessions</span>
              <span className="text-sm md:text-lg lg:text-xl font-medium text-gray-800 dark:text-gray-200">
                {isNewUser ? '0/5' : `${Math.min(5, Math.round(userStats.studyTime / 2))}/5`}
              </span>
            </div>
            <div className="w-full h-2 md:h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: isNewUser ? '0%' : `${Math.min(100, Math.round(userStats.studyTime / 2) / 5 * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home