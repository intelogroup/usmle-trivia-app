import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Send,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/**
 * Post-Quiz User Feedback Component
 * Collects user feedback after quiz completion
 */
const QuizFeedback = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  quizData,
  className = '' 
}) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    difficulty: '',
    helpfulness: '',
    comments: '',
    wouldRecommend: null,
    issues: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleDifficultyChange = (difficulty) => {
    setFeedback(prev => ({ ...prev, difficulty }));
  };

  const handleHelpfulnessChange = (helpfulness) => {
    setFeedback(prev => ({ ...prev, helpfulness }));
  };

  const handleRecommendationChange = (wouldRecommend) => {
    setFeedback(prev => ({ ...prev, wouldRecommend }));
  };

  const handleIssueToggle = (issue) => {
    setFeedback(prev => ({
      ...prev,
      issues: prev.issues.includes(issue) 
        ? prev.issues.filter(i => i !== issue)
        : [...prev.issues, issue]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...feedback,
        quizId: quizData?.sessionId,
        score: quizData?.score,
        totalQuestions: quizData?.totalQuestions,
        timestamp: new Date().toISOString()
      });
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyOptions = [
    { value: 'too_easy', label: 'Too Easy', emoji: '😴' },
    { value: 'just_right', label: 'Just Right', emoji: '👍' },
    { value: 'too_hard', label: 'Too Hard', emoji: '😅' },
    { value: 'mixed', label: 'Mixed', emoji: '🤔' }
  ];

  const helpfulnessOptions = [
    { value: 'very_helpful', label: 'Very Helpful', emoji: '🎯' },
    { value: 'somewhat_helpful', label: 'Somewhat Helpful', emoji: '👌' },
    { value: 'not_helpful', label: 'Not Helpful', emoji: '😐' }
  ];

  const commonIssues = [
    { value: 'unclear_questions', label: 'Unclear questions' },
    { value: 'wrong_answers', label: 'Incorrect answers' },
    { value: 'too_fast', label: 'Timer too fast' },
    { value: 'too_slow', label: 'Timer too slow' },
    { value: 'technical_issues', label: 'Technical issues' },
    { value: 'poor_explanations', label: 'Poor explanations' }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
      >
        {submitted ? (
          <div className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your feedback helps us improve the quiz experience.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                How was your quiz?
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= feedback.rating 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star className="w-6 h-6" fill={star <= feedback.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How was the difficulty?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDifficultyChange(option.value)}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        feedback.difficulty === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.emoji}</div>
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Helpfulness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How helpful was this quiz?
                </label>
                <div className="space-y-2">
                  {helpfulnessOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleHelpfulnessChange(option.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        feedback.helpfulness === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Would Recommend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Would you recommend this quiz to others?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRecommendationChange(true)}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      feedback.wouldRecommend === true
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Yes</div>
                  </button>
                  <button
                    onClick={() => handleRecommendationChange(false)}
                    className={`flex-1 p-3 rounded-lg border transition-colors ${
                      feedback.wouldRecommend === false
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">No</div>
                  </button>
                </div>
              </div>

              {/* Issues */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Any issues? (optional)
                </label>
                <div className="space-y-2">
                  {commonIssues.map((issue) => (
                    <button
                      key={issue.value}
                      onClick={() => handleIssueToggle(issue.value)}
                      className={`w-full p-2 rounded-lg border text-left text-sm transition-colors ${
                        feedback.issues.includes(issue.value)
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {issue.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional comments (optional)
                </label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Tell us more about your experience..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || feedback.rating === 0}
                  className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuizFeedback;