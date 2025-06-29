import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#06b6d4', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#eab308'];

function getStreaks(answers) {
  let maxCorrect = 0, maxWrong = 0, curCorrect = 0, curWrong = 0;
  answers.forEach(a => {
    if (a.isCorrect) {
      curCorrect++;
      maxCorrect = Math.max(maxCorrect, curCorrect);
      curWrong = 0;
    } else {
      curWrong++;
      maxWrong = Math.max(maxWrong, curWrong);
      curCorrect = 0;
    }
  });
  return { maxCorrect, maxWrong };
}

function getTopicBreakdown(answers) {
  const map = {};
  answers.forEach(a => {
    const topic = a.topic || a.system || a.subject || 'Other';
    if (!map[topic]) map[topic] = { topic, correct: 0, total: 0 };
    map[topic].total++;
    if (a.isCorrect) map[topic].correct++;
  });
  return Object.values(map);
}

function getTimePerQuestion(answers) {
  return answers.map((a, i) => ({
    q: i + 1,
    time: a.timeSpent || 0,
    correct: a.isCorrect,
  }));
}

/**
 * BlockTestResults - Shows results after all blocks are complete
 * @param {object} results - { answers, session }
 * @param {function} onRestart
 */
const BlockBreakdown = ({ answers, session }) => {
  const numBlocks = session?.settings?.numBlocks || 1;
  const perBlock = session?.settings?.questionsPerBlock || 1;
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Per-Block Breakdown</h3>
      <div className="space-y-2">
        {Array.from({ length: numBlocks }).map((_, i) => {
          const blockAnswers = answers.filter(a => a.block === i);
          const correct = blockAnswers.filter(a => a.isCorrect).length;
          return (
            <div key={i} className="mb-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Block {i + 1}</span>
                <span>{correct} / {blockAnswers.length} correct</span>
              </div>
              <div className="w-full bg-gray-100 rounded h-2">
                <div className="bg-green-500 h-2 rounded" style={{ width: `${(correct / (blockAnswers.length || 1)) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReviewAnswers = ({ answers }) => (
  <div className="mt-4 text-left">
    <h4 className="font-semibold mb-2">Review Answers</h4>
    <div className="space-y-2">
      {answers.map((a, i) => (
        <div key={i} className="p-2 rounded bg-gray-50 border flex flex-col md:flex-row md:items-center gap-2">
          <span className="font-bold">Q{i + 1}:</span>
          <span className="flex-1">{a.questionText || a.question_text}</span>
          <span className={a.isCorrect ? 'text-green-600' : 'text-red-600'}>{a.isCorrect ? '✔️' : '❌'}</span>
        </div>
      ))}
    </div>
  </div>
);

const BlockTestResults = ({ results, onRestart }) => {
  const { answers, session } = results || {};
  const total = answers?.length || 0;
  const correct = answers?.filter(a => a.isCorrect).length || 0;
  const [displayScore, setDisplayScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    let n = 0;
    const interval = setInterval(() => {
      n++;
      setDisplayScore(Math.min(n, correct));
      if (n >= correct) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [correct]);

  const handleShare = () => {
    const text = `I scored ${correct}/${total} on USMLE Block Test!`;
    navigator.clipboard.writeText(text);
    alert('Score copied to clipboard!');
  };

  // --- Analytics ---
  const streaks = getStreaks(answers);
  const topicData = getTopicBreakdown(answers);
  const timeData = getTimePerQuestion(answers);

  return (
    <motion.div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg text-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-2xl font-bold mb-2">Block Test Complete!</h2>
      <div className="mb-4 text-3xl font-extrabold text-green-600">
        <AnimatePresence>
          <motion.span key={displayScore} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            {displayScore}
          </motion.span>
        </AnimatePresence>
        <span className="text-gray-700 font-normal text-xl"> / {total}</span>
      </div>
      <BlockBreakdown answers={answers} session={session} />
      {/* --- Analytics Section --- */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow text-left">
        <h3 className="text-lg font-bold mb-2">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-1">Per-topic Breakdown</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={topicData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="topic" fontSize={12} tick={{ fill: '#64748b' }} interval={0} angle={-15} dy={10} />
                <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip formatter={(v, n) => n === 'correct' ? `${v} correct` : v} />
                <Bar dataKey="correct" fill="#06b6d4">
                  {topicData.map((entry, idx) => <Cell key={entry.topic} fill={COLORS[idx % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="font-semibold mb-1">Time per Question (s)</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={timeData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="q" fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip formatter={v => `${v}s`} />
                <Bar dataKey="time" fill="#6366f1">
                  {timeData.map((entry, idx) => <Cell key={entry.q} fill={entry.correct ? '#10b981' : '#f43f5e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl px-4 py-2 font-semibold">Longest Correct Streak: <span className="text-green-600">{streaks.maxCorrect}</span></div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 font-semibold">Longest Incorrect Streak: <span className="text-red-600">{streaks.maxWrong}</span></div>
          {/* TODO: Add more analytics (accuracy over time, pie chart, etc.) */}
        </div>
      </motion.div>
      <div className="flex gap-2 justify-center mb-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition" onClick={onRestart}>Restart</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition" onClick={handleShare}>Share</button>
        <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition" onClick={() => setShowReview(r => !r)}>{showReview ? 'Hide' : 'Review'}</button>
      </div>
      <AnimatePresence>{showReview && <ReviewAnswers answers={answers} />}</AnimatePresence>
      {/* TODO: Add export to PDF/CSV, advanced review */}
    </motion.div>
  );
};

export default BlockTestResults; 