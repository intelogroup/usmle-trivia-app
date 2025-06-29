import React, { useState, useEffect, useCallback } from 'react';
import { fetchBlockQuestions, recordBlockResponse, pauseBlockSession, resumeBlockSession, completeBlockTestSession } from '../../services/questionService';
import BlockTestBlock from './BlockTestBlock';

/**
 * BlockTestRunner - Main runner for block test mode
 * @param {object} session - Block test session object
 * @param {function} onComplete - called with results when test is done
 */
const BlockTestRunner = ({ session, onComplete }) => {
  const { numBlocks, questionsPerBlock, difficulty } = session.settings || {};
  const [currentBlock, setCurrentBlock] = useState(0);
  const [blockQuestions, setBlockQuestions] = useState([]);
  const [blockAnswers, setBlockAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [timer, setTimer] = useState(questionsPerBlock * 60 + 300); // 1 min/q + 5 min bonus
  const [intervalId, setIntervalId] = useState(null);
  const [error, setError] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]);

  // Fetch questions for current block
  useEffect(() => {
    setLoading(true);
    fetchBlockQuestions({
      userId: session.user_id,
      blockIndex: currentBlock,
      questionsPerBlock,
      difficulty,
    })
      .then(qs => setBlockQuestions(qs))
      .catch(e => setError(e.message || 'Failed to load questions'))
      .finally(() => setLoading(false));
  }, [currentBlock, session.user_id, questionsPerBlock, difficulty]);

  // Timer logic
  useEffect(() => {
    if (paused || loading) return;
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(id);
          handleBlockComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [paused, loading]);

  // Pause/resume handlers
  const handlePause = async () => {
    setPaused(true);
    if (intervalId) clearInterval(intervalId);
    await pauseBlockSession(session.id, {
      currentBlock,
      timer,
      blockAnswers,
    });
  };
  const handleResume = async () => {
    setPaused(false);
    await resumeBlockSession(session.id);
  };

  // Handle block completion
  const handleBlockComplete = useCallback(async () => {
    // Save answers for this block
    setAllAnswers(prev => [...prev, ...blockAnswers]);
    if (currentBlock < numBlocks - 1) {
      setCurrentBlock(b => b + 1);
      setBlockAnswers([]);
      setTimer(questionsPerBlock * 60 + 300);
    } else {
      // All blocks complete
      await completeBlockTestSession(session.id);
      onComplete({ answers: [...allAnswers, ...blockAnswers], session });
    }
  }, [blockAnswers, currentBlock, numBlocks, questionsPerBlock, session, allAnswers, onComplete]);

  // Handle answer for a question
  const handleAnswer = async (questionId, answerData) => {
    await recordBlockResponse(session.id, answerData, currentBlock);
    setBlockAnswers(prev => [...prev, { ...answerData, questionId, block: currentBlock }]);
  };

  if (loading) return <div>Loading block questions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>Block {currentBlock + 1} / {numBlocks}</div>
        <div>Time Left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
        <button onClick={paused ? handleResume : handlePause} className="ml-2 px-3 py-1 bg-gray-200 rounded">
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <BlockTestBlock
        questions={blockQuestions}
        onAnswer={handleAnswer}
        onBlockComplete={handleBlockComplete}
        answers={blockAnswers}
        paused={paused}
      />
    </div>
  );
};

export default BlockTestRunner; 