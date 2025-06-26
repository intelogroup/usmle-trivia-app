
import { motion } from 'framer-motion';

const QuestionCard = ({ currentQuestion, selectedOption, isAnswered, handleOptionSelect, showExplanations = true }) => {
  return (
    <motion.div
      key={currentQuestion.id}
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

      {isAnswered && showExplanations && currentQuestion.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          <h3 className="font-bold mb-2 text-sm">Explanation</h3>
          <p className="text-sm">{currentQuestion.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
