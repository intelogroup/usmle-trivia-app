import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { getTransformedUrl } from '../../utils/imageUtils';
import OptionCard from './OptionCard';
import SkeletonImage from './SkeletonImage';
import TimerBadge from './TimerBadge';
import { processQuestionText } from '../../utils/questionUtils';

const QuestionCard = ({
  currentQuestion,
  selectedOption,
  isAnswered,
  handleOptionSelect,
  showExplanations = false,
  timedOut = false,
  progress = 0,
  total = 10,
  secondsLeft = null, // Pass the timer value here
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Render question text as HTML (supports bold, italics, etc.)
  const processQuestionText = (text) =>
    text
      ? text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br>')
      : '';

  const isCorrect = selectedOption === currentQuestion.correct_option_id;

  return (
    <motion.div
      layout
      className="relative mx-auto max-w-xl w-full p-0 sm:p-0"
      style={{ zIndex: 1 }}
    >
      {/* Glassy Card Container */}
      <div className="backdrop-blur-xl bg-white/20 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700 rounded-3xl shadow-2xl px-6 py-8 sm:px-10 sm:py-12 flex flex-col items-stretch">
        {/* Progress Bar + Timer */}
        <div className="w-full mb-6 relative">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((progress / total) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-white/70 mt-1 text-right">
            {progress} / {total}
          </div>
          {/* Timer badge inside progress card, top right */}
          {typeof secondsLeft === 'number' && (
            <TimerBadge seconds={secondsLeft} />
          )}
        </div>

        {/* Image (if present) */}
        {currentQuestion.image_url && (
          <div className="flex justify-center mb-6">
            {!imageLoaded && <SkeletonImage />}
            <img
              src={getTransformedUrl(currentQuestion.image_url, { width: 600 })}
              alt="Question"
              className={`max-h-40 rounded-xl shadow-lg object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded ? 'block' : 'none', minHeight: '160px' }}
            />
          </div>
        )}

        {/* Question Text */}
        <div className="mb-8">
          <h2
            className="text-xl sm:text-2xl font-bold text-white text-center leading-snug drop-shadow"
            dangerouslySetInnerHTML={{
              __html: processQuestionText(currentQuestion.question_text),
            }}
          />
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 mb-4">
          {currentQuestion.options?.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedOption === option.id}
              isAnswered={isAnswered}
              isCorrectOption={option.id === currentQuestion.correct_option_id}
              handleSelect={handleOptionSelect}
              disabled={isAnswered}
              showFeedback={true}
            />
          ))}
        </div>

        {/* Feedback/Explanation */}
        <AnimatePresence>
          {showExplanations && isAnswered && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={`mt-6 px-5 py-4 rounded-2xl flex items-center gap-3 shadow bg-slate-900/80 border border-white/10`}
            >
              {isCorrect ? (
                <CheckCircle className="w-7 h-7 text-green-400 shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-red-400 shrink-0" />
              )}
              <div>
                <div className={`font-semibold mb-1 text-white text-lg`}>{isCorrect ? 'Correct!' : 'Incorrect'}</div>
                <div
                  className="text-white/80 text-base"
                  dangerouslySetInnerHTML={{ __html: processQuestionText(currentQuestion.explanation) }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
