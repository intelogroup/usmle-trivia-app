import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const WelcomeCard = ({ welcomeMessage, isNewUser }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-xl"
    >
      <div className="flex items-center gap-3 md:gap-4 lg:gap-5 mb-2 sm:mb-3 md:mb-4 lg:mb-5">
        <div className="text-2xl md:text-3xl lg:text-4xl">{welcomeMessage.emoji}</div>
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{welcomeMessage.title}</h2>
          <p className="text-purple-100 text-xs sm:text-sm md:text-base lg:text-lg">{welcomeMessage.subtitle}</p>
        </div>
      </div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white/15 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-3 lg:gap-4">
            <div className="bg-yellow-400/20 p-1.5 sm:p-2 md:p-2 lg:p-3 rounded-md">
              <Star size={14} className="text-yellow-300 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm md:text-lg lg:text-xl">Today's Goal</h3>
              <p className="text-purple-100 text-xs sm:text-xs md:text-sm lg:text-base">
                {isNewUser ? 'Complete your first quiz' : 'Practice 20 questions'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white">
              {isNewUser ? '0/1' : '12/20'}
            </div>
            <div className="text-xs sm:text-xs md:text-sm lg:text-base text-purple-200">Progress</div>
          </div>
        </div>
        
        <div className="mt-2 md:mt-3 lg:mt-4 w-full h-1 sm:h-1.5 md:h-2 lg:h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
            style={{ width: isNewUser ? '0%' : '60%' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WelcomeCard 