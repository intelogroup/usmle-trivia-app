import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Home, Repeat, CheckCircle, XCircle, Book } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const { 
    score, 
    totalQuestions, 
    quizType, 
    questions = [], 
    quizResponses = [] 
  } = location.state || { score: 0, totalQuestions: 0, quizType: 'standard', questions: [], quizResponses: [] };
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  let feedback = {
    title: '',
    message: '',
    color: '',
  };

  if (percentage >= 80) {
    feedback = {
      title: 'Excellent!',
      message: 'You have a strong grasp of this topic.',
      color: 'text-green-500',
    };
  } else if (percentage >= 50) {
    feedback = {
      title: 'Good Job!',
      message: 'You are on the right track. Keep reviewing.',
      color: 'text-yellow-500',
    };
  } else {
    feedback = {
      title: 'Keep Practicing',
      message: "Don't give up! Review the material and try again.",
      color: 'text-red-500',
    };
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
      >
        <Award className={`mx-auto mb-4 h-16 w-16 ${feedback.color}`} />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{feedback.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{feedback.message}</p>

        <div className="mb-8">
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            {score} / {totalQuestions}
          </div>
          <div className="text-lg text-gray-700 dark:text-gray-300">
            Correct Answers ({percentage.toFixed(1)}%)
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/quiz"
            className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Repeat className="mr-2 h-5 w-5" />
            Take Another Quiz
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Detailed Review for Quick Quiz */}
      {quizType === 'quick' && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-4xl mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              <h2 className="text-xl font-bold">Quick Quiz Review</h2>
            </div>
            <p className="text-purple-100 text-sm mt-1">Review all questions with explanations</p>
          </div>
          
          <div className="p-6 space-y-6">
            {questions.map((question, index) => {
              const response = quizResponses.find(r => r.question_id === question.id);
              const isCorrect = response?.is_correct || false;
              const selectedOptionId = response?.selected_option_id;
              const correctOption = question.options?.find(opt => opt.id === question.correct_option_id);
              const selectedOption = question.options?.find(opt => opt.id === selectedOptionId);
              
              return (
                <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex-1">
                      {index + 1}. {question.question_text}
                    </h3>
                    <div className={`ml-4 flex items-center ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      <span className="ml-1 text-sm font-medium">
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {question.options?.map((option) => (
                      <div 
                        key={option.id} 
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          option.id === question.correct_option_id 
                            ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200' 
                            : option.id === selectedOptionId && !isCorrect
                            ? 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.text}</span>
                          {option.id === question.correct_option_id && (
                            <span className="text-xs font-medium bg-green-600 text-white px-2 py-1 rounded">
                              Correct Answer
                            </span>
                          )}
                          {option.id === selectedOptionId && option.id !== question.correct_option_id && (
                            <span className="text-xs font-medium bg-red-600 text-white px-2 py-1 rounded">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Explanation</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Results;