import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, Clock } from 'lucide-react';
import { fetchQuestionsForUser, createQuizSession, recordQuizResponse } from '../services/questionService';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuizLoading from '../components/quiz/QuizLoading';
import QuizError from '../components/quiz/QuizError';
import TimedTestResults from '../components/quiz/TimedTestResults';
import MobileQuizHeader from '../components/quiz/MobileQuizHeader';
import MobileOptionCard from '../components/quiz/MobileOptionCard';
import { useAuth } from '../contexts/AuthContext';
import { useQuizCompletion } from '../hooks/useQuizCompletion';

const ICONS = ['🅰️', '🅱️', '🇨', '🇩'];
const Confetti = ({ show }) => show ? (
  <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
    <span role="img" aria-label="confetti" className="text-5xl animate-bounce">🎉</span>
  </div>
) : null;

const TimerBar = ({ timeLeft, total }) => (
  <div className="sticky top-0 z-20 mb-4">
    <motion.div className="h-3 w-full bg-gray-200 rounded overflow-hidden">
      <motion.div
        className={`h-3 rounded ${timeLeft < 60 ? 'bg-red-500' : timeLeft < total / 3 ? 'bg-yellow-400' : 'bg-blue-500'}`}
        initial={{ width: '100%' }}
        animate={{ width: `${(timeLeft / total) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
    <div className="flex justify-between text-xs mt-1">
      <span>Time Left: <b>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</b></span>
    </div>
  </div>
);

const TimedTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { completeQuiz } = useQuizCompletion();
  const config = location.state || {};
  const questionCount = config.questionCount || 20;
  const difficulty = config.difficulty || '';
  const DEFAULT_TIME_PER_QUESTION = 90;
  const TOTAL_TIME = questionCount * DEFAULT_TIME_PER_QUESTION;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizSessionId, setQuizSessionId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('quizMuted') === 'true');
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const timerRef = useRef();

  // Fetch questions on mount
  useEffect(() => {
    setLoading(true);
    fetchQuestionsForUser({
      userId: user.id,
      questionCount,
      difficulty: difficulty || null,
    })
      .then(async (qs) => {
        if (!qs || qs.length < questionCount) {
          setError({
            code: 'NO_QUESTIONS',
            message: `Not enough questions available for your selection. Only ${qs?.length || 0} found.`,
          });
          setQuestions(qs || []);
          setLoading(false);
          return;
        }
        setQuestions(qs);
        setLoading(false);
        // Create quiz session with userId for RLS
        const session = await createQuizSession({
          userId: user.id,
          sessionType: 'timed_test',
          totalQuestions: qs.length,
          timePerQuestion: DEFAULT_TIME_PER_QUESTION,
          totalTimeLimit: TOTAL_TIME,
          settings: { mode: 'timed_test', totalTime: TOTAL_TIME, difficulty },
        });
        setQuizSessionId(session.id);
      })
      .catch((e) => {
        setError({ code: 'FETCH_ERROR', message: e?.message || 'Failed to load questions.' });
        setLoading(false);
      });
  }, [user, questionCount, difficulty, TOTAL_TIME]);

  // Timer logic
  useEffect(() => {
    if (showResults || loading) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setShowResults(true);
          // Calculate completion data for timeout
          const correctCount = answers.filter(a => a.isCorrect).length;
          const totalTime = TOTAL_TIME;
          const pointsEarned = correctCount * 2;
          
          completeQuiz(quizSessionId, {
            correctAnswers: correctCount,
            totalTimeSeconds: totalTime,
            pointsEarned,
            totalQuestions: questions.length,
            responses: answers
          }, user.id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [showResults, loading, quizSessionId, answers, questions.length, TOTAL_TIME, completeQuiz, user.id]);

  // Animated feedback
  useEffect(() => {
    if (isAnswered && !timedOut) {
      if (selectedOption === questions[currentIdx]?.correct_option_id) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
      }
    }
  }, [isAnswered, timedOut, selectedOption, questions, currentIdx]);

  // Animated score reveal
  useEffect(() => {
    if (showResults) {
      let n = 0;
      const correct = answers.filter(a => a.isCorrect).length;
      const interval = setInterval(() => {
        n++;
        setDisplayScore(Math.min(n, correct));
        if (n >= correct) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [showResults, answers]);

  // Handle answer selection
  const handleOptionSelect = useCallback(
    (optionId) => {
      if (isAnswered) return;
      const currentQ = questions[currentIdx];
      if (!currentQ || !currentQ.id) {
        setError({ code: 'INVALID_QUESTION', message: 'An internal error occurred: question is missing or invalid. Please restart the quiz.' });
        return;
      }
      setSelectedOption(optionId);
      setIsAnswered(true);
      setTimedOut(false);
      recordQuizResponse(quizSessionId, {
        userId: user.id,
        questionId: currentQ.id,
        selectedOptionId: optionId,
        isCorrect: optionId === currentQ.correct_option_id,
        timeSpentSeconds: null,
        responseOrder: currentIdx + 1,
      });
    },
    [isAnswered, questions, currentIdx, quizSessionId, user]
  );

  // Handle next question
  const handleNext = useCallback(() => {
    const currentQ = questions[currentIdx];
    if (!currentQ || !currentQ.id) {
      setError({ code: 'INVALID_QUESTION', message: 'An internal error occurred: question is missing or invalid. Please restart the quiz.' });
      return;
    }
    const newAnswers = [
      ...answers,
      {
        questionId: currentQ.id,
        selectedOption,
        isCorrect: selectedOption === currentQ.correct_option_id,
        timedOut,
      },
    ];
    setAnswers(newAnswers);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimedOut(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      setShowResults(true);
      // Calculate completion data
      const correctCount = newAnswers.filter(a => a.isCorrect).length;
      const totalTime = TOTAL_TIME - timeLeft;
      const pointsEarned = correctCount * 2;
      
      completeQuiz(quizSessionId, {
        correctAnswers: correctCount,
        totalTimeSeconds: totalTime,
        pointsEarned,
        totalQuestions: questions.length,
        responses: newAnswers
      }, user.id);
    }
  }, [currentIdx, questions, selectedOption, timedOut, quizSessionId, answers, timeLeft, TOTAL_TIME, completeQuiz, user.id]);

  // Mute toggle
  const toggleMute = () => {
    setIsMuted((m) => {
      localStorage.setItem('quizMuted', !m);
      return !m;
    });
  };

  // Results summary
  const correctCount = answers.filter((a) => a.isCorrect).length;

  // UI
  if (loading) return <QuizLoading />;
  if (error) return <QuizError error={error} onRetry={() => window.location.reload()} />;
  if (!questions.length) return <QuizError error={{ code: 'NO_QUESTIONS', message: 'No questions found for this test.' }} onRetry={() => window.location.reload()} />;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <MobileQuizHeader 
          title="Test Complete!"
          onBack={() => navigate('/timed-test-setup')}
          onHome={() => navigate('/quiz-tab')}
        />
        <div className="px-4 py-6">
          <motion.div className="max-w-xl mx-auto bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-xl p-6 flex flex-col items-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
            <div className="mb-4 text-3xl font-extrabold text-green-600">
              <AnimatePresence>
                <motion.span key={displayScore} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  {displayScore}
                </motion.span>
              </AnimatePresence>
              <span className="text-gray-700 font-normal text-xl"> / {questions.length}</span>
            </div>
            <TimedTestResults
              questions={questions}
              answers={answers}
              timeLeft={timeLeft}
              onRestart={() => window.location.reload()}
              onGoHome={() => navigate('/quiz-tab')}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx] || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-cyan-100 via-blue-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="w-full max-w-xl mx-auto relative">
        <TimerBar timeLeft={timeLeft} total={TOTAL_TIME} />
        <QuizProgressBar current={currentIdx + 1} total={questions.length} secondsLeft={timeLeft} />
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => navigate('/quiz-tab')} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors">
            <Home className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          {currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Confetti show={showConfetti} />
              <div className="mb-2 font-semibold">Question {currentIdx + 1} / {questions.length}</div>
              <div className="mb-4 text-lg font-medium">{currentQuestion.question_text}</div>
              <div className="space-y-2 mb-4">
                {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
                  <motion.button
                    key={opt.id}
                    className={`w-full flex items-center gap-3 text-left p-3 rounded-xl border transition-all font-semibold text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 ${selectedOption === opt.id
                      ? (opt.id === currentQuestion.correct_option_id
                        ? 'bg-green-100 border-green-400 scale-105'
                        : 'bg-red-100 border-red-400 shake')
                      : 'border-gray-200 hover:bg-cyan-50'} ${isAnswered ? 'pointer-events-none' : ''}`}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(opt.id)}
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
                      className="mt-4 w-full bg-cyan-600 text-white py-2 rounded-xl font-semibold text-lg shadow-lg hover:bg-cyan-700 transition"
                      onClick={handleNext}
                      data-next-btn
                    >
                      {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            !loading && (
              <div className="text-center text-gray-600 dark:text-gray-400 py-10">
                <p>No question available to display. Please try again or select a different category.</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            )
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TimedTest;
