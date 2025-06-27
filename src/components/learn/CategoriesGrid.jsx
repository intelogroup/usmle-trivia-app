import { motion } from 'framer-motion';

const CategoriesGrid = ({ categories }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">Browse by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
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
          );
        })}
      </div>
    </motion.div>
  );
};

export default CategoriesGrid; 