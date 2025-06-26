import { motion } from 'framer-motion'
import { FileText, Video, Headphones, Clock, Star, BookOpen, TrendingUp, Award, ArrowRight, Play, Book, Brain } from 'lucide-react'
import { Stethoscope } from 'healthicons-react'

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
      description: 'Comprehensive preparation guide covering all major topics',
      chapters: 12,
      lastAccessed: '2 days ago'
    },
    {
      id: 2,
      title: 'Cardiology Video Series',
      type: 'Video Course',
      icon: Video,
      duration: '2.5 hours',
      rating: 4.9,
      color: 'bg-gradient-to-br from-red-500 to-pink-600',
      description: 'In-depth video lectures on cardiovascular medicine',
      chapters: 8,
      lastAccessed: 'Yesterday'
    },
    {
      id: 3,
      title: 'Pharmacology Audio Notes',
      type: 'Audio Course',
      icon: Headphones,
      duration: '3 hours',
      rating: 4.7,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      description: 'Audio lessons covering essential drug mechanisms',
      chapters: 15,
      lastAccessed: '1 week ago'
    },
    {
      id: 4,
      title: 'Medical Terminology',
      type: 'Interactive',
      icon: BookOpen,
      duration: '1.5 hours',
      rating: 4.6,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      description: 'Master medical terminology with interactive exercises',
      chapters: 10,
      lastAccessed: '3 days ago'
    },
    {
      id: 5,
      title: 'Neurology Case Studies',
      type: 'Case Study',
      icon: Brain,
      duration: '2 hours',
      rating: 4.8,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      description: 'Real patient cases for clinical reasoning practice',
      chapters: 20,
      lastAccessed: '5 days ago'
    },
    {
      id: 6,
      title: 'Anatomy 3D Models',
      type: 'Interactive',
      icon: Book,
      duration: '1 hour',
      rating: 4.9,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      description: 'Interactive 3D anatomical models and quizzes',
      chapters: 25,
      lastAccessed: 'Never'
    }
  ]

  const categories = [
    {
      name: 'High Yield Topics',
      icon: TrendingUp,
      count: 24,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Most frequently tested topics'
    },
    {
      name: 'Practice Exams',
      icon: FileText,
      count: 12,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Full-length mock exams'
    },
    {
      name: 'Study Guides',
      icon: BookOpen,
      count: 18,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Comprehensive review materials'
    },
    {
      name: 'Achievement Badges',
      icon: Award,
      count: 6,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Track your milestones'
    }
  ]

  const progressData = [
    { subject: 'Cardiology', progress: 75, color: 'from-red-500 to-pink-600', trend: '+5%' },
    { subject: 'Pharmacology', progress: 60, color: 'from-green-500 to-emerald-600', trend: '+12%' },
    { subject: 'Anatomy', progress: 40, color: 'from-purple-500 to-indigo-600', trend: '+3%' },
    { subject: 'Pathology', progress: 85, color: 'from-blue-500 to-cyan-600', trend: '+8%' },
    { subject: 'Biochemistry', progress: 55, color: 'from-yellow-500 to-orange-600', trend: '+15%' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white mb-1">Learn</h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Explore study materials and resources</p>
            </div>
            
            {/* Desktop Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">156</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hours Studied</p>
              </div>
              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">42</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Courses Started</p>
              </div>
              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">12</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Desktop Layout: Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content - Study Materials */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {categories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 ${category.bgColor} dark:${category.bgColor.replace('bg-', 'bg-')}/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${category.color} dark:${category.color.replace('text-', 'text-')}`} />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base mb-1">{category.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-1">{category.count} items</p>
                      <p className="hidden md:block text-gray-400 dark:text-gray-500 text-xs">{category.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Study Materials Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Recommended Materials</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {studyMaterials.map((material, index) => {
                  const Icon = material.icon
                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="p-4 md:p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 md:w-14 md:h-14 ${material.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base line-clamp-1">{material.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mt-1 line-clamp-2">{material.description}</p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                                <span className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">{material.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs md:text-sm">
                                <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                  {material.type}
                                </span>
                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{material.duration}</span>
                                </div>
                                <span className="hidden md:inline text-gray-500 dark:text-gray-400">
                                  {material.chapters} chapters
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                              Last accessed: {material.lastAccessed}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Action */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Start Learning</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar - Progress & Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Your Progress</h3>
                <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  View Details
                </button>
              </div>
              
              <div className="space-y-4">
                {progressData.map((item, index) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">{item.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-white">{item.progress}%</span>
                        <span className="text-xs text-green-600 dark:text-green-400">{item.trend}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">63%</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Completed Cardiology Ch. 5</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Started Pharmacology Audio</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">Achieved 7-day streak!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Study Tip - Desktop Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="hidden lg:block bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 md:p-6 border border-blue-100 dark:border-blue-800"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Study Tip</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Review your weakest subjects first thing in the morning when your mind is fresh. 
                This helps improve retention and understanding.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Learn 