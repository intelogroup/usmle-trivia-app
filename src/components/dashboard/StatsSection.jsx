import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const StatsSection = ({ statsData }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {statsData.map((stat, index) => (
          <StatsCard 
            key={stat.label} 
            {...stat}
            delay={index * 0.1} 
          />
        ))}
      </div>
    </div>
  )
}

const StatsCard = ({ icon: Icon, value, label, color, bgColor, iconColor, delay, trend, goal, subtitle, detailed }) => {
  const getTrendIcon = () => {
    if (trend?.direction === 'up') return <TrendingUp size={12} className="text-green-500 md:w-4 md:h-4 lg:w-5 lg:h-5" />
    if (trend?.direction === 'down') return <TrendingUp size={12} className="text-red-500 rotate-180 md:w-4 md:h-4 lg:w-5 lg:h-5" />
    return null
  }

  const progressPercentage = goal ? Math.min(100, (goal.current / goal.target) * 100) : 0

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer group relative overflow-hidden h-[80px] sm:h-[90px] md:h-[100px] lg:h-[120px]"
      title={detailed}
    >
      {/* Progress background */}
      {goal && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10 transition-all duration-300"
          style={{ 
            width: `${progressPercentage}%`,
            opacity: 0.5
          }}
        />
      )}
      
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 h-full relative z-10">
        <div className={`p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform duration-300 ${bgColor} flex-shrink-0`}>
          <Icon size={14} className={`${iconColor} sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
            <div className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</div>
            {getTrendIcon()}
          </div>
          
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-xs md:text-sm lg:text-base font-medium">{label}</div>
          
          {/* Subtitle with trend or goal info - hide on mobile */}
          {subtitle && (
            <div className="text-xs md:text-sm text-gray-400 dark:text-gray-500 font-medium truncate hidden sm:block">
              {subtitle}
            </div>
          )}
        </div>
        
        {/* Progress bar for goals - hide on mobile */}
        {goal && (
          <div className="flex-shrink-0 w-10 sm:w-12 md:w-16 lg:w-20 hidden sm:block">
            <div className="text-xs text-gray-400 mb-1 text-right">{Math.round(progressPercentage)}%</div>
            <div className="w-full h-1.5 md:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsSection 