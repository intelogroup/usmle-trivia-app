import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Trophy, User, BarChart3, BookOpen, GraduationCap, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = ({ isOpen, onToggle, isTablet }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      path: '/', 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-blue-500', 
      gradient: 'from-blue-500 to-blue-600' 
    },
    { 
      icon: BookOpen, 
      label: 'Quiz', 
      path: '/categories', 
      color: 'text-purple-600 dark:text-purple-400', 
      bgColor: 'bg-purple-500', 
      gradient: 'from-purple-500 to-purple-600' 
    },
    { 
      icon: GraduationCap, 
      label: 'Learn', 
      path: '/learn', 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bgColor: 'bg-emerald-500', 
      gradient: 'from-emerald-500 to-emerald-600' 
    },
    { 
      icon: Trophy, 
      label: 'Leaderboard', 
      path: '/leaderboard', 
      color: 'text-orange-600 dark:text-orange-400', 
      bgColor: 'bg-orange-500', 
      gradient: 'from-orange-500 to-orange-600' 
    },
    { 
      icon: BarChart3, 
      label: 'Statistics', 
      path: '/stats', 
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-500', 
      gradient: 'from-green-500 to-green-600' 
    }
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student'

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col w-full ${
        isTablet ? 'fixed left-0 top-0 z-50 w-72' : ''
      }`}
    >
          {/* Brand Header */}
          <div className="p-3 border-b border-gray-200/30 dark:border-gray-700/30">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  USMLE Trivia
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Study Smart, Score High</p>
              </div>
            </motion.div>
            
            {/* Close button for tablet */}
            {isTablet && (
              <button
                onClick={onToggle}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>



          {/* Navigation Items */}
          <nav className="flex-1 p-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      active 
                        ? 'text-gray-900 dark:text-white bg-gray-100/50 dark:bg-gray-800/50' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className={`p-1.5 rounded-md transition-all duration-200 ${
                      active 
                        ? `${item.color} bg-gray-200 dark:bg-gray-700` 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </nav>

          {/* Profile Button */}
          <div className="p-3 border-t border-gray-200/30 dark:border-gray-700/30">
            <motion.button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                <User size={16} />
              </div>
              <span className="font-medium text-sm">Profile</span>
            </motion.button>
          </div>
        </motion.div>
  )
}

export default Sidebar 