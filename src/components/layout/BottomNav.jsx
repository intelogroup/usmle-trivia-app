import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Trophy, User, BarChart3, BookOpen, GraduationCap, Swords } from 'lucide-react'
import { motion } from 'framer-motion'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { icon: Home, label: 'Home', path: '/', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, label: 'Learn', path: '/learn', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    { icon: Swords, label: 'Quiz', path: '/quiz', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
    { icon: Trophy, label: 'Leaders', path: '/leaderboard', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-1 py-0.5 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center px-1.5 py-1 min-w-0 flex-1"
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              aria-label={`${item.label}${active ? ' (current page)' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon container */}
              <motion.div
                className="p-1 rounded-md transition-all duration-200"
                animate={{ 
                  scale: active ? 1.05 : 1,
                  y: active ? -1 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon 
                  className={`w-4 h-4 transition-colors duration-200 ${
                    active ? item.color : 'text-gray-500 dark:text-gray-400'
                  }`}
                  aria-hidden="true"
                />
              </motion.div>
              
              {/* Label */}
              <span 
                className={`text-[9px] font-medium mt-0.5 transition-colors duration-200 ${
                  active ? item.color : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav 