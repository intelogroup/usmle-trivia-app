import { motion } from 'framer-motion'

const EmptyStateCard = ({ icon: Icon, title, subtitle, description, action }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-expo-850 rounded-2xl p-6 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-expo-700 text-center"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-expo-800 dark:to-expo-700 rounded-2xl">
          <Icon size={32} className="text-gray-400 dark:text-dark-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-dark-50">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-dark-300">{subtitle}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-dark-400 max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4"
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default EmptyStateCard 