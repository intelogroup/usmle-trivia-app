import React from 'react'

/**
 * Mode Toggle Component for Custom Quiz Setup
 * Allows switching between Simple and Advanced modes
 */
const ModeToggle = ({ isSimpleMode, onModeChange }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
        <button
          type="button"
          onClick={() => onModeChange(true)}
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
          onClick={() => onModeChange(false)}
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
  )
}

export default ModeToggle
