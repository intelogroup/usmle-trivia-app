
const QuizProgressBar = ({ progressPercentage }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 dark:bg-gray-700">
      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
    </div>
  );
};

export default QuizProgressBar;
