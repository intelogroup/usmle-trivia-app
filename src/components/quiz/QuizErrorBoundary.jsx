import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home, BookOpen } from 'lucide-react';
import logger from '../../utils/logger';

/**
 * Specialized Error Boundary for Quiz components
 * Provides quiz-specific error handling and recovery options
 */
class QuizErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    logger.error("Quiz error boundary triggered", { 
      errorInfo,
      quizType: this.props.quizType || 'unknown',
      questionId: this.props.questionId,
      sessionId: this.props.sessionId
    }, error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  handleGoToQuizTab = () => {
    window.location.href = '/quiz';
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const isQuestionError = error?.message?.includes('question') || error?.message?.includes('Question');
      const isSessionError = error?.message?.includes('session') || error?.message?.includes('Session');
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isQuestionError ? 'Question Loading Error' :
                 isSessionError ? 'Quiz Session Error' :
                 'Quiz Error'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isQuestionError ? 'Unable to load the current question. This might be a temporary issue.' :
                 isSessionError ? 'There was an issue with your quiz session. Your progress may not be saved.' :
                 'An unexpected error occurred during the quiz. Don\'t worry, your progress is safe.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoToQuizTab}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Back to Quiz Selection
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QuizErrorBoundary;
