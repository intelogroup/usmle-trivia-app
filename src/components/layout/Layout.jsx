import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

const noHeaderPaths = [];
const noBottomNavPaths = [];

const Layout = ({ children }) => {
  const { user, profile } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const location = useLocation()

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-open sidebar on desktop
      if (!mobile && window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else if (mobile) {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const showHeader = !noHeaderPaths.includes(location.pathname)
  const showBottomNav = !noBottomNavPaths.includes(location.pathname)

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          {showHeader && (
            <header role="banner">
              <Header user={user} profile={profile} />
            </header>
          )}
          <main role="main" aria-label="Main content" className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="container mx-auto px-3 py-2 max-w-full sm:max-w-screen-sm min-h-full"
            >
              {children}
            </motion.div>
          </main>
          {showBottomNav && (
            <nav role="navigation" aria-label="Main navigation">
              <BottomNav />
            </nav>
          )}
        </div>
      ) : (
        /* Desktop/Tablet Layout */
        <div className="flex min-h-screen w-full overflow-hidden">
          {/* Sidebar - Fixed percentage width */}
          {isSidebarOpen && (
            <aside role="navigation" aria-label="Sidebar navigation" className="w-[15%] min-w-[180px] max-w-[200px] flex-shrink-0">
              <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={toggleSidebar}
                isTablet={window.innerWidth < 1024}
              />
            </aside>
          )}
          
          {/* Main Content Area - Takes remaining width */}
          <div className={`${isSidebarOpen ? 'w-[85%]' : 'w-full'} flex flex-col min-h-screen overflow-hidden transition-all duration-300`}>
            {showHeader && (
              <header role="banner">
                <Header
                  onSidebarToggle={toggleSidebar}
                  showSidebarToggle={window.innerWidth < 1024}
                  isCondensed={false}
                  user={user}
                  profile={profile}
                />
              </header>
            )}
            
            {/* Main content area - theater of the app */}
            <main role="main" aria-label="Main content" className="flex-1 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="h-full px-4 py-4"
              >
                <div className="max-w-full h-full">
                  {children}
                </div>
              </motion.div>
            </main>
          </div>

          {/* Sidebar Overlay for tablet */}
          {isSidebarOpen && window.innerWidth < 1024 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Layout 