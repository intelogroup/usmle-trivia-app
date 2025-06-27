import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Code, BookOpen, Lightbulb } from 'lucide-react';

const QuestionCard = ({ 
  currentQuestion, 
  selectedOption, 
  isAnswered, 
  handleOptionSelect, 
  showExplanations = true,
  questionNumber = 1,
  totalQuestions = 1,
  timeSpent = 0,
  difficulty = 'medium'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Enhanced question text processing
  const processQuestionText = (text) => {
    if (!text) return '';
    
    // Handle code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let processedText = text
      .replace(codeBlockRegex, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(inlineCodeRegex, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    
    return processedText;
  };

  // Get difficulty color
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': case 'beginner': return 'text-green-600 bg-green-100';
      case 'medium': case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Check if question has image
  const hasImage = currentQuestion.image_url || currentQuestion.imageUrl;
  const imageUrl = currentQuestion.image_url || currentQuestion.imageUrl;

  // Get correct answer for feedback
  const correctOption = currentQuestion.options?.find(opt => opt.id === currentQuestion.correct_option_id);
  const selectedOptionData = currentQuestion.options?.find(opt => opt.id === selectedOption);
  const isCorrect = selectedOption === currentQuestion.correct_option_id;

  return (
    <motion.div
      key={currentQuestion.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Question Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty || 'Medium'}
            </span>
          </div>
          {timeSpent > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{Math.round(timeSpent)}s</span>
            </div>
          )}
        </div>

        {/* Question Type Indicators */}
        <div className="flex items-center space-x-2 mb-3">
          {hasImage && (
            <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              <ImageIcon className="w-3 h-3" />
              <span>Image Question</span>
            </div>
          )}
          {currentQuestion.question_text?.includes('```') && (
            <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              <Code className="w-3 h-3" />
              <span>Code</span>
            </div>
          )}
          {currentQuestion.question_tags?.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <BookOpen className="w-3 h-3" />
              <span>{currentQuestion.question_tags.length} topics</span>
            </div>
          )}
        </div>

        {/* Tags - Handle different data structures from database */}
        {currentQuestion.question_tags && currentQuestion.question_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentQuestion.question_tags.slice(0, 3).map((tagInfo, index) => {
              // Handle different tag data structures
              const tagName = tagInfo.tags?.name || tagInfo.name || `Tag ${index + 1}`;
              const tagId = tagInfo.tag_id || tagInfo.id || index;
              
              return (
                <span 
                  key={tagId} 
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
                >
                  {tagName}
                </span>
              );
            })}
            {currentQuestion.question_tags.length > 3 && (
              <span className="text-xs text-gray-500">+{currentQuestion.question_tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="p-6">
        {/* Question Text */}
        <div className="mb-6">
          <h2 
            className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: processQuestionText(currentQuestion.question_text) 
            }}
          />
        </div>

        {/* Question Image */}
        {hasImage && (
          <div className="mb-6">
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {!imageLoaded && !imageError && (
                <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {imageError && (
                <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 text-gray-500">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Image could not be loaded</p>
                  </div>
                </div>
              )}

              <img
                src={imageUrl}
                alt="Question illustration"
                className={`w-full h-auto max-h-96 object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{ display: imageError ? 'none' : 'block' }}
              />
            </div>
          </div>
        )}

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options && currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.id === currentQuestion.correct_option_id;
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

            let optionClasses = `w-full text-left p-4 rounded-lg border-2 transition-all duration-300 group`;
            
            if (!isAnswered) {
              optionClasses += ` hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 cursor-pointer`;
              if (isSelected) {
                optionClasses += ` border-blue-500 bg-blue-50 dark:bg-blue-900/20`;
              } else {
                optionClasses += ` border-gray-300 dark:border-gray-600`;
              }
            } else {
              optionClasses += ` cursor-not-allowed`;
              if (isCorrectOption) {
                optionClasses += ` border-green-500 bg-green-50 dark:bg-green-900/20`;
              } else if (isSelected && !isCorrectOption) {
                optionClasses += ` border-red-500 bg-red-50 dark:bg-red-900/20`;
              } else {
                optionClasses += ` border-gray-300 dark:border-gray-600 opacity-60`;
              }
            }

            return (
              <motion.button
                key={option.id}
                onClick={() => !isAnswered && handleOptionSelect(option.id)}
                disabled={isAnswered}
                className={optionClasses}
                whileHover={!isAnswered ? { scale: 1.01 } : {}}
                whileTap={!isAnswered ? { scale: 0.99 } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Option Letter */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${!isAnswered 
                        ? (isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-blue-100')
                        : isCorrectOption
                        ? 'bg-green-600 text-white'
                        : isSelected && !isCorrectOption
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {optionLetter}
                    </div>

                    {/* Option Text */}
                    <span className="text-gray-900 dark:text-white flex-1 text-left">
                      {option.text}
                    </span>
                  </div>

                  {/* Result Icons */}
                  {isAnswered && (
                    <div className="ml-2">
                      {isCorrectOption ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : isSelected && !isCorrectOption ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Answer Feedback */}
        <AnimatePresence>
          {isAnswered && showExplanations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-6 overflow-hidden"
            >
              <div className={`p-4 rounded-lg border-l-4 ${
                isCorrect 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {isCorrect 
                        ? `Well done! You selected the correct answer.`
                        : `The correct answer is: ${correctOption?.text || 'Not available'}`
                      }
                    </div>
                    
                    {/* Explanation */}
                    {currentQuestion.explanation && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-1 mb-2">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Explanation</span>
                        </div>
                        <div 
                          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: processQuestionText(currentQuestion.explanation) 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
