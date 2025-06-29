import React from 'react';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

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

function getTopicBreakdown(questions, answers) {
  const map = {};
  questions.forEach((q, i) => {
    const topic = q.topic || q.system || q.subject || 'Other';
    if (!map[topic]) map[topic] = { topic, correct: 0, total: 0 };
    map[topic].total++;
    if (answers[i]?.isCorrect) map[topic].correct++;
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

const COLORS = ['#06b6d4', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#eab308'];

const TimedTestResults = ({ questions, answers, timeLeft, onRestart, onGoHome }) => {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = Math.round((correctCount / questions.length) * 100);
  const timeUsed = questions.length * 90 - timeLeft;
  const streaks = getStreaks(answers);
  const topicData = getTopicBreakdown(questions, answers);
  const timeData = getTimePerQuestion(answers);

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-xl p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-2">Timed Test Results</h2>
      <div className="flex flex-wrap gap-6 justify-center mb-6 w-full">
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-green-600 dark:text-green-400">{correctCount}</span>
          <span className="text-sm text-slate-600 dark:text-slate-300">Correct</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{accuracy}%</span>
          <span className="text-sm text-slate-600 dark:text-slate-300">Accuracy</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{formatTime(timeUsed)}</span>
          <span className="text-sm text-slate-600 dark:text-slate-300">Time Used</span>
        </div>
      </div>
      {/* --- Analytics Section --- */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow">
        <h3 className="text-lg font-bold mb-2">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-1">Per-topic Breakdown</div>
            <ResponsiveContainer width="100%" height={140}>
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
            <ResponsiveContainer width="100%" height={140}>
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
      <div className="w-full overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border rounded-xl overflow-hidden">
          <thead className="bg-cyan-100 dark:bg-cyan-900/40">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Question</th>
              <th className="px-3 py-2">Your Answer</th>
              <th className="px-3 py-2">Correct</th>
              <th className="px-3 py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              const ans = answers[i];
              const userOpt = q.options?.find((o) => o.id === ans?.selectedOption);
              const correctOpt = q.options?.find((o) => o.id === q.correct_option_id);
              return (
                <tr key={q.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-mono">{i + 1}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={q.question_text}>{q.question_text}</td>
                  <td className="px-3 py-2">{userOpt ? userOpt.text : <span className="italic text-slate-400">No answer</span>}</td>
                  <td className="px-3 py-2">{correctOpt ? correctOpt.text : '-'}</td>
                  <td className="px-3 py-2">
                    {ans?.isCorrect ? (
                      <CheckCircle className="inline text-green-500" size={18} title="Correct" />
                    ) : (
                      <XCircle className="inline text-red-500" size={18} title="Incorrect" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-2">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
          onClick={onRestart}
        >
          <RotateCcw size={20} /> Restart
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          onClick={onGoHome}
        >
          <Home size={20} /> Home
        </button>
      </div>
    </div>
  );
};

export default TimedTestResults; 