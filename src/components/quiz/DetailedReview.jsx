import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const DetailedReview = ({ userAnswers }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Detailed Review
      </h2>
      
      <div className="space-y-6">
        {userAnswers.map((answer, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                answer.isCorrect 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : answer.timedOut
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {answer.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : answer.timedOut ? (
                  <Clock className="w-5 h-5 text-orange-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Question {index + 1}
                  </h3>
                  {answer.timedOut && (
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Time ran out
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {answer.question.question_text}
                </p>
                
                <div className="space-y-2 mb-4">
                  {answer.question.options.map((option) => {
                    const isSelected = option.id === answer.selectedOptionId;
                    const isCorrect = option.id === answer.question.correct_option_id;
                    
                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border-2 ${
                          isSelected && isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : isCorrect
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                          <span className="text-gray-900 dark:text-white">
                            {option.text}
                          </span>
                          <div className="flex space-x-2">
                            {isSelected && (
                              <span className="text-xs sm:text-sm font-medium text-blue-600">
                                Your Answer
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-xs sm:text-sm font-medium text-green-600">
                                Correct
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {answer.question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Explanation
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200">
                      {answer.question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DetailedReview;
