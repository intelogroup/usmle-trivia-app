import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAllQuestionCounts, getAvailableQuestionCount } from '../services/questions/questionCountService';

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const TIMING_OPTIONS = [
  { value: 'timed', label: 'Timed (1 min/question)' },
  { value: 'self', label: 'Self-paced' },
];

const CustomQuizSetup = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [systems, setSystems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timing, setTiming] = useState('timed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({
    subjects: {},
    systems: {},
    topics: {}
  });
  const [availableQuestions, setAvailableQuestions] = useState(0);

  // Fetch subjects, systems, topics from Supabase (tags table)
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch subjects
        const { data: subjectTags, error: subjectError } = await supabase
          .from('tags')
          .select('*')
          .eq('type', 'subject')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (subjectError) throw subjectError;
        setSubjects(subjectTags || []);

        // Fetch systems
        const { data: systemTags, error: systemError } = await supabase
          .from('tags')
          .select('*')
          .eq('type', 'system')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (systemError) throw systemError;
        setSystems(systemTags || []);

        // Fetch topics
        const { data: topicTags, error: topicError } = await supabase
          .from('tags')
          .select('*')
          .eq('type', 'topic')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (topicError) throw topicError;
        setTopics(topicTags || []);

        // Fetch question counts
        const counts = await getAllQuestionCounts();
        setQuestionCounts(counts);
      } catch (e) {
        setError(e.message || 'Failed to load quiz options.');
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Update available question count when selections change
  useEffect(() => {
    const updateAvailableCount = async () => {
      if (selectedSubject && selectedSystem) {
        const count = await getAvailableQuestionCount(selectedSubject, selectedSystem, selectedTopic);
        setAvailableQuestions(count);
      } else {
        setAvailableQuestions(0);
      }
    };
    updateAvailableCount();
  }, [selectedSubject, selectedSystem, selectedTopic]);

  // Filter topics by selected subject/system if desired
  const filteredTopics = topics.filter(
    t => (!selectedSubject || t.parent_id === selectedSubject) && (!selectedSystem || t.parent_id === selectedSystem)
  );

  const canStart = selectedSubject && selectedSystem && questionCount > 0 && questionCount <= 40 && availableQuestions > 0;

  const handleStart = (e) => {
    e.preventDefault();
    if (!canStart) return;
    navigate('/custom-quiz', {
      state: {
        subjectId: selectedSubject,
        systemId: selectedSystem,
        topicId: selectedTopic || null,
        difficulty,
        questionCount,
        timing,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <form
        onSubmit={handleStart}
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
        aria-label="Custom Quiz Setup"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Custom Quiz Setup</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Select your desired filters and options to create a personalized quiz session.</p>

        {error && <div className="text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded">{error}</div>}
        {loading && <div className="text-gray-500">Loading options...</div>}

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">Subject <span className="text-red-500">*</span></label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
            required
          >
            <option value="">Select a subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({questionCounts.subjects[s.id] || 0} questions)
              </option>
            ))}
          </select>
        </div>

        {/* System */}
        <div>
          <label htmlFor="system" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">System <span className="text-red-500">*</span></label>
          <select
            id="system"
            value={selectedSystem}
            onChange={e => setSelectedSystem(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
            required
          >
            <option value="">Select a system</option>
            {systems.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({questionCounts.systems[s.id] || 0} questions)
              </option>
            ))}
          </select>
        </div>

        {/* Topic (optional) */}
        <div>
          <label htmlFor="topic" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">Topic (optional)</label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          >
            <option value="">All topics</option>
            {filteredTopics.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({questionCounts.topics[t.id] || 0} questions)
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
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

        {/* Number of Questions */}
        <div>
          <label htmlFor="questionCount" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">Number of Questions</label>
          <input
            id="questionCount"
            type="number"
            min={1}
            max={40}
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          />
          <span className="text-xs text-gray-500">1–40 questions</span>
        </div>

        {/* Timing */}
        <div>
          <label htmlFor="timing" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">Timing</label>
          <select
            id="timing"
            value={timing}
            onChange={e => setTiming(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          >
            {TIMING_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Available Questions Display */}
        {selectedSubject && selectedSystem && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Available Questions:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {availableQuestions}
              </span>
            </div>
            {availableQuestions === 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                No questions available for this combination. Try selecting different options.
              </p>
            )}
            {availableQuestions > 0 && questionCount > availableQuestions && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Requested {questionCount} questions, but only {availableQuestions} available.
                Quiz will include all available questions.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!canStart || availableQuestions === 0}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${canStart && availableQuestions > 0 ? 'bg-green-600 hover:bg-green-700 shadow-lg' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Start Quiz <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default CustomQuizSetup; 