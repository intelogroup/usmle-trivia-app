import { useState, Suspense, lazy, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCategoriesQuery } from '../hooks/useOptimizedQueries'
import { useViewTransitions } from '../hooks/useViewTransitions'
import { AlertCircle, Loader2 } from 'lucide-react'
import LoadingIndicator from '../components/ui/LoadingIndicator'

// Import quiz components directly for debugging
import QuizFilters from '../components/quiz/QuizFilters'
import CategoryGrid from '../components/quiz/CategoryGrid'
import QuizActions from '../components/quiz/QuizActions'

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Filters skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg animate-pulse">
      <div className="flex space-x-4">
        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
    
    {/* Actions skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      ))}
    </div>
    
    {/* Categories skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
)

// Enhanced error display component
const ErrorDisplay = ({ error, onRetry, onGoHome }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-red-200 dark:border-red-800 max-w-md w-full text-center">
      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Unable to Load Categories
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {error?.message || 'There was a problem loading the quiz categories. This might be due to a network issue.'}
      </p>
      
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Try Again
        </button>
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Go to Home
          </button>
        )}
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
)

const QuizTab = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { transitionTo } = useViewTransitions()
  
  // Categories query with error recovery
  const { 
    data: categories = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useCategoriesQuery(user?.id)
  
  // Filter state with validation
  const [filters, setFilters] = useState({
    search: '',
    selectedFilter: 'all',
    viewMode: 'grid'
  })

  // Safe filter change handler
  const handleFiltersChange = useCallback((newFilters) => {
    if (!newFilters || typeof newFilters !== 'object') {
      console.warn('Invalid filters object:', newFilters);
      return;
    }
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      selectedFilter: 'all',
      viewMode: 'grid'
    });
  }, []);

  // Quiz mode configuration constants (from QUIZ_MODES_GUIDE.md)
  const QUICK_QUIZ_CONFIG = {
    questionCount: 10,
    autoAdvance: true,
    timePerQuestion: 60,
    showExplanations: false,
    allowReview: false
  };
  const TIMED_TEST_CONFIG = {
    questionCount: 20,
    totalTime: 30 * 60, // 30 minutes in seconds
    autoAdvance: false,
    timePerQuestion: 90,
    showExplanations: true,
    allowReview: false
  };

  // Enhanced category select handler with proper quiz mode support
  const handleCategorySelect = useCallback((categoryId, categoryName) => {
    if (!categoryId) {
      console.warn('Category ID is required');
      return;
    }
    try {
      // Use local config for quick quiz
      const quizConfig = QUICK_QUIZ_CONFIG;
      navigate('/quick-quiz', {
        state: {
          categoryId,
          categoryName: categoryName || 'Quiz',
          questionCount: quizConfig.questionCount,
          difficulty: null,
          quizMode: 'quick',
          quizType: 'category',
          autoAdvance: quizConfig.autoAdvance,
          timePerQuestion: quizConfig.timePerQuestion
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      navigate(`/quiz/${categoryId}`);
    }
  }, [navigate]);

  // Enhanced quick actions handlers
  const handleQuickStart = useCallback(() => {
    const quickConfig = QUICK_QUIZ_CONFIG;
    navigate('/quick-quiz', {
      state: {
        categoryId: 'mixed',
        categoryName: 'Quick Start Quiz',
        questionCount: quickConfig.questionCount,
        quizMode: 'quick',
        quizType: 'quick_start',
        autoAdvance: quickConfig.autoAdvance,
        timePerQuestion: quickConfig.timePerQuestion
      }
    });
  }, [navigate]);

  const handleTimedTest = useCallback(() => {
    // Navigate to setup screen instead of directly to test
    navigate('/timed-test-setup');
  }, [navigate]);

  const handleCustomQuiz = useCallback(() => {
    navigate('/custom-quiz-setup');
  }, [navigate]);



  // Handle go home navigation
  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (isError) return <ErrorDisplay error={error} onRetry={refetch} onGoHome={handleGoHome} />
  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      <div className="px-3 md:px-6 lg:px-8 pt-2 pb-3 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose from {categories.length} categories or start a quick quiz
          </p>
        </div>

        {/* Quick Actions */}
        <QuizActions
          onQuickStart={handleQuickStart}
          onTimedTest={handleTimedTest}
          onCustomQuiz={handleCustomQuiz}
        />

        {/* Filters */}
        <Suspense fallback={<div>Loading filters...</div>}>
          <QuizFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </Suspense>

        {/* Categories Grid/List */}
        <Suspense fallback={<div>Loading categories...</div>}>
          <CategoryGrid
            categories={categories}
            filters={filters}
            onCategorySelect={handleCategorySelect}
            onClearFilters={handleClearFilters}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default QuizTab