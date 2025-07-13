import { BookOpen, GraduationCap, Clock, Target } from 'lucide-react';

const Learn = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Study Materials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Coming Soon - Enhanced learning materials and study guides
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Study Guides
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive study materials organized by medical subjects and USMLE topics.
            </p>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Coming in Phase 2
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Study Plans
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Personalized study schedules and progress tracking to optimize your preparation.
            </p>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Coming in Phase 2
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Analytics
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Detailed insights into your strengths and areas for improvement.
            </p>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Coming in Phase 2
            </div>
          </div>
        </div>

        {/* Current Focus Message */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Focus on Quiz Practice
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            While we're developing comprehensive study materials, make the most of our quiz features:
          </p>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>• <strong>Quick Quiz:</strong> 10 questions for rapid practice</li>
            <li>• <strong>Timed Test:</strong> 20 questions with exam simulation</li>
            <li>• <strong>Custom Quiz:</strong> Personalized practice sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Learn;