import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Bell, Moon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsComponent = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/auth/welcome', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const settings = [
    { icon: Bell, label: 'Notifications', enabled: true },
    { icon: Moon, label: 'Dark Mode', enabled: false },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wrench size={20} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Settings</h3>
      </div>
      <div className="space-y-4">
        {settings.map((setting, index) => (
          <motion.div
            key={setting.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <setting.icon size={20} className="text-gray-600 dark:text-dark-300" />
              <span className="text-gray-800 dark:text-dark-50">{setting.label}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-6 rounded-full transition-colors ${
                setting.enabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: setting.enabled ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </motion.button>
          </motion.div>
        ))}
        
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings size={20} className="text-gray-600 dark:text-dark-300" />
          <span className="text-gray-800 dark:text-dark-50">More Settings</span>
        </motion.button>

        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} />
          <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SettingsComponent;
