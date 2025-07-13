import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Brain, Heart, Activity, Stethoscope, Pill, Microscope, Baby, Eye, TestTube, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

// Icon mapping for medical subjects
const SUBJECT_ICONS = {
  'Cardiology': Heart,
  'Dermatology': Activity,
  'Endocrinology': TestTube,
  'Gastroenterology': Activity,
  'Hematology': TestTube,
  'Infectious disease': Microscope,
  'Neurology': Brain,
  'Obstetrics and gynecology': Baby,
  'Oncology': Activity,
  'Orthopedics': Activity,
  'Ophthalmology': Eye,
  'Pharmacology': Pill,
  'Psychiatry': Brain,
  'Pulmonology': Activity,
  'Urology': Activity,
};

const CustomQuizSetup = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timing, setTiming] = useState('timed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subjects from Supabase tags table
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: subjectTags, error: subjectError } = await supabase
          .from('tags')
          .select('id, name, type')
          .eq('type', 'subject')
          .eq('is_active', true)
          .order('name', { ascending: true });
        
        if (subjectError) throw subjectError;
        
        // Add mixed option at the beginning
        const allSubjects = [
          { id: 'mixed', name: 'Mixed Categories', type: 'mixed' },
          ...(subjectTags || [])
        ];
        
        setSubjects(allSubjects);
        setSelectedSubject('mixed'); // Default to mixed
      } catch (e) {
        console.error('Error fetching subjects:', e);
        setError(e.message || 'Failed to load quiz options.');
        // Fallback to basic options if database fails
        setSubjects([
          { id: 'mixed', name: 'Mixed Categories', type: 'mixed' },
          { id: 'cardiology', name: 'Cardiology', type: 'subject' },
          { id: 'neurology', name: 'Neurology', type: 'subject' },
        ]);
        setSelectedSubject('mixed');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const canStart = selectedSubject && questionCount > 0 && questionCount <= 40;

  const handleStart = (e) => {
    e.preventDefault();
    if (!canStart) return;
    
    navigate('/custom-quiz', {
      state: {
        categoryId: selectedSubject === 'mixed' ? 'mixed' : selectedSubject,
        difficulty,
        questionCount,
        timing,
      },
    });
  };

  const IconComponent = selectedSubject && SUBJECT_ICONS[subjects.find(s => s.id === selectedSubject)?.name] || Activity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <form
        onSubmit={handleStart}
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
        aria-label="Custom Quiz Setup"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Quiz Setup</h1>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">Select your desired filters and options to create a personalized quiz session.</p>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-gray-500 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading subjects...
          </div>
        )}

        {/* Subject Selection */}
        <div>
          <label htmlFor="subject" className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="subject"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <IconComponent className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="difficulty" className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {DIFFICULTY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Number of Questions */}
        <div>
          <label htmlFor="questionCount" className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
            Number of Questions
          </label>
          <input
            id="questionCount"
            type="number"
            min={1}
            max={40}
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <span className="text-xs text-gray-500 mt-1 block">1–40 questions</span>
        </div>

        {/* Timing */}
        <div>
          <label htmlFor="timing" className="block font-medium text-gray-800 dark:text-gray-200 mb-2">
            Timing
          </label>
          <select
            id="timing"
            value={timing}
            onChange={e => setTiming(e.target.value)}
            className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {TIMING_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          disabled={!canStart || loading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            canStart && !loading 
              ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </>
          ) : (
            <>
              Start Quiz <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomQuizSetup;