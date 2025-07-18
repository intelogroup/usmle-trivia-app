import { motion } from 'framer-motion'
import { filterCategories, sortCategories } from '../../utils/categoryUtils'
import CategoryCard from '../ui/CategoryCard'
import CategoryListItem from './CategoryListItem'
import EmptyStateCard from '../ui/EmptyStateCard'
import { Search, Grid3X3 } from 'lucide-react'
import logger from '../../utils/logger'

const CategoryGrid = ({ categories = [], filters = {}, onCategorySelect, onClearFilters }) => {
  // Validate required props
  if (!onCategorySelect || typeof onCategorySelect !== 'function') {
    logger.error('CategoryGrid: onCategorySelect prop is required and must be a function', {
      onCategorySelect: typeof onCategorySelect
    });
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 mb-2">Configuration Error</div>
          <div className="text-sm text-gray-500">Invalid component props</div>
        </div>
      </div>
    );
  }

  // Ensure filters has required properties with safe defaults
  const safeFilters = {
    search: '',
    selectedFilter: 'all',
    viewMode: 'grid',
    ...filters
  };

  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Filter and sort categories with error handling
  let filteredCategories = [];
  let sortedCategories = [];
  
  try {
    filteredCategories = filterCategories(safeCategories, safeFilters);
    sortedCategories = sortCategories(filteredCategories, 'name');
  } catch (error) {
    logger.error('Error filtering/sorting categories', {
      categoriesCount: safeCategories.length,
      filters: safeFilters
    }, error);
    // Fallback to original categories
    sortedCategories = safeCategories;
  }

  // Empty state
  if (sortedCategories.length === 0) {
    const isSearching = safeFilters.search || safeFilters.selectedFilter !== 'all'
    
    // Clear filters handler
    const handleClearFilters = () => {
      if (isSearching && onClearFilters && typeof onClearFilters === 'function') {
        onClearFilters();
      } else {
        window.location.reload();
      }
    };
    
    return (
      <div className="flex items-center justify-center py-12">
        <EmptyStateCard
          icon={isSearching ? Search : Grid3X3}
          title={isSearching ? 'No categories found' : 'No categories available'}
          subtitle={
            isSearching
              ? `No categories match your search "${safeFilters.search}" or filter "${safeFilters.selectedFilter}".`
              : 'Categories are being loaded. Please check your connection.'
          }
          description={
            isSearching
              ? 'Try adjusting your search terms or clearing filters.'
              : 'Please try again in a moment.'
          }
          action={
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSearching ? 'Clear Filters' : 'Refresh'}
            </button>
          }
        />
      </div>
    )
  }

  // Grid view
  if (safeFilters.viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCategories.map((category, index) => {
          // Ensure category has required properties
          if (!category || !category.id) {
            logger.warn('Invalid category data in grid view', { category, index });
            return null;
          }

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <CategoryCard
                title={category.title || category.name || 'Unknown Category'}
                description={category.description || 'No description available'}
                icon={category.icon}
                color={category.color}
                type={category.type}
                progress={category.progress || 0}
                questionCount={category.questionCount || 0}
                onClick={() => onCategorySelect(category.id, category.title || category.name)}
                delay={index * 0.05}
              />
            </motion.div>
          );
        }).filter(Boolean)}
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-3">
      {sortedCategories.map((category, index) => {
        // Ensure category has required properties
        if (!category || !category.id) {
          logger.warn('Invalid category data in list view', { category, index });
          return null;
        }

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
          >
            <CategoryListItem
              category={category}
              onClick={() => onCategorySelect(category.id, category.title || category.name)}
              delay={index * 0.03}
            />
          </motion.div>
        );
      }).filter(Boolean)}
    </div>
  )
}

export default CategoryGrid 