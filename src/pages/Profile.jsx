import { motion } from 'framer-motion'
import { User, Settings, LogOut, Bell, Moon, Check, X, Wrench, Database, Trophy, Target, Clock, Award } from 'lucide-react'
import { useState } from 'react'
import { testConnection } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    const result = await testConnection()
    setConnectionStatus(result)
    setIsTestingConnection(false)
    
    // Auto clear status after 5 seconds
    setTimeout(() => setConnectionStatus(null), 5000)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/auth/welcome', { replace: true })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const userStats = [
    { icon: Trophy, label: 'Total Points', value: profile?.total_points?.toLocaleString() || '0', color: 'text-yellow-600' },
    { icon: Target, label: 'Overall Accuracy', value: '78%', color: 'text-green-600' },
    { icon: Clock, label: 'Study Time', value: '42h', color: 'text-blue-600' },
  ]

  const achievements = [
    { title: 'First Quiz', description: 'Complete your first quiz', earned: true },
    { title: 'Perfect Score', description: 'Get 100% on any quiz', earned: true },
    { title: 'Study Streak', description: '7 days in a row', earned: false },
    { title: 'Category Master', description: 'Complete all questions in a category', earned: false },
  ]

  const settings = [
    { icon: Bell, label: 'Notifications', enabled: true },
    { icon: Moon, label: 'Dark Mode', enabled: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center border border-gray-50 dark:border-gray-700"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900"
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url}
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          )}
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50 mb-1">
          {profile?.display_name || user?.user_metadata?.full_name || 'USMLE Student'}
        </h2>
        <p className="text-gray-600 dark:text-dark-300 text-sm">
          {profile?.school_of_medicine || 'USMLE Step 1 Candidate'}
        </p>
        <div className="mt-4 flex justify-center">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
            {profile?.achievement_grades?.name || 'Beginner'}
          </span>
        </div>
        {profile?.countries && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xl">{profile.countries.flag_emoji}</span>
            <span className="text-sm text-gray-600 dark:text-dark-300">
              {profile.countries.name}
            </span>
          </div>
        )}
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {userStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-expo-850 rounded-xl p-4 shadow-card dark:shadow-card-dark text-center border border-gray-50 dark:border-expo-700"
          >
            <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-gray-800 dark:text-dark-50">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-dark-300">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-expo-850 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-expo-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Achievements</h3>
        </div>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${
                achievement.earned ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div className="flex-1">
                <p className={`font-medium ${
                  achievement.earned ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {achievement.title}
                </p>
                <p className={`text-sm ${
                  achievement.earned ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-expo-850 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-expo-700"
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
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-expo-800 rounded-lg transition-colors"
          >
            <Settings size={20} className="text-gray-600 dark:text-dark-300" />
            <span className="text-gray-800 dark:text-dark-50">More Settings</span>
          </motion.button>

          {/* Sign Out Button */}
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

      {/* User Info Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="bg-white dark:bg-expo-850 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-expo-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <User size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Account Information</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-dark-300">Email:</span>
            <span className="text-gray-800 dark:text-dark-50">{user?.email}</span>
          </div>
          {profile?.bio && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-dark-300">Bio:</span>
              <span className="text-gray-800 dark:text-dark-50">{profile.bio}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-dark-300">Member Since:</span>
            <span className="text-gray-800 dark:text-dark-50">
              {new Date(user?.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Supabase Connection Test */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="bg-white dark:bg-expo-850 rounded-xl p-6 shadow-card dark:shadow-card-dark border border-gray-50 dark:border-expo-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-50">Database Connection</h3>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed mb-4"
        >
          {isTestingConnection ? 'Testing Connection...' : 'Test Database Connection'}
        </motion.button>

        {connectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              connectionStatus.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {connectionStatus.success ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <X size={18} className="text-red-600" />
              )}
              <span className="font-semibold">
                {connectionStatus.success ? 'Connection Successful' : 'Connection Failed'}
              </span>
            </div>
            <p className="text-sm">{connectionStatus.message}</p>
            {connectionStatus.data && (
              <pre className="mt-2 text-xs bg-white/50 p-2 rounded border overflow-x-auto">
                {JSON.stringify(connectionStatus.data, null, 2)}
              </pre>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Profile 