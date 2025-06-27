import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'

const StudyTipsSection = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  const studyTips = [
    "Review your incorrect answers immediately after each quiz to reinforce learning.",
    "Focus on understanding concepts rather than memorizing isolated facts.",
    "Practice with timed quizzes to simulate real exam conditions.",
    "Take breaks every 45-60 minutes to maintain peak concentration.",
    "Study high-yield topics that frequently appear on the USMLE Step 1.",
    "Use spaced repetition to review previously learned material.",
    "Form study groups to discuss difficult concepts with peers."
  ]

  // Auto-advance tips every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % studyTips.length)
    }, 15000)

    return () => clearInterval(interval)
  }, [studyTips.length])

  const goToPreviousTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + studyTips.length) % studyTips.length)
  }

  const goToNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % studyTips.length)
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-8 border border-yellow-200 dark:border-yellow-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-400 rounded-lg mr-3">
            <Lightbulb className="w-5 h-5 text-yellow-900" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Study Tip</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousTip}
            className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentTipIndex + 1} / {studyTips.length}
          </span>
          <button
            onClick={goToNextTip}
            className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      <div className="relative min-h-[60px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTipIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-gray-700 dark:text-gray-200 leading-relaxed"
          >
            {studyTips[currentTipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {studyTips.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentTipIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentTipIndex 
                ? 'bg-yellow-500' 
                : 'bg-yellow-200 dark:bg-yellow-700 hover:bg-yellow-300 dark:hover:bg-yellow-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default StudyTipsSection 