import { motion } from 'framer-motion'
import { Timer, Settings, Play, Layers } from 'lucide-react'
import { EnhancedQuestionService } from '../../services/enhancedQuestionService'

const QuizActions = ({ onQuickStart, onTimedTest, onCustomQuiz, onBlockTest }) => {
  // Get actual quiz mode configurations from our enhanced service
  const quickConfig = EnhancedQuestionService.getQuizModeConfig('quick')
  const timedConfig = EnhancedQuestionService.getQuizModeConfig('timed')

  const quickActions = [
    {
      id: 'quick-quiz',
      title: '🟣 Quick Quiz',
      subtitle: `${quickConfig.questionCount} questions (default)`,
      description: 'Quick practice, category-specific review',
      icon: Play,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: onQuickStart,
      timeEstimate: `~${Math.ceil((quickConfig.questionCount * quickConfig.timePerQuestion) / 60)} min`,
      mode: 'quick',
      status: '✅ Live',
      details: `${quickConfig.timePerQuestion}s per question • Auto-advance (0.5s delay) • Explanations after quiz completion`
    },
    {
      id: 'timed-test',
      title: '🔵 Timed Test',
      subtitle: `${timedConfig.questionCount} questions (fixed)`,
      description: 'Exam simulation, time management practice',
      icon: Timer,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: onTimedTest,
      timeEstimate: `${timedConfig.totalTime / 60} min`,
      mode: 'timed',
      status: '✅ Live',
      details: `${timedConfig.totalTime / 60} min total • Manual advance (click Next) • Explanations after each answer`
    },
    {
      id: 'custom-quiz',
      title: '🟢 Custom Quiz',
      subtitle: '1-40 questions (user choice)',
      description: 'Targeted study, flexible practice',
      icon: Settings,
      color: 'bg-green-600 hover:bg-green-700',
      action: onCustomQuiz,
      timeEstimate: 'Variable',
      mode: 'custom',
      status: '🚧 Coming Soon',
      details: '1 min/question or self-paced • Manual advance • Explanations after each answer'
    },
    {
      id: 'block-test',
      title: '🟡 Block Test',
      subtitle: '20-50 per block × 2-8 blocks',
      description: 'Full exam simulation',
      icon: Layers,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      action: onBlockTest,
      timeEstimate: '2-6 hours',
      mode: 'block',
      status: '🚧 Coming Soon',
      details: '1 min/question + 5 min bonus/block • Manual advance within blocks • Explanations after full test only'
    }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Modes</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Choose your practice style
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            disabled={action.status.includes('Coming Soon')}
            className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-left group relative ${
              action.status.includes('Coming Soon') ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {/* Status badge */}
            <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-white/20 rounded-full">
              {action.status}
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <action.icon className="w-6 h-6" />
              </div>
              <div className="text-xs opacity-80">
                {action.timeEstimate}
              </div>
            </div>

            <h3 className="text-lg font-bold mb-1">{action.title}</h3>
            <p className="text-sm opacity-90 mb-2">{action.subtitle}</p>
            <p className="text-xs opacity-75 mb-3">{action.description}</p>

            {/* Quiz mode specifications */}
            <div className="text-xs opacity-75 mb-2">
              {action.details}
            </div>

            {!action.status.includes('Coming Soon') && (
              <div className="flex items-center text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Start now</span>
                <Play className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </motion.button>
        ))}
      </div>


    </div>
  )
}

export default QuizActions 