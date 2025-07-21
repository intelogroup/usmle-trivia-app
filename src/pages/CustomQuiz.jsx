import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home, Volume2, VolumeX } from 'lucide-react';
import { fetchQuestionsForUser, createQuizSession, recordQuizResponse, completeQuizSession } from '../services/questionService';
import QuizProgressBar from '../components/quiz/QuizProgressBar';
import QuizLoading from '../components/quiz/QuizLoading';
import QuizError from '../components/quiz/QuizError';
import { useAuth } from '../contexts/AuthContext';
import { useQuizSounds } from '../hooks/useQuizSounds';
import { useContextualNavigation } from '../hooks/useContextualNavigation';

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
        className={`h-3 rounded ${timeLeft < 10 ? 'bg-red-500' : timeLeft < total / 3 ? 'bg-yellow-400' : 'bg-blue-500'}`}
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

const CustomQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contextualBack, navigateToHome } = useContextualNavigation();
  const config = location.state;
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
  const [timeLeft, setTimeLeft] = useState(config?.timing === 'timed' ? 60 : null);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('quizMuted') === 'true');
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const timerRef = useRef();
  const { playCorrect, playWrong, playTimesUp, playNext, playComplete } = useQuizSounds(isMuted);

  // Fetch questions on mount
  useEffect(() => {
    if (!config) {
      setError({ code: 'NO_CONFIG', message: 'No quiz configuration found.' });
      setLoading(false);
      return;
    }
    setLoading(true);
    const categoryId = config.topicId || config.systemId || config.subjectId || 'mixed';
    fetchQuestionsForUser({
      userId: user.id,
      categoryId: categoryId,
      questionCount: config.questionCount,
      difficulty: config.difficulty,
    })
      .then(async (qs) => {
        if (!qs || qs.length < config.questionCount) {
          setError({ code: 'INSUFFICIENT_QUESTIONS_ERROR', message: `Not enough questions available for your selection. Only ${qs?.length || 0} found.` });
          setQuestions(qs || []);
          setLoading(false);
          return;
        }
        setQuestions(qs);
        setLoading(false);
        const session = await createQuizSession({
          userId: user.id,
          sessionType: 'custom',
          totalQuestions: qs.length,
          settings: config,
        });
        setQuizSessionId(session.id);
      })
      .catch((error) => {
        setError({ code: 'FETCH_ERROR', message: error?.message || 'Failed to load questions.' });
        setLoading(false);
      });
  }, [config, user, navigate]);

  // Timer logic for timed mode
  useEffect(() => {
    if (config?.timing !== 'timed' || showResults || loading) return;
    setTimeLeft(60);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setIsAnswered(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIdx, showResults, loading, config]);

  // Sound effects and animated feedback
  useEffect(() => {
    if (isAnswered && !timedOut) {
      if (selectedOption === questions[currentIdx]?.correct_option_id) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
        playCorrect();
      } else {
        playWrong();
      }
    }
    if (timedOut) playTimesUp();
  }, [isAnswered, timedOut, selectedOption, questions, currentIdx, playCorrect, playWrong, playTimesUp]);

  // Animated score reveal with completion sound
  useEffect(() => {
    if (showResults) {
      playComplete();
      let n = 0;
      const correct = answers.filter(a => a.isCorrect).length;
      const interval = setInterval(() => {
        n++;
        setDisplayScore(Math.min(n, correct));
        if (n >= correct) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [showResults, answers, playComplete]);

  // Handle answer selection
  const handleOptionSelect = useCallback(
    (optionId) => {
      if (isAnswered) return;
      setSelectedOption(optionId);
      setIsAnswered(true);
      setTimedOut(false);

      // Record the quiz response with correct parameter structure
      recordQuizResponse({
        sessionId: quizSessionId,
        userId: user.id,
        questionId: questions[currentIdx].id,
        selectedOptionId: optionId,
        isCorrect: optionId === questions[currentIdx].correct_option_id,
        timeSpent: config?.timing === 'timed' ? 60 - timeLeft : null,
        responseOrder: currentIdx + 1,
      }).catch(error => {
        console.error('Failed to record quiz response:', error);
        // Don't block the quiz flow if response recording fails
      });
    },
    [isAnswered, questions, currentIdx, quizSessionId, user, config, timeLeft]
  );

  // Handle next question
  const handleNext = useCallback(() => {
    setAnswers((prev) => [
      ...prev,
      {
        questionId: questions[currentIdx].id,
        selectedOption,
        isCorrect: selectedOption === questions[currentIdx].correct_option_id,
        timedOut,
        timeSpent: config?.timing === 'timed' ? 60 - timeLeft : null,
      },
    ]);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimedOut(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    } else {
      setShowResults(true);
      // Complete the quiz session with proper completion data
      if (quizSessionId) {
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const totalTimeSeconds = answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
        const pointsEarned = correctAnswers * 10; // 10 points per correct answer
        
        completeQuizSession(quizSessionId, {
          correctAnswers,
          totalTimeSeconds,
          pointsEarned,
          completed: true
        }).catch(error => {
          console.error('Failed to complete Custom Quiz session:', error);
        });
      }
    }
  }, [currentIdx, questions, selectedOption, timedOut, config, timeLeft, quizSessionId, answers]);

  // Mute toggle
  const toggleMute = () => {
    setIsMuted((m) => {
      localStorage.setItem('quizMuted', !m);
      return !m;
    });
  };

  // Results summary
  const correctCount = answers.filter((a) => a.isCorrect).length;

  if (loading) return <QuizLoading />;
  if (error) return <QuizError error={error} onRetry={() => window.location.reload()} />;
  if (!questions.length) return <QuizError error={{ code: 'NO_QUESTIONS', message: 'No questions found for this quiz.' }} onRetry={() => window.location.reload()} />;

  if (showResults) {
    return (
      <motion.div className="max-w-xl mx-auto mt-8 bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-xl p-8 flex flex-col items-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <div className="mb-4 text-3xl font-extrabold text-green-600">
          <AnimatePresence>
            <motion.span key={displayScore} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              {displayScore}
            </motion.span>
          </AnimatePresence>
          <span className="text-gray-700 font-normal text-xl"> / {questions.length}</span>
        </div>
        <button className="mt-4 px-6 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition" onClick={() => window.location.reload()}>Restart</button>
        <button className="mt-4 px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition" onClick={() => navigate('/quiz-tab')} aria-label="Go to Home">Home</button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIdx] || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-cyan-100 via-blue-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
      <div className="w-full max-w-xl mx-auto relative">
        {config?.timing === 'timed' && <TimerBar timeLeft={timeLeft} total={60} />}
        <QuizProgressBar current={currentIdx + 1} total={questions.length} secondsLeft={config?.timing === 'timed' ? timeLeft : null} />
        <div className="flex justify-between items-center mb-4">
          <button onClick={contextualBack} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors" aria-label="Go back to quiz setup">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <Volume2 className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
            </button>
            <button onClick={navigateToHome} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors" aria-label="Go to Home">
              <Home className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
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
                    aria-label={`Option ${idx + 1}: ${opt.text}`}
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
                      aria-label="Next Question"
                    >
                      {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
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
  );
};

export default CustomQuiz;