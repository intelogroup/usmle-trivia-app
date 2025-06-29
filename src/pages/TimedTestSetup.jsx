import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Info } from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TimedTestSetup = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [error, setError] = useState(null);

  const handleStart = (e) => {
    e.preventDefault();
    if (questionCount < 10 || questionCount > 40) {
      setError('Please select between 10 and 40 questions.');
      return;
    }
    setError(null);
    navigate('/timed-test', {
      state: {
        difficulty,
        questionCount,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-blue-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <form
        onSubmit={handleStart}
        className="max-w-lg w-full bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock size={32} className="text-cyan-600" />
          <h1 className="text-2xl font-bold">Timed Test Setup</h1>
        </div>
        <ul className="text-slate-700 dark:text-slate-200 mb-6 text-base space-y-2 w-full">
          <li className="flex items-center gap-2"><Info size={18} className="text-cyan-500" /> Choose 10–40 questions from all categories</li>
          <li className="flex items-center gap-2"><Info size={18} className="text-cyan-500" /> 1.5 minutes per question (time scales with count)</li>
          <li className="flex items-center gap-2"><Info size={18} className="text-cyan-500" /> Select difficulty: Easy, Medium, Hard, or Mixed</li>
          <li className="flex items-center gap-2"><Info size={18} className="text-cyan-500" /> Manual advance: review answer, then click Next</li>
          <li className="flex items-center gap-2"><Info size={18} className="text-cyan-500" /> Explanations shown after each answer</li>
        </ul>
        <div className="w-full mb-4">
          <label htmlFor="difficulty" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          >
            {DIFFICULTY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="w-full mb-4">
          <label htmlFor="questionCount" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">Number of Questions</label>
          <input
            id="questionCount"
            type="number"
            min={10}
            max={40}
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          />
          <span className="text-xs text-gray-500">10–40 questions</span>
        </div>
        {error && <div className="text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded mb-2 w-full text-center">{error}</div>}
        <button
          className="mt-2 px-8 py-3 rounded-xl bg-cyan-600 text-white font-semibold text-lg shadow-lg hover:bg-cyan-700 transition w-full"
          type="submit"
        >
          Start Timed Test
        </button>
      </form>
    </div>
  );
};

export default TimedTestSetup;
