import { motion } from 'framer-motion'
import { FileText, Video, Headphones, Clock, Star, BookOpen, TrendingUp, Award } from 'lucide-react'

const Learn = () => {
  const studyMaterials = [
    {
      id: 1,
      title: 'USMLE Step 1 Complete Guide',
      type: 'PDF Guide',
      icon: FileText,
      duration: '45 min read',
      rating: 4.8,
      color: 'bg-gradient-to-br from-primary-500 to-secondary-600',
      description: 'Comprehensive preparation guide covering all major topics'
    },
    {
      id: 2,
      title: 'Cardiology Video Series',
      type: 'Video Course',
      icon: Video,
      duration: '2.5 hours',
      rating: 4.9,
      color: 'bg-gradient-to-br from-red-500 to-pink-600',
      description: 'In-depth video lectures on cardiovascular medicine'
    },
    {
      id: 3,
      title: 'Pharmacology Audio Notes',
      type: 'Audio Course',
      icon: Headphones,
      duration: '3 hours',
      rating: 4.7,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      description: 'Audio lessons covering essential drug mechanisms'
    },
    {
      id: 4,
      title: 'Medical Terminology',
      type: 'Interactive',
      icon: BookOpen,
      duration: '1.5 hours',
      rating: 4.6,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      description: 'Master medical terminology with interactive exercises'
    }
  ]

  const categories = [
    {
      name: 'High Yield Topics',
      icon: TrendingUp,
      count: 24,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Practice Exams',
      icon: FileText,
      count: 12,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Study Guides',
      icon: BookOpen,
      count: 18,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Achievement Badges',
      icon: Award,
      count: 6,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Learn</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Explore study materials and resources</p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className={`w-10 h-10 ${category.bgColor} dark:${category.bgColor.replace('bg-', 'bg-')}/20 rounded-lg flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${category.color} dark:${category.color.replace('text-', 'text-')}`} />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">{category.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{category.count} items</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Study Materials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Recommended Materials</h2>
          <div className="space-y-3">
            {studyMaterials.map((material, index) => {
              const Icon = material.icon
              return (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${material.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white truncate text-sm">{material.title}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-gray-600 dark:text-gray-300 text-xs">{material.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">{material.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            {material.type}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{material.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Your Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Cardiology</span>
                <span className="font-medium text-gray-800 dark:text-white">75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Pharmacology</span>
                <span className="font-medium text-gray-800 dark:text-white">60%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Anatomy</span>
                <span className="font-medium text-gray-800 dark:text-white">40%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Learn 