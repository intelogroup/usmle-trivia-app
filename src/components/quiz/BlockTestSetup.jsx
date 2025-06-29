import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createBlockTestSession } from '../../services/questionService';

const BLOCK_OPTIONS = [2, 4, 6, 8];
const QUESTION_OPTIONS = [20, 30, 40, 50];
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const CardSelector = ({ options, value, onChange, label }) => (
  <div className="flex gap-3 flex-wrap mb-2">
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        className={`px-4 py-2 rounded-xl border transition-all shadow-sm font-semibold text-lg ${value === opt ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white border-gray-300 hover:bg-blue-50'}`}
        onClick={() => onChange(opt)}
        aria-pressed={value === opt}
      >
        {opt}
      </button>
    ))}
  </div>
);

/**
 * BlockTestSetup - Setup form for block test mode
 * @param {function} onComplete - called with session data on success
 */
const BlockTestSetup = ({ onComplete }) => {
  const [numBlocks, setNumBlocks] = useState(4);
  const [questionsPerBlock, setQuestionsPerBlock] = useState(40);
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalQuestions = numBlocks * questionsPerBlock;
  const estMinutes = numBlocks * (questionsPerBlock + 5); // 1 min/q + 5 min bonus per block

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: Get userId from context/auth
      const userId = window?.supabase?.auth?.user?.()?.id || null;
      if (!userId) throw new Error('User not logged in');
      const session = await createBlockTestSession({
        userId,
        numBlocks,
        questionsPerBlock,
        totalQuestions,
        settings: { difficulty },
      });
      onComplete(session);
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-blue-600" />
        <div className="h-0.5 w-8 bg-blue-300" />
        <div className="w-3 h-3 rounded-full bg-blue-300" />
        <div className="h-0.5 w-8 bg-blue-300" />
        <div className="w-3 h-3 rounded-full bg-blue-300" />
        <span className="ml-3 text-sm text-blue-700 font-medium">Step 1 of 3: Configure Block Test</span>
      </div>
      <div>
        <label className="block font-medium mb-1">Number of Blocks</label>
        <CardSelector options={BLOCK_OPTIONS} value={numBlocks} onChange={setNumBlocks} />
      </div>
      <div>
        <label className="block font-medium mb-1">Questions per Block</label>
        <CardSelector options={QUESTION_OPTIONS} value={questionsPerBlock} onChange={setQuestionsPerBlock} />
      </div>
      <div>
        <label className="block font-medium mb-1">Difficulty</label>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-2 border rounded">
          {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="text-sm text-gray-600">Total: <b>{totalQuestions}</b> questions • Est. <b>{estMinutes}</b> min</div>
      {error && <div className="text-red-600">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition" disabled={loading}>
        {loading ? 'Starting...' : 'Start Block Test'}
      </button>
    </motion.form>
  );
};

export default BlockTestSetup; 