import { motion } from 'framer-motion';
import { Star, Clock, ArrowRight, Play } from 'lucide-react';

const StudyMaterialsGrid = ({ studyMaterials }) => {
  return (
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
          const Icon = material.icon;
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
          );
        })}
      </div>
    </motion.div>
  );
};

export default StudyMaterialsGrid; 