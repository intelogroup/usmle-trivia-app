import { WifiOff, RefreshCw, Home, Play, AlertTriangle, Database, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getFriendlyErrorMessage = (error) => {
  if (!error) return 'There was a problem loading the quiz questions.';
  if (error.code === 'NO_QUESTIONS') {
    return error.message || 'No questions found for your selected category or difficulty.';
  }
  if (error.code === 'NO_CONFIG') {
    return 'Quiz configuration is missing. Please try starting the quiz again.';
  }
  if (error.code === 'FETCH_ERROR') {
    return error.message || 'Failed to load questions from the database.';
  }
  if (error.message?.includes('FETCH_QUESTIONS_ERROR')) {
    return 'Failed to fetch quiz questions. Please try again or adjust your filters.';
  }
  if (error.message?.includes('SESSION_CREATION_ERROR')) {
    return 'Failed to create a quiz session. Please try starting the quiz again.';
  }
  if (error.message?.includes('RESPONSE_RECORDING_ERROR')) {
    return 'Failed to record your response. Please continue to the next question.';
  }
  if (error.message?.includes('SESSION_COMPLETION_ERROR')) {
    return 'Failed to complete the quiz session. Your progress may not be saved.';
  }
  if (error.code === 'ERR_NETWORK' || error.message?.toLowerCase().includes('network')) {
    return 'Network error: Please check your internet connection and try again.';
  }
  if (error.code === 'ERR_SERVER' || error.status === 500) {
    return 'Server error: Please try again later.';
  }
  if (error.status === 406) {
    return 'Not Acceptable: The server could not process your request. Please contact support if this persists.';
  }
  if (error.status === 401 || error.status === 403) {
    return 'You are not authorized to access this quiz. Please log in or check your permissions.';
  }
  return error.message || 'There was a problem loading the quiz questions.';
};

const getErrorIcon = (error) => {
  if (error.code === 'NO_QUESTIONS') return Database;
  if (error.code === 'NO_CONFIG') return Settings;
  if (error.code === 'FETCH_ERROR') return AlertTriangle;
  return WifiOff;
};

const getErrorSuggestions = (error, categoryId, questionCount) => {
  const suggestions = [];
  if (error.code === 'NO_QUESTIONS') {
    suggestions.push('Try selecting a different difficulty level');
    suggestions.push('Choose a different category');
    suggestions.push('Use mixed categories for more options');
    if (questionCount > 10) {
      suggestions.push(`Try with fewer questions (${Math.max(5, questionCount - 5)})`);
    }
  } else if (error.code === 'FETCH_ERROR' || error.message?.includes('FETCH_QUESTIONS_ERROR')) {
    suggestions.push('Check your internet connection');
    suggestions.push('Try again in a few moments');
    suggestions.push('Contact support if the problem persists');
  } else if (error.code === 'NO_CONFIG' || error.message?.includes('SESSION_CREATION_ERROR')) {
    suggestions.push('Go back to quiz selection');
    suggestions.push('Try starting the quiz again');
  } else if (error.message?.includes('RESPONSE_RECORDING_ERROR') || error.message?.includes('SESSION_COMPLETION_ERROR')) {
    suggestions.push('Continue with the quiz if possible');
    suggestions.push('Your progress may not be saved');
    suggestions.push('Contact support if issues persist');
  } else {
    suggestions.push('Try refreshing the page');
    suggestions.push('Check your internet connection');
    suggestions.push('Go back to quiz selection');
  }
  return suggestions;
};

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
  const ErrorIcon = getErrorIcon(error);
  const suggestions = getErrorSuggestions(error, categoryId, questionCount);

  const handleGoHome = () => navigate('/');
  const handleGoToCategories = () => navigate('/quiz');
  const handleTryMixed = () => {
    navigate('/quick-quiz', {
      state: {
        categoryId: 'mixed',
        categoryName: 'Mixed Categories',
        questionCount: Math.min(questionCount || 10, 10),
        quizType: 'quick'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg w-full text-center">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <ErrorIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Unable to Load Quiz
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {getFriendlyErrorMessage(error)}
        </p>
        {/* Error Details */}
        {error && (error.code || error.details) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              What went wrong:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
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
