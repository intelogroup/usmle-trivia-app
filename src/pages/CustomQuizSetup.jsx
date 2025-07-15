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

  // Add simple mode toggle
  const [isSimpleMode, setIsSimpleMode] = useState(true);

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

  // Simple mode categories
  const simpleCategories = [
    { id: 'mixed', name: 'Mixed Questions', icon: '🎯', description: 'Questions from all medical subjects' },
    { id: 'cardiology', name: 'Cardiology', icon: '❤️', description: 'Heart and cardiovascular system' },
    { id: 'neurology', name: 'Neurology', icon: '🧠', description: 'Brain and nervous system' },
    { id: 'respiratory', name: 'Respiratory', icon: '🫁', description: 'Lungs and breathing system' },
    { id: 'gastroenterology', name: 'Gastroenterology', icon: '🫃', description: 'Digestive system' },
    { id: 'endocrinology', name: 'Endocrinology', icon: '🩺', description: 'Hormones and metabolism' },
    { id: 'infectious', name: 'Infectious Disease', icon: '🦠', description: 'Infections and immunity' },
    { id: 'pharmacology', name: 'Pharmacology', icon: '💊', description: 'Medications and treatments' }
  ];

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

  const canStart = isSimpleMode
    ? selectedSubject && questionCount > 0 && questionCount <= 40
    : selectedSubject && selectedSystem && questionCount > 0 && questionCount <= 40 && availableQuestions > 0;

  const handleStart = (e) => {
    e.preventDefault();
    if (!canStart) return;

    if (isSimpleMode) {
      // Simple mode navigation
      navigate('/custom-quiz', {
        state: {
          categoryId: selectedSubject,
          categoryName: simpleCategories.find(c => c.id === selectedSubject)?.name || 'Mixed Questions',
          questionCount,
          difficulty: difficulty || null,
          timePerQuestion: 60,
          quizMode: 'custom',
          autoAdvance: true,
          showExplanations: true
        },
      });
    } else {
      // Advanced mode navigation
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
    }
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

        {/* Mode Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
            <button
              type="button"
              onClick={() => setIsSimpleMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isSimpleMode
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Simple Mode
            </button>
            <button
              type="button"
              onClick={() => setIsSimpleMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isSimpleMode
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded">{error}</div>}
        {loading && <div className="text-gray-500">Loading options...</div>}

        {/* Simple Mode */}
        {isSimpleMode ? (
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200 mb-3">Select Category</label>
              <div className="grid grid-cols-1 gap-3">
                {simpleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedSubject(cat.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedSubject === cat.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{cat.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cat.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label htmlFor="questionCount" className="block font-medium text-gray-800 dark:text-gray-200 mb-3">Number of Questions</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 min-w-[3rem] text-center">
                  {questionCount}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span>5 questions</span>
                <span>40 questions</span>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-medium text-gray-800 dark:text-gray-200 mb-3">Difficulty Level</label>
              <div className="grid grid-cols-2 gap-3">
                {DIFFICULTY_OPTIONS.map((diff) => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setDifficulty(diff.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      difficulty === diff.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {diff.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Advanced Mode */
          <div className="space-y-6">

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

        </div>
        )}

        <button
          type="submit"
          disabled={!canStart || (!isSimpleMode && availableQuestions === 0)}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${canStart && (isSimpleMode || availableQuestions > 0) ? 'bg-green-600 hover:bg-green-700 shadow-lg' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Start Quiz <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default CustomQuizSetup; 