import { motion } from 'framer-motion'
import { ChevronRight, Activity } from 'lucide-react'
import { getMedicalIcon, getCategoryColor } from '../../data/medicalIcons'
import IconWrapper from './IconWrapper'

const CategoryCard = ({ title, description, icon, color, progress, questionCount, onClick, delay = 0, type }) => {
  // Get the appropriate icon - prioritize medical icon mapping over passed icon
  const IconComponent = getMedicalIcon(title, icon)
  
  // Get the appropriate color - prioritize passed color, then category-specific color, then type-based color
  const cardColor = color || getCategoryColor(title, type)
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success-500'
    if (progress >= 60) return 'bg-warning-500'
    if (progress >= 40) return 'bg-orange-500'
    return 'bg-danger-500'
  }

  return (
    <motion.button
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white dark:bg-expo-850 rounded-xl p-3 shadow-card dark:shadow-card-dark hover:shadow-card-hover dark:hover:shadow-card-dark-hover text-left transition-all duration-200 border border-gray-50 dark:border-expo-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${cardColor}`}>
            <IconWrapper icon={IconComponent} fallback={Activity} size={18} className="text-white" data-lucide={icon ? icon.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : undefined} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-dark-50 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-dark-400">{questionCount} questions</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-400 dark:text-dark-400 mt-0.5" />
      </div>
      
      <p className="text-xs text-gray-600 dark:text-dark-300 mb-3 leading-relaxed">{description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="bg-gray-200 dark:bg-expo-700 rounded-full h-2 mr-2 overflow-hidden">
            <motion.div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: delay + 0.2, duration: 0.6 }}
            />
          </div>
        </div>
        <span className="text-xs font-bold text-gray-700 dark:text-dark-200">{progress}%</span>
      </div>
    </motion.button>
  )
}

export default CategoryCard 