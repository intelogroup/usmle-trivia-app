import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BlockTestBlock - Renders a single block of questions
 * @param {Array} questions
 * @param {function} onAnswer - called with (questionId, answerData)
 * @param {function} onBlockComplete
 * @param {Array} answers
 * @param {boolean} paused
 */

// Simple confetti burst (can be replaced with a library for more polish)
const Confetti = ({ show }) => show ? (
  <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
    <span role="img" aria-label="confetti" className="text-5xl animate-bounce">🎉</span>
  </div>
) : null;

const ICONS = ['🅰️', '🅱️', '🇨', '🇩'];

const BlockTestBlock = ({ questions, onAnswer, onBlockComplete, answers, paused, refs }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const optionRefs = useRef([]);

  useEffect(() => {
    if (!isAnswered) {
      optionRefs.current[0]?.focus();
    }
  }, [isAnswered, currentIdx]);

  if (!questions || questions.length === 0) return <div>No questions in this block.</div>;
  const currentQuestion = questions[currentIdx];

  const handleOptionSelect = (optionId, idx) => {
    if (isAnswered || paused) return;
    setSelectedOption(optionId);
    setIsAnswered(true);
    const isCorrect = optionId === currentQuestion.correct_option_id;
    if (isCorrect) setShowConfetti(true);
    onAnswer(currentQuestion.id, {
      selectedOptionId: optionId,
      isCorrect,
      responseOrder: currentIdx + 1,
    });
    setTimeout(() => setShowConfetti(false), 1200);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(idx => idx + 1);
    } else {
      onBlockComplete();
    }
  };

  return (
    <motion.div className="bg-white rounded-xl shadow p-4 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Confetti show={showConfetti} />
      <div className="mb-2 font-semibold">Question {currentIdx + 1} / {questions.length}</div>
      <div className="mb-4 text-lg font-medium">{currentQuestion.question_text}</div>
      <div className="space-y-2 mb-4">
        {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
          <motion.button
            key={opt.id}
            ref={el => { optionRefs.current[idx] = el; if (refs) refs.current[idx] = el; }}
            className={`w-full flex items-center gap-3 text-left p-3 rounded-xl border transition-all font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${selectedOption === opt.id
              ? (opt.id === currentQuestion.correct_option_id
                ? 'bg-green-100 border-green-400 scale-105'
                : 'bg-red-100 border-red-400 shake')
              : 'border-gray-200 hover:bg-blue-50'} ${isAnswered ? 'pointer-events-none' : ''}`}
            disabled={isAnswered || paused}
            onClick={() => handleOptionSelect(opt.id, idx)}
            aria-pressed={selectedOption === opt.id}
            tabIndex={0}
          >
            <span className="text-2xl">{ICONS[idx] || '🔘'}</span>
            <span>{opt.text}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mb-2"
          >
            {selectedOption === currentQuestion.correct_option_id ? (
              <div className="text-green-700 font-semibold">Correct!</div>
            ) : (
              <div className="text-red-700 font-semibold">Incorrect. Correct answer: <b>{currentQuestion.options.find(o => o.id === currentQuestion.correct_option_id)?.text}</b></div>
            )}
            {currentQuestion.explanation && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">{currentQuestion.explanation}</div>
            )}
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition"
              onClick={handleNext}
              data-next-btn
            >
              {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Block'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlockTestBlock; 