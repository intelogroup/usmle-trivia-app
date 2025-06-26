
import { WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizError = ({ questionsError, categoryId, questionCount, getOfflineData, navigate }) => {
  const offlineQuestions = getOfflineData(categoryId, questionCount);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <WifiOff className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-lg text-red-600 mb-4">
        {offlineQuestions ? 'Network error, but offline questions available' : 'Error loading quiz questions'}
      </p>
      <p className="text-sm text-gray-500 mb-4">{questionsError?.message}</p>
      {offlineQuestions ? (
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg mb-2"
        >
          Use Offline Questions
        </button>
      ) : null}
      <button
        onClick={() => navigate('/categories')}
        className="bg-gray-600 text-white px-6 py-2 rounded-lg"
      >
        Back to Categories
      </button>
    </div>
  );
};

export default QuizError;
