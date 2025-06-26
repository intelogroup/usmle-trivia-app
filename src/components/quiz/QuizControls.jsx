
const QuizControls = ({ isAnswered, handleSubmitAnswer, handleNextQuestion, selectedOption, isLastQuestion, quizType, isAutoAdvance }) => {
  return (
    <div className="mt-4 text-center">
      {isAnswered ? (
        isAutoAdvance && quizType === 'quick' ? (
          <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            {isLastQuestion ? 'Completing quiz...' : 'Auto-advancing in 1.5s...'}
          </div>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </button>
        )
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
  );
};

export default QuizControls;
