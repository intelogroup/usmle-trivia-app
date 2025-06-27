import { motion } from 'framer-motion';
import { Timer, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TimedTestResults = ({ 
  score, 
  questionCount, 
  accuracy,
  userAnswers,
  timeTaken,
  totalTimeLeft,
  difficulty,
  quizSession,
  isOffline,
  questions,
  onGoHome 
}) => {
  const navigate = useNavigate();
  const avgTimePerQuestion = Math.round(timeTaken / questionCount);

  const handleViewDetailedReview = () => {
    navigate('/results', {
      state: {
        score,
        totalQuestions: questionCount,
        questions: questions,
        quizResponses: userAnswers,
        quizType: 'timed-test',
        sessionId: quizSession?.id,
        isOffline,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Results Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4"
            >
              <Timer className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Timed Test Complete!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Time taken: {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}/{questionCount}</div>
              <div className="text-gray-600 dark:text-gray-300">Questions Correct</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">{accuracy}%</div>
              <div className="text-gray-600 dark:text-gray-300">Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
            >
              <div className="text-4xl font-bold text-green-600 mb-2">{avgTimePerQuestion}s</div>
              <div className="text-gray-600 dark:text-gray-300">Avg Time/Question</div>
            </motion.div>
          </div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Questions Answered</span>
                <span className="font-semibold text-gray-900 dark:text-white">{userAnswers.length}/{questionCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Time Remaining</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Difficulty</span>
                <span className="font-semibold text-gray-900 dark:text-white">{difficulty || 'Mixed'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Test Type</span>
                <span className="font-semibold text-gray-900 dark:text-white">Timed Test (30 min)</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onGoHome}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <span>Back to Home</span>
            </button>
            
            <button
              onClick={handleViewDetailedReview}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>View Detailed Review</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TimedTestResults; 