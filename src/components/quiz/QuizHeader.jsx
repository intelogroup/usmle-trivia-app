import { ArrowLeft, Wifi, WifiOff, Clock, Zap, Timer as TimerIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizHeader = ({ categoryName, currentQuestionIndex, totalQuestions, score, isOffline, isFetching, timeLeft, isTimed, quizMode, quizType }) => {
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get quiz mode icon and info
  const getQuizModeInfo = () => {
    switch (quizMode) {
      case 'quick':
        return { icon: Zap, label: 'Quick Quiz', color: 'text-blue-600' };
      case 'timed':
        return { icon: TimerIcon, label: 'Timed Test', color: 'text-orange-600' };
      case 'blitz':
        return { icon: Zap, label: 'Blitz Quiz', color: 'text-yellow-600' };
      case 'custom':
        return { icon: TimerIcon, label: 'Custom Quiz', color: 'text-purple-600' };
      default:
        return { icon: Zap, label: 'Quiz', color: 'text-gray-600' };
    }
  };

  const modeInfo = getQuizModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <div className="flex items-center justify-between mb-3">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="text-center flex-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ModeIcon className={`w-4 h-4 ${modeInfo.color}`} />
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {categoryName || modeInfo.label}
          </span>

          {/* Status indicators */}
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

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Question {currentQuestionIndex + 1} / {totalQuestions}</span>
          {quizMode && (
            <>
              <span>•</span>
              <span className={modeInfo.color}>{modeInfo.label}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right">
        {isTimed && timeLeft !== null ? (
          <div className="flex items-center gap-1">
            <Clock size={16} className={timeLeft < 30 ? 'text-red-500' : 'text-gray-500'} />
            <div className={`text-base font-bold ${
              timeLeft < 30 ? 'text-red-500' :
              timeLeft < 60 ? 'text-yellow-500' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {score}/{totalQuestions}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizHeader;