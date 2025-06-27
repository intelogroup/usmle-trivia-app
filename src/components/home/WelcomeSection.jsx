import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Award, Calendar, Play } from 'lucide-react'

const WelcomeSection = ({ user, profile, isNewUser }) => {
  const navigate = useNavigate()

  const getWelcomeMessage = () => {
    const currentHour = new Date().getHours()
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening'
    const firstName = profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'
    
    if (isNewUser) {
      return {
        greeting: `Good ${timeOfDay}, ${firstName}! 👋`,
        message: "Welcome to your USMLE Step 1 journey! Ready to start your first quiz?",
        cta: "Start Your First Quiz",
        ctaAction: () => navigate('/quick-quiz'),
        motivation: "Every expert was once a beginner. Let's build your medical knowledge together!"
      }
    } else {
      const motivationalMessages = [
        "Time to level up your medical knowledge!",
        "Every question brings you closer to your goal!",
        "Your dedication is paying off - keep going!",
        "Ready to tackle some challenging questions?",
        "Let's continue building your expertise!"
      ]
      
      return {
        greeting: `Good ${timeOfDay}, ${firstName}! 🩺`,
        message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        cta: "Continue Learning",
        ctaAction: () => navigate('/quiz'),
        motivation: "Consistency is key to mastering medicine. You've got this!"
      }
    }
  }

  const welcome = getWelcomeMessage()

  return (
    <motion.div 
      className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 md:p-8 text-white mb-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-700/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {welcome.greeting}
            </motion.h1>
            
            <motion.p 
              className="text-blue-100 mb-4 text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {welcome.message}
            </motion.p>
            
            <motion.p 
              className="text-blue-200 text-sm mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {welcome.motivation}
            </motion.p>
            
            <motion.button
              onClick={welcome.ctaAction}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Play className="w-5 h-5" />
              <span>{welcome.cta}</span>
            </motion.button>
          </div>
          
          <div className="hidden md:flex flex-col items-center space-y-4 ml-8">
            <div className="p-3 bg-white/10 rounded-full">
              {isNewUser ? (
                <Award className="w-8 h-8 text-yellow-300" />
              ) : (
                <Calendar className="w-8 h-8 text-blue-200" />
              )}
            </div>
            
            <div className="text-center">
              <div className="text-sm text-blue-200 font-medium">
                {isNewUser ? 'New Learner' : 'Active Learner'}
              </div>
              <div className="text-xs text-blue-300">
                {isNewUser ? 'Welcome aboard!' : 'Keep it up!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WelcomeSection 