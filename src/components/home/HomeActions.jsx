import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Timer, BookOpen, BarChart3, Settings, Layers } from 'lucide-react'

const HomeActions = ({ isNewUser, onNavigate }) => {
  const navigate = useNavigate()

  // Define enhanced quick actions based on user state
  const getQuickActions = () => {
    if (isNewUser) {
      return [
        {
          icon: Zap,
          title: '🟣 Quick Quiz',
          subtitle: '10 questions (default)',
          color: 'bg-purple-600',
          iconColor: 'text-purple-600',
          action: () => navigate('/quick-quiz'),
          timeEstimate: '~10 min',
          difficulty: 'Beginner',
          description: 'Quick practice, category-specific review',
          progress: 0,
          recommended: true
        },
        {
          icon: Timer,
          title: '🔵 Timed Test',
          subtitle: '20 questions (fixed)',
          color: 'bg-blue-600',
          iconColor: 'text-blue-600',
          action: () => navigate('/timed-test-setup'),
          timeEstimate: '30 min',
          difficulty: 'Mixed',
          description: 'Exam simulation, time management practice',
          progress: 0,
          recommended: false
        },
        {
          icon: BookOpen,
          title: 'Learn',
          subtitle: 'Study materials & concepts',
          color: 'bg-green-600',
          iconColor: 'text-green-600',
          action: () => navigate('/learn'),
          timeEstimate: 'Self-paced',
          difficulty: 'All levels',
          description: 'Review core concepts and explanations',
          progress: 0,
          recommended: true
        },
        {
          icon: BarChart3,
          title: 'My Stats',
          subtitle: 'View your progress',
          color: 'bg-orange-600',
          iconColor: 'text-orange-600',
          action: () => navigate('/profile'),
          timeEstimate: '~2 min',
          difficulty: null,
          description: 'Track your performance and achievements',
          progress: 0,
          recommended: false
        },
        {
          icon: Settings,
          title: '🟢 Custom Quiz',
          subtitle: '1-40 questions (user choice)',
          color: 'bg-green-600',
          iconColor: 'text-green-600',
          action: () => navigate('/custom-quiz'),
          timeEstimate: 'Variable',
          difficulty: 'Custom',
          description: 'Targeted study, flexible practice',
          progress: 0,
          recommended: false,
          disabled: true
        },
        {
          icon: Layers,
          title: '🟡 Block Test',
          subtitle: '20-50 per block × 2-8 blocks',
          color: 'bg-yellow-600',
          iconColor: 'text-yellow-600',
          action: () => navigate('/block-test'),
          timeEstimate: '2-6 hours',
          difficulty: 'Full Exam',
          description: 'Full exam simulation',
          progress: 0,
          recommended: false,
          disabled: true
        }
      ]
    } else {
      return [
        {
          icon: Zap,
          title: '🟣 Quick Quiz',
          subtitle: '10 questions (default)',
          color: 'bg-purple-600',
          iconColor: 'text-purple-600',
          action: () => navigate('/quick-quiz'),
          timeEstimate: '~10 min',
          difficulty: 'Mixed',
          description: 'Quick practice, category-specific review',
          progress: 75,
          recommended: true
        },
        {
          icon: Timer,
          title: '🔵 Timed Test',
          subtitle: '20 questions (fixed)',
          color: 'bg-blue-600',
          iconColor: 'text-blue-600',
          action: () => navigate('/timed-test-setup'),
          timeEstimate: '30 min',
          difficulty: 'Progressive',
          description: 'Exam simulation, time management practice',
          progress: 60,
          recommended: true
        },
        {
          icon: BookOpen,
          title: 'Learn',
          subtitle: 'Study materials & concepts',
          color: 'bg-green-600',
          iconColor: 'text-green-600',
          action: () => navigate('/learn'),
          timeEstimate: 'Self-paced',
          difficulty: 'Adaptive',
          description: 'Deep dive into topics you find challenging',
          progress: 40,
          recommended: false
        },
        {
          icon: Settings,
          title: '🟢 Custom Quiz',
          subtitle: '1-40 questions (user choice)',
          color: 'bg-green-600',
          iconColor: 'text-green-600',
          action: () => navigate('/custom-quiz'),
          timeEstimate: 'Variable',
          difficulty: 'Custom',
          description: 'Targeted study, flexible practice',
          progress: 0,
          recommended: false,
          disabled: true
        },
        {
          icon: Layers,
          title: '🟡 Block Test',
          subtitle: '20-50 per block × 2-8 blocks',
          color: 'bg-yellow-600',
          iconColor: 'text-yellow-600',
          action: () => navigate('/block-test'),
          timeEstimate: '2-6 hours',
          difficulty: 'Full Exam',
          description: 'Full exam simulation',
          progress: 0,
          recommended: false,
          disabled: true
        },
        {
          icon: BarChart3,
          title: 'My Stats',
          subtitle: 'View detailed analytics',
          color: 'bg-orange-600',
          iconColor: 'text-orange-600',
          action: () => navigate('/profile'),
          timeEstimate: '~3 min',
          difficulty: null,
          description: 'Review your performance trends and insights',
          progress: 100,
          recommended: false
        }
      ]
    }
  }

  const quickActions = getQuickActions()

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/quiz')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          View All →
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 ${action.disabled ? 'opacity-60' : ''}`}
            onClick={action.action}
          >
            {action.recommended && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                ⭐ Recommended
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${action.color} bg-opacity-10`}>
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">{action.timeEstimate}</div>
                {action.difficulty && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">{action.difficulty}</div>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{action.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{action.subtitle}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{action.description}</p>
            
            {!isNewUser && action.progress !== undefined && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <motion.div
                  className={`h-2 rounded-full ${action.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${action.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default HomeActions 