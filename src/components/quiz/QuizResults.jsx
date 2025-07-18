import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ResultsHeader from './ResultsHeader';
import ScoreCard from './ScoreCard';
import AchievementBadges from './AchievementBadges';
import DetailedReview from './DetailedReview';
import ActionButtons from './ActionButtons';
import QuizFeedback from './QuizFeedback';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFeedback } from '../../hooks/useFeedback';

function getStreaks(userAnswers) {
  let maxCorrect = 0, maxWrong = 0, curCorrect = 0, curWrong = 0;
  userAnswers.forEach(a => {
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

function getTopicBreakdown(userAnswers) {
  const map = {};
  userAnswers.forEach(a => {
    const topic = a.question.topic || a.question.system || a.question.subject || 'Other';
    if (!map[topic]) map[topic] = { topic, correct: 0, total: 0 };
    map[topic].total++;
    if (a.isCorrect) map[topic].correct++;
  });
  return Object.values(map);
}

function getTimePerQuestion(userAnswers) {
  return userAnswers.map((a, i) => ({
    q: i + 1,
    time: a.timeSpent || 0,
    correct: a.isCorrect,
  }));
}

const COLORS = ['#06b6d4', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#eab308'];

const QuizResults = ({ 
  score, 
  questionCount, 
  accuracy,
  userAnswers,
  quizSession,
  quizConfig,
  timeSpent,
  onRestart,
  onGoHome 
}) => {
  const {
    showFeedbackModal,
    currentQuizData,
    requestFeedback,
    submitFeedback,
    closeFeedbackModal,
    shouldRequestFeedback,
    isSubmitting
  } = useFeedback();

  // Request feedback when results are shown
  useEffect(() => {
    const quizData = {
      sessionId: quizSession?.id,
      score,
      totalQuestions: questionCount,
      accuracy,
      isCompleted: true,
      quizMode: quizConfig?.quizMode || 'quick',
      timeSpent
    };

    if (shouldRequestFeedback(quizData)) {
      // Delay feedback request to let user see results first
      setTimeout(() => {
        requestFeedback(quizData);
      }, 3000);
    }
  }, [score, questionCount, accuracy, quizSession, quizConfig, timeSpent, shouldRequestFeedback, requestFeedback]);
  const performance = (() => {
    if (accuracy >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100', message: 'Excellent! USMLE ready!' };
    if (accuracy >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100', message: 'Good job! Keep it up!' };
    if (accuracy >= 60) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100', message: 'Not bad! More practice needed!' };
    return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-100', message: 'Keep practicing! You\'ll improve!' };
  })();
  const pointsEarned = score * 10;
  const formattedTime = timeSpent ? `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}` : null;
  const streaks = getStreaks(userAnswers);
  const topicData = getTopicBreakdown(userAnswers);
  const timeData = getTimePerQuestion(userAnswers);

  const handleShare = () => {
    const shareText = `Just scored ${score}/${questionCount} (${accuracy}%) on a USMLE ${quizConfig?.quizMode || 'Quick'} Quiz! 🎉`;
    if (navigator.share) {
      navigator.share({ title: 'USMLE Quiz Results', text: shareText, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(`${shareText} Check it out at ${window.location.origin}`);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <ResultsHeader accuracy={accuracy} performance={performance} />
          <ScoreCard score={score} questionCount={questionCount} accuracy={accuracy} performance={performance} />
          <AchievementBadges score={score} accuracy={accuracy} />
          {/* --- Analytics Section --- */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-8 shadow">
            <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold mb-1">Per-topic Breakdown</div>
                <ResponsiveContainer width="100%" height={180}>
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
                <ResponsiveContainer width="100%" height={180}>
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
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl px-4 py-2 font-semibold">Longest Correct Streak: <span className="text-green-600">{streaks.maxCorrect}</span></div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 font-semibold">Longest Incorrect Streak: <span className="text-red-600">{streaks.maxWrong}</span></div>
              {/* TODO: Add more analytics (accuracy over time, pie chart, etc.) */}
            </div>
          </motion.div>
          <DetailedReview userAnswers={userAnswers} />
          <ActionButtons accuracy={accuracy} onRestart={onRestart} onGoHome={onGoHome} handleShare={handleShare} />
        </motion.div>
      </div>
      
      {/* Feedback Modal */}
      <QuizFeedback
        isOpen={showFeedbackModal}
        onClose={closeFeedbackModal}
        onSubmit={submitFeedback}
        quizData={currentQuizData}
      />
    </div>
  );
};

export default QuizResults;
