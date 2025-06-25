import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Home, Repeat } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const { score, totalQuestions } = location.state || { score: 0, totalQuestions: 0 };
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
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
            to="/categories"
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
    </div>
  );
};

export default Results;
