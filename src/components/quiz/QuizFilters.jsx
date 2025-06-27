import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  X,
  ChevronDown,
  Heart,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react'

const QuizFilters = ({ filters, onFiltersChange }) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const filterOptions = [
    { value: 'all', label: 'All Categories', icon: Grid3X3 },
    { value: 'system', label: 'Body Systems', icon: Heart },
    { value: 'subject', label: 'Medical Subjects', icon: BookOpen },
    { value: 'topic', label: 'Specific Topics', icon: Target },
    { value: 'high-yield', label: 'High-Yield (50+ Questions)', icon: TrendingUp }
  ]

  const handleSearchChange = (e) => {
    onFiltersChange({
      ...filters,
      search: e.target.value
    })
  }

  const handleFilterChange = (filterValue) => {
    onFiltersChange({
      ...filters,
      selectedFilter: filterValue
    })
    setShowFilterDropdown(false)
  }

  const handleViewModeChange = (viewMode) => {
    onFiltersChange({
      ...filters,
      viewMode
    })
  }

  const clearSearch = () => {
    onFiltersChange({
      ...filters,
      search: ''
    })
  }

  const currentFilter = filterOptions.find(option => option.value === filters.selectedFilter)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search categories..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{currentFilter?.label || 'Filter'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showFilterDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
              >
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2 ${
                      filters.selectedFilter === option.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                filters.viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                filters.viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.selectedFilter !== 'all') && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              Search: "{filters.search}"
              <button
                onClick={clearSearch}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.selectedFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              {currentFilter?.label}
              <button
                onClick={() => handleFilterChange('all')}
                className="ml-1 hover:text-green-600 dark:hover:text-green-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizFilters 