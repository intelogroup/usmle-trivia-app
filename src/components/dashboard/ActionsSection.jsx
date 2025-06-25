import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const ActionsSection = ({ quickActions }) => {
  return (
    <div className="w-full">
      <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-3 md:mb-6 lg:mb-8">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
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

const ActionCard = ({ icon: Icon, title, subtitle, color, iconColor, onPress, delay, timeEstimate, difficulty, description, progress, recommended, lastUsed }) => {
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'Medium': case 'Mixed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'Hard': case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
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
    return 'bg-gray-100 dark:bg-gray-900/20'
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onPress}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-3 md:p-4 lg:p-5 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer group relative overflow-hidden h-[120px] sm:h-[90px] md:h-[110px] lg:h-[130px] ${recommended ? 'ring-2 ring-blue-200 dark:ring-blue-800/50' : ''}`}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-blue-500 text-white text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium z-10">
          Recommended
        </div>
      )}
      
      {/* Progress background */}
      {progress > 0 && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent dark:via-purple-900/10"
          style={{ 
            width: `${progress}%`,
            opacity: 0.3
          }}
        />
      )}
      
      <div className="flex items-center gap-3 md:gap-4 h-full relative z-10">
        <div className={`p-2 md:p-3 lg:p-4 rounded-lg group-hover:scale-110 transition-transform duration-300 ${getIconBgColor(color)} flex-shrink-0`}>
          <Icon size={18} className={`${iconColor} md:w-5 md:h-5 lg:w-6 lg:h-6`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-200 truncate">{title}</h3>
            {timeEstimate && (
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap hidden lg:inline-block">
                {timeEstimate}
              </span>
            )}
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm lg:text-base mb-1 truncate">{subtitle}</p>
          
          {description && (
            <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm leading-relaxed truncate hidden md:block">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {difficulty && (
            <span className={`text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium ${getDifficultyColor(difficulty)} whitespace-nowrap hidden sm:inline-block`}>
              {difficulty}
            </span>
          )}
          
          {progress > 0 && (
            <div className="flex items-center gap-1 hidden lg:flex">
              <div className="w-8 md:w-12 h-1.5 md:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{progress}%</span>
            </div>
          )}
          
          <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 md:w-4 md:h-4" />
        </div>
      </div>
    </motion.div>
  )
}

export default ActionsSection 