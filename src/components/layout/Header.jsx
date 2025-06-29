import { User, Trophy, Bell, Sun, Moon, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { getTransformedUrl } from '../../utils/imageUtils'

const Header = ({ onSidebarToggle, showSidebarToggle = false, isCondensed = false, user }) => {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()

  const handleActionPress = (action) => {
    // Add haptic feedback for native feel
    if (navigator.vibrate) {
      navigator.vibrate(5)
    }
    action()
  }
  
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-sm border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-40 transition-all duration-300 ${
        isCondensed ? 'py-2' : 'py-2'
      }`}
      style={{
        paddingTop: isCondensed ? '8px' : 'max(8px, env(safe-area-inset-top))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className={`flex items-center justify-end px-3 w-full ${
        isCondensed ? 'max-w-none' : 'max-w-full'
      }`}>
        {/* Sidebar Toggle for Tablet - moved to far right with other elements */}
        <div className="flex items-center gap-1">
          {showSidebarToggle && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSidebarToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          )}
          {/* Trophy Points (always show on top bar) */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg shadow-orange-500/25"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Trophy size={12} className="drop-shadow-sm" />
            </motion.div>
            <span className="tracking-tight">1,250</span>
          </motion.div>
          
          {/* Notification */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleActionPress(() => {/* TODO: Implement notifications */})}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 relative active:bg-gray-200 dark:active:bg-gray-700"
          >
            <Bell size={16} className="text-gray-600 dark:text-gray-300" strokeWidth={2} />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm"
            />
          </motion.button>
          
          {/* Theme Toggle */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleActionPress(toggleTheme)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:bg-gray-200 dark:active:bg-gray-700"
          >
            <motion.div
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {isDarkMode ? (
                <Sun size={16} className="text-yellow-500 drop-shadow-sm" strokeWidth={2} />
              ) : (
                <Moon size={16} className="text-gray-600 dark:text-gray-300" strokeWidth={2} />
              )}
            </motion.div>
          </motion.button>
          
          {/* Profile Avatar (always show on top bar far right) */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleActionPress(() => navigate('/profile'))}
            className="relative"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg ring-2 ring-white/50 dark:ring-gray-700/50 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {user?.avatar_url ? (
                <img 
                  src={getTransformedUrl(user.avatar_url, { width: 80, height: 80 })} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              ) : (
                <User size={18} className="text-white" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header 