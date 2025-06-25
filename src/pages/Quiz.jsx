import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { QuestionService } from '../services/questionService';
import { ArrowLeft, Check, X } from 'lucide-react';

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categoryId, categoryName, questionCount } = location.state || { categoryId: null, categoryName: null, questionCount: 10 };

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizSession, setQuizSession] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) {
        setError('Please log in to take a quiz.');
        setLoading(false);
        return;
      }

      if (!categoryId) {
        setError('No category selected.');
        setLoading(false);
        return;
      }

      try {
        // Create a new quiz session for tracking
        const sessionData = await QuestionService.createQuizSession(user.id, categoryId, questionCount);
        setQuizSession(sessionData);

        // Fetch questions for the category
        const questionsData = await QuestionService.fetchQuestions(categoryId, questionCount);
        setQuestions(questionsData);
      } catch (err) {
        setError(err.message || 'Error loading quiz. Please try again.');
        console.error('Quiz loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId, questionCount, user]);

  const handleOptionSelect = (optionId) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !quizSession) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct_option_id;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setIsAnswered(true);

    try {
      // Record the quiz response
      await QuestionService.recordQuizResponse(
        quizSession.id,
        currentQuestion.id,
        selectedOption,
        isCorrect,
        currentQuestionIndex + 1
      );

      // Update user question history
      await QuestionService.updateUserQuestionHistory(
        user.id,
        currentQuestion.id,
        selectedOption,
        isCorrect
      );

    } catch (err) {
      console.error('Error recording answer:', err);
      // Continue anyway - don't block user experience
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz completed - update session and navigate to results
      const finalScore = selectedOption === questions[currentQuestionIndex].correct_option_id ? score + 1 : score;
      
      try {
        await QuestionService.completeQuizSession(quizSession.id, user.id, finalScore);

        navigate('/results', { 
          state: { 
            score: finalScore,
            totalQuestions: questions.length,
            sessionId: quizSession.id
          } 
        });
      } catch (err) {
        console.error('Error completing quiz:', err);
        // Navigate anyway
        navigate('/results', { 
          state: { 
            score: finalScore,
            totalQuestions: questions.length 
          } 
        });
      }
    }
  };

  // Security check - ensure user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-600 mb-4">Please log in to take a quiz.</p>
        <button 
          onClick={() => navigate('/auth/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/categories')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-600 mb-4">No questions found for this category.</p>
        <button 
          onClick={() => navigate('/categories')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Try Another Category
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <div className="text-base font-bold">{categoryName || 'Quiz'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Question {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
            <div className="text-base font-bold">{score}/{questions.length}</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 dark:bg-gray-700">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md"
        >
          <h2 className="text-lg font-semibold mb-3">{currentQuestion.question_text}</h2>

          <div className="flex flex-wrap gap-1 mb-3">
            {currentQuestion.question_tags.map((tagInfo) => (
              <span key={tagInfo.tag_id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {tagInfo.tags.name}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {currentQuestion.options && currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={isAnswered}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all
                  ${selectedOption === option.id ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'}
                  ${isAnswered && option.id === currentQuestion.correct_option_id ? 'bg-green-200 dark:bg-green-800 border-green-500' : ''}
                  ${isAnswered && selectedOption === option.id && option.id !== currentQuestion.correct_option_id ? 'bg-red-200 dark:bg-red-800 border-red-500' : ''}
                  ${isAnswered ? 'cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {option.text}
              </button>
            ))}
          </div>

          {isAnswered && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <h3 className="font-bold mb-2 text-sm">Explanation</h3>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="mt-4 text-center">
            {isAnswered ? (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
