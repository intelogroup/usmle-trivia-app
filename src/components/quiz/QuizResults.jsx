import { motion } from 'framer-motion';
import { 
  Zap, CheckCircle, XCircle, Star, Trophy, Target, Clock, RotateCcw 
} from 'lucide-react';
import Confetti from '../ui/Confetti';

const QuizResults = ({ 
  score, 
  questionCount, 
  accuracy,
  userAnswers,
  quizSession,
  quizConfig,
  timeSpent,
  onRestart,
  onGoHome 
}) => {
  const getPerformanceData = () => {
    if (accuracy >= 80) return { 
      grade: 'A', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      message: 'Excellent! USMLE ready!' 
    };
    if (accuracy >= 70) return { 
      grade: 'B', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100', 
      message: 'Good job! Keep it up!' 
    };
    if (accuracy >= 60) return { 
      grade: 'C', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100', 
      message: 'Not bad! More practice needed!' 
    };
    return { 
      grade: 'D', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100', 
      message: 'Keep practicing! You\'ll improve!' 
    };
  };

  const performance = getPerformanceData();
  const pointsEarned = score * 10; // 10 points per correct answer
  const formattedTime = timeSpent ? `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}` : null;

  // Quiz mode specific messaging
  const getQuizModeMessage = () => {
    if (!quizConfig) return '';
    
    switch (quizConfig.quizMode) {
      case 'quick':
        return 'Quick Quiz completed with auto-advance!';
      case 'timed':
        return 'Timed Test completed under exam conditions!';
      case 'blitz':
        return 'Blitz Quiz completed at lightning speed!';
      default:
        return 'Quiz completed!';
    }
  };

  const handleShare = () => {
    const shareText = `Just scored ${score}/${questionCount} (${accuracy}%) on a USMLE ${quizConfig?.quizMode || 'Quick'} Quiz! 🎉`;
    
    if (navigator.share) {
      navigator.share({
        title: 'USMLE Quiz Results',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(
        `${shareText} Check it out at ${window.location.origin}`
      );
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <Confetti trigger={accuracy >= 80} duration={4000} />
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
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-4 ${
                accuracy >= 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-purple-600'
              }`}
            >
              {accuracy >= 80 ? (
                <Trophy className="w-8 h-8" />
              ) : (
                <Zap className="w-8 h-8" />
              )}
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {accuracy >= 80 ? '🎉 Outstanding! 🎉' : 'Quick Quiz Complete!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {accuracy >= 80 ? 'You absolutely crushed it!' : performance.message}
            </p>
            {accuracy >= 80 && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-purple-600 dark:text-purple-400 mt-2"
              >
                🌟 You're ready for the real thing! 🌟
              </motion.p>
            )}
          </div>

          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`${performance.bgColor} rounded-2xl p-4 sm:p-8 mb-8 text-center`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-4 sm:space-y-0">
              <div className="text-center">
                <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
                  {score}
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  out of {questionCount}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
                  {accuracy}%
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  accuracy
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl sm:text-6xl font-bold ${performance.color} mb-1 sm:mb-2`}>
                  {performance.grade}
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  grade
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">
                {score >= 8 ? 'Quiz Master!' : score >= 6 ? 'Good Work!' : 'Keep Going!'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">
                {accuracy >= 80 ? 'Sharpshooter' : accuracy >= 60 ? 'On Target' : 'Practice Makes Perfect'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 dark:text-white">
                Quick & Focused
              </div>
            </div>
          </motion.div>

          {/* Detailed Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Detailed Review
            </h2>
            
            <div className="space-y-6">
              {userAnswers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      answer.isCorrect 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : answer.timedOut
                        ? 'bg-orange-100 dark:bg-orange-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : answer.timedOut ? (
                        <Clock className="w-5 h-5 text-orange-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Question {index + 1}
                        </h3>
                        {answer.timedOut && (
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            Time ran out
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {answer.question.question_text}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {answer.question.options.map((option) => {
                          const isSelected = option.id === answer.selectedOptionId;
                          const isCorrect = option.id === answer.question.correct_option_id;
                          
                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border-2 ${
                                isSelected && isCorrect
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : isSelected && !isCorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : isCorrect
                                  ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                                  : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                                <span className="text-gray-900 dark:text-white">
                                  {option.text}
                                </span>
                                <div className="flex space-x-2">
                                  {isSelected && (
                                    <span className="text-xs sm:text-sm font-medium text-blue-600">
                                      Your Answer
                                    </span>
                                  )}
                                  {isCorrect && (
                                    <span className="text-xs sm:text-sm font-medium text-green-600">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {answer.question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Explanation
                          </h4>
                          <p className="text-blue-800 dark:text-blue-200">
                            {answer.question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
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
              onClick={onRestart}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={onGoHome}
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <span>Back to Home</span>
            </button>
            
            {accuracy >= 80 && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Star className="w-5 h-5" />
                <span>Share Success!</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResults; 