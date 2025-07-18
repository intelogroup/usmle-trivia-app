import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useCustomQuizSetup } from '../hooks/useCustomQuizSetup'
import ModeToggle from '../components/quiz/setup/ModeToggle'
import SimpleModeSetup from '../components/quiz/setup/SimpleModeSetup'
import AdvancedModeSetup from '../components/quiz/setup/AdvancedModeSetup'

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const TIMING_OPTIONS = [
  { value: 'timed', label: 'Timed (1 min/question)' },
  { value: 'self', label: 'Self-paced' },
]

/**
 * Refactored Custom Quiz Setup Component
 * Reduced from 420+ lines to under 100 lines by extracting components and logic
 * Follows the 250-line rule from augment-code-rules.md
 */
const CustomQuizSetup = () => {
  const navigate = useNavigate()
  
  const {
    // State
    isSimpleMode,
    subjects,
    systems,
    topics,
    selectedSubject,
    selectedSystem,
    selectedTopic,
    difficulty,
    questionCount,
    timing,
    loading,
    error,
    questionCounts,
    availableQuestions,
    simpleCategories,
    canStart,
    
    // Actions
    setIsSimpleMode,
    setSelectedSubject,
    setSelectedSystem,
    setSelectedTopic,
    setDifficulty,
    setQuestionCount,
    setTiming,
    createNavigationState
  } = useCustomQuizSetup()

  const handleStart = (e) => {
    e.preventDefault()
    if (!canStart) return
    
    const navigationState = createNavigationState()
    navigate('/custom-quiz', { state: navigationState })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <form
        onSubmit={handleStart}
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
        aria-label="Custom Quiz Setup"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Custom Quiz Setup
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Select your desired filters and options to create a personalized quiz session.
        </p>

        <ModeToggle 
          isSimpleMode={isSimpleMode} 
          onModeChange={setIsSimpleMode} 
        />

        {error && (
          <div className="text-red-600 bg-red-100 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        {isSimpleMode ? (
          <SimpleModeSetup
            simpleCategories={simpleCategories}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            difficultyOptions={DIFFICULTY_OPTIONS}
          />
        ) : (
          <AdvancedModeSetup
            subjects={subjects}
            systems={systems}
            topics={topics}
            selectedSubject={selectedSubject}
            selectedSystem={selectedSystem}
            selectedTopic={selectedTopic}
            onSubjectChange={setSelectedSubject}
            onSystemChange={setSelectedSystem}
            onTopicChange={setSelectedTopic}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            timing={timing}
            onTimingChange={setTiming}
            questionCounts={questionCounts}
            availableQuestions={availableQuestions}
            difficultyOptions={DIFFICULTY_OPTIONS}
            timingOptions={TIMING_OPTIONS}
            loading={loading}
          />
        )}

        <button
          type="submit"
          disabled={!canStart || (!isSimpleMode && availableQuestions === 0)}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            canStart && (isSimpleMode || availableQuestions > 0) 
              ? 'bg-green-600 hover:bg-green-700 shadow-lg' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Start Custom Quiz
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default CustomQuizSetup
