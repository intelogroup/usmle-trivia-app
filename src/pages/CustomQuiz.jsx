import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Clock, Shuffle, Target } from 'lucide-react';

const CustomQuiz = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: '1-40 Questions',
      description: 'Choose exactly how many questions you want to practice'
    },
    {
      icon: Clock,
      title: 'Flexible Timing',
      description: '1 minute per question or completely self-paced'
    },
    {
      icon: Shuffle,
      title: 'Custom Categories',
      description: 'Select specific topics and difficulty levels'
    },
    {
      icon: Settings,
      title: 'Your Rules',
      description: 'Manual advance with explanations after each answer'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20">
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
                🟢 Custom Quiz
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Targeted study, flexible practice
              </p>
            </div>
          </div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <Settings className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🚧 Coming Soon
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              We're building the ultimate customizable quiz experience. Soon you'll be able to 
              configure every aspect of your practice session to match your study needs.
            </p>

            <div className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg">
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
                  <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
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

          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-green-50 dark:bg-green-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Planned Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Questions:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">1-40 (user choice)</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Time:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">1 min/question or self-paced</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Advance:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">Manual</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Explanations:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">After each answer</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Categories:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">Custom selection</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Difficulty:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">Custom selection</span>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Want to try other quiz modes while we finish this one?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/quick-quiz')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🟣 Try Quick Quiz
              </button>
              <button
                onClick={() => navigate('/timed-test')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔵 Try Timed Test
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomQuiz;