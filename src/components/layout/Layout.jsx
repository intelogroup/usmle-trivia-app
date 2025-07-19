import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

const noHeaderPaths = [];
const noBottomNavPaths = [];

const Layout = ({ children }) => {
  const { user, profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const location = useLocation();

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop
      if (!mobile && window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const showHeader = !noHeaderPaths.includes(location.pathname);
  const showBottomNav = !noBottomNavPaths.includes(location.pathname);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 transition-all duration-500"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Glassmorphism Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-200/20 via-cyan-200/20 to-teal-200/20 dark:from-indigo-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 rounded-full blur-3xl animate-float" />
      </div>

      {/* Mobile Layout (unchanged) */}
      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          {showHeader && <Header user={user} profile={profile} />}
          <main className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="container mx-auto px-3 py-2 max-w-full sm:max-w-screen-sm min-h-full"
            >
              {children}
            </motion.div>
          </main>
          {showBottomNav && <BottomNav />}
        </div>
      ) : (
        /* Desktop/Tablet Layout */
        <div className="flex min-h-screen w-full overflow-hidden">
          {/* Sidebar - Fixed percentage width */}
          {isSidebarOpen && (
            <div className="w-[15%] min-w-[180px] max-w-[200px] flex-shrink-0">
              <Sidebar
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
                isTablet={window.innerWidth < 1024}
              />
            </div>
          )}

          {/* Main Content Area - Takes remaining width */}
          <div
            className={`${isSidebarOpen ? "w-[85%]" : "w-full"} flex flex-col min-h-screen overflow-hidden transition-all duration-300`}
          >
            {showHeader && (
              <Header
                onSidebarToggle={toggleSidebar}
                showSidebarToggle={window.innerWidth < 1024}
                isCondensed={false}
                user={user}
                profile={profile}
              />
            )}

            {/* Main content area - theater of the app */}
            <main className="flex-1 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="h-full px-4 py-4"
              >
                <div className="max-w-full h-full">{children}</div>
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
  );
};

export default Layout;
