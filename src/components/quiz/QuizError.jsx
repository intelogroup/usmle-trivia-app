import { WifiOff, RefreshCw, Home, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizError = ({ 
  error, 
  onRetry, 
  categoryId, 
  questionCount, 
  getOfflineData,
  showOfflineOption = true 
}) => {
  const navigate = useNavigate();
  const offlineQuestions = showOfflineOption ? getOfflineData?.(categoryId, questionCount) : null;

  const handleGoHome = () => navigate('/');
  const handleGoToCategories = () => navigate('/quiz');
  const handleTryMixed = () => {
    navigate('/quick-quiz', {
      state: {
        categoryId: 'mixed',
        categoryName: 'Mixed Categories',
        questionCount: 10,
        quizType: 'quick'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <WifiOff className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Quiz
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {error?.message || 'There was a problem loading the quiz questions. This might be due to a network issue.'}
        </p>
        
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
          
          {offlineQuestions && offlineQuestions.length > 0 && (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Use Offline Questions ({offlineQuestions.length})</span>
            </button>
          )}
          
          <button
            onClick={handleTryMixed}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Try Mixed Quiz</span>
          </button>
          
          <button
            onClick={handleGoToCategories}
            className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Categories
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">Technical Details</summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default QuizError;
