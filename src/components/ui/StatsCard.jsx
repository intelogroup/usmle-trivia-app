import { motion } from 'framer-motion'

const StatsCard = ({ icon: Icon, value, label, color = "text-primary-600" }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white dark:bg-expo-850 p-5 rounded-2xl shadow-card dark:shadow-card-dark hover:shadow-glow dark:hover:shadow-expo-dark transition-all duration-300 border border-gray-100 dark:border-expo-700 cursor-pointer group"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-expo-800 dark:to-expo-700 shadow-sm group-hover:shadow-md transition-all duration-300`}>
          <Icon size={24} className={`${color} group-hover:scale-110 transition-transform duration-300`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800 dark:text-dark-50">{value}</div>
          <div className="text-sm text-gray-600 dark:text-dark-300 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard 