import { ArrowLeft, Wifi, WifiOff, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizHeader = ({ categoryName, currentQuestionIndex, totalQuestions, score, isOffline, isFetching, timeLeft, isTimed }) => {
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
        <ArrowLeft size={20} />
      </button>
      <div className="text-center">
        <div className="text-base font-bold flex items-center gap-2">
          {categoryName || 'Quiz'}
          {isOffline && (
            <div className="flex items-center text-orange-500" title="Using offline questions">
              <WifiOff size={16} />
            </div>
          )}
          {isFetching && (
            <div className="flex items-center text-blue-500" title="Updating questions">
              <Wifi size={16} className="animate-pulse" />
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </div>
      </div>
      <div className="text-right">
        {isTimed ? (
          <div className="flex items-center gap-1 text-red-500">
            <Clock size={16} />
            <div className="text-base font-bold">{formatTime(timeLeft)}</div>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
            <div className="text-base font-bold">{score}/{totalQuestions}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizHeader;