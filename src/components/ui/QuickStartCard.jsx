import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const QuickStartCard = ({ icon: Icon, title, subtitle, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`${gradient} p-5 rounded-2xl text-white shadow-button hover:shadow-glow transition-all duration-300 cursor-pointer group relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300 group-hover:scale-110 transform transition-transform">
            <Icon size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-white/80 text-sm font-medium">{subtitle}</p>
          </div>
        </div>
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: 3 }}
          className="p-2"
        >
          <ChevronRight size={20} className="text-white/80 group-hover:text-white transition-colors duration-300" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default QuickStartCard 