import React from 'react'
import { motion } from 'framer-motion'

/**
 * Simple Mode Setup Component
 * Provides an easy-to-use interface for casual users
 */
const SimpleModeSetup = ({
  simpleCategories,
  selectedSubject,
  onSubjectChange,
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  difficultyOptions
}) => {
  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <label className="block font-medium text-gray-800 dark:text-gray-200 mb-3">
          Select Category
        </label>
        <div className="grid grid-cols-1 gap-3">
          {simpleCategories.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubjectChange(cat.id)}
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
            </motion.button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div>
        <label htmlFor="questionCount" className="block font-medium text-gray-800 dark:text-gray-200 mb-3">
          Number of Questions
        </label>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="5"
              max="40"
              value={questionCount}
              onChange={(e) => onQuestionCountChange(Number(e.target.value))}
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Estimated time: {Math.round((questionCount * 60) / 60)} minutes
          </p>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block font-medium text-gray-800 dark:text-gray-200 mb-3">
          Difficulty Level
        </label>
        <div className="grid grid-cols-2 gap-3">
          {difficultyOptions.map((diff) => (
            <motion.button
              key={diff.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDifficultyChange(diff.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                difficulty === diff.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {diff.label}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimpleModeSetup
