import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const ActionsSection = ({ quickActions }) => {
  return (
    <div className="w-full">
      <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-3 md:mb-6 lg:mb-8">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {quickActions.map((action, index) => (
          <ActionCard 
            key={action.title} 
            {...action}
            delay={index * 0.1} 
          />
        ))}
      </div>
    </div>
  )
}

const ActionCard = ({ icon: Icon, title, subtitle, color, iconColor, action, delay, timeEstimate, difficulty, description, progress, recommended, lastUsed, disabled }) => {
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'Medium': case 'Mixed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'Hard': case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'Custom': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
      case 'Adaptive': case 'All levels': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getIconBgColor = (colorProp) => {
    if (colorProp.includes('purple')) return 'bg-purple-100 dark:bg-purple-900/20'
    if (colorProp.includes('blue')) return 'bg-blue-100 dark:bg-blue-900/20'
    if (colorProp.includes('green')) return 'bg-green-100 dark:bg-green-900/20'
    if (colorProp.includes('red')) return 'bg-red-100 dark:bg-red-900/20'
    if (colorProp.includes('orange')) return 'bg-orange-100 dark:bg-orange-900/20'
    if (colorProp.includes('yellow')) return 'bg-yellow-100 dark:bg-yellow-900/20'
    if (colorProp.includes('gray')) return 'bg-gray-100 dark:bg-gray-900/20'
    return 'bg-gray-100 dark:bg-gray-900/20'
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={!disabled ? { scale: 1.01, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={!disabled ? action : undefined}
      className={`bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer group relative overflow-hidden ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      
      {/* Progress background */}
      {progress > 0 && !disabled && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent dark:via-purple-900/10"
          style={{ 
            width: `${progress}%`,
            opacity: 0.3
          }}
        />
      )}
      
      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className={`p-2 sm:p-3 rounded-lg ${!disabled ? 'group-hover:scale-110' : ''} transition-transform duration-300 ${getIconBgColor(color)} mb-2`}>
            <Icon size={20} className={`${iconColor} sm:w-6 sm:h-6`} />
          </div>
          
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs mt-1">{subtitle}</p>
        </div>
        
        {/* Additional Info - Only show on larger screens */}
        <div className="hidden sm:block">
          {description && (
            <p className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs text-center line-clamp-2 mb-2">
              {description}
            </p>
          )}
          
          {/* Bottom info */}
          <div className="flex items-center justify-between gap-1">
            {difficulty && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            )}
            
            {timeEstimate && !difficulty && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {timeEstimate}
              </span>
            )}
            
            <ChevronRight size={12} className={`text-gray-400 dark:text-gray-500 ${!disabled ? 'group-hover:text-gray-600 dark:group-hover:text-gray-300' : ''} transition-colors duration-300 ml-auto`} />
          </div>
        </div>
        
        {/* Mobile simplified info */}
        <div className="sm:hidden">
          {timeEstimate && (
            <p className="text-[10px] text-gray-500 text-center mt-1">
              {timeEstimate}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ActionsSection 