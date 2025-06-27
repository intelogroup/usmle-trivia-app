import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Clock, Pause, BarChart3, Users } from 'lucide-react';

const BlockTest = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Layers,
      title: 'Multi-Block Format',
      description: '20-50 questions per block × 2-8 blocks for full exam simulation'
    },
    {
      icon: Clock,
      title: 'Strict Timing',
      description: '1 minute per question + 5 minute bonus per block'
    },
    {
      icon: Pause,
      title: 'Pause & Resume',
      description: '24-hour session persistence with break management'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Results',
      description: 'Explanations only after completing the full test'
    }
  ];

  const blockSizes = [
    { blocks: 2, questions: '40-100', time: '65-125 min', difficulty: 'Beginner' },
    { blocks: 4, questions: '80-200', time: '130-250 min', difficulty: 'Intermediate' },
    { blocks: 6, questions: '120-300', time: '195-375 min', difficulty: 'Advanced' },
    { blocks: 8, questions: '160-400', time: '260-500 min', difficulty: 'Full Exam' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-yellow-900/20 dark:to-amber-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🟡 Block Test
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Full exam simulation
              </p>
            </div>
          </div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
              <Layers className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🚧 Coming Soon
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Experience the most realistic USMLE exam simulation with our comprehensive 
              block test format. Practice under real exam conditions with timed blocks and breaks.
            </p>

            <div className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg">
              <span className="font-semibold">Status: In Development</span>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <feature.icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Block Size Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Planned Block Configurations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {blockSizes.map((config, index) => (
                <div
                  key={config.blocks}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {config.blocks} Blocks
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <div>{config.questions} questions</div>
                      <div>{config.time}</div>
                      <div className="font-semibold">{config.difficulty}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Planned Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Questions:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">20-50 per block × 2-8 blocks</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Time:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">1 min/question + 5 min bonus/block</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Advance:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">Manual within blocks</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Explanations:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">After full test only</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pause/Resume:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">✅ 24-hour persistence</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Categories:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">Mixed</span>
              </div>
            </div>
          </motion.div>

          {/* User Experience Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Planned User Experience Flow
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span className="flex-1 text-center">1. Start test</span>
              <span className="px-2">→</span>
              <span className="flex-1 text-center">2. Complete block</span>
              <span className="px-2">→</span>
              <span className="flex-1 text-center">3. Break (optional)</span>
              <span className="px-2">→</span>
              <span className="flex-1 text-center">4. Next block</span>
              <span className="px-2">→</span>
              <span className="flex-1 text-center">5. Complete all</span>
              <span className="px-2">→</span>
              <span className="flex-1 text-center">6. See results</span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ready to practice? Try our available quiz modes:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/quick-quiz')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🟣 Quick Quiz
              </button>
              <button
                onClick={() => navigate('/timed-test')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔵 Timed Test
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlockTest; 