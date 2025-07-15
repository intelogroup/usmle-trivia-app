import React from 'react'

/**
 * Advanced Mode Setup Component
 * Provides detailed filtering options for power users
 */
const AdvancedModeSetup = ({
  subjects,
  systems,
  topics,
  selectedSubject,
  selectedSystem,
  selectedTopic,
  onSubjectChange,
  onSystemChange,
  onTopicChange,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  timing,
  onTimingChange,
  questionCounts,
  availableQuestions,
  difficultyOptions,
  timingOptions,
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-gray-500">Loading options...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          id="subject"
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          required
        >
          <option value="">Select a subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({questionCounts.subjects[s.id] || 0} questions)
            </option>
          ))}
        </select>
      </div>

      {/* System */}
      <div>
        <label htmlFor="system" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
          System <span className="text-red-500">*</span>
        </label>
        <select
          id="system"
          value={selectedSystem}
          onChange={(e) => onSystemChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          disabled={!selectedSubject}
          required
        >
          <option value="">Select a system</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({questionCounts.systems[s.id] || 0} questions)
            </option>
          ))}
        </select>
      </div>

      {/* Topic */}
      <div>
        <label htmlFor="topic" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
          Topic (Optional)
        </label>
        <select
          id="topic"
          value={selectedTopic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
          disabled={!selectedSystem}
        >
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({questionCounts.topics[t.id] || 0} questions)
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty */}
      <div>
        <label htmlFor="difficulty" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
        >
          {difficultyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Number of Questions */}
      <div>
        <label htmlFor="questionCount" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
          Number of Questions
        </label>
        <input
          id="questionCount"
          type="number"
          min={1}
          max={40}
          value={questionCount}
          onChange={(e) => onQuestionCountChange(Number(e.target.value))}
          className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
        />
        <span className="text-xs text-gray-500">1–40 questions</span>
      </div>

      {/* Timing */}
      <div>
        <label htmlFor="timing" className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
          Timing
        </label>
        <select
          id="timing"
          value={timing}
          onChange={(e) => onTimingChange(e.target.value)}
          className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-2"
        >
          {timingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
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
  )
}

export default AdvancedModeSetup
