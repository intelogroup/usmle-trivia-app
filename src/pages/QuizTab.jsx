import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QuestionService } from '../services/questionService';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  ChevronRight,
  Star,
  Shuffle,
  Settings,
  Timer,
  LayoutGrid,
  Book,
  Target,
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Trophy,
  Shield,
  Loader2,
  Atom,
  BrainCircuit,
  Waves,
  CircleDot,
  FlaskConical,
  TestTube,
  ScanLine,
  Activity,
  Brain,
  Stethoscope,
  Eye,
  HeartHandshake as Heart,
  Microscope,
  Pill,
  Syringe,
  Thermometer,
  Baby,
  Bone,
  Wind as Lungs, // For respiratory system
  Droplets as Kidneys, // For renal system  
  Zap,
  Zap as Dna,
  Bandage as FirstAid,
  AlertCircle
} from 'lucide-react';

const iconMap = {
  // Cardiovascular
  Heart,
  Activity,
  
  // Neurological
  Brain,
  BrainCircuit,
  
  // Pharmacology
  Pill,
  CircleDot,
  Syringe,
  FlaskConical,
  
  // General Medicine
  Stethoscope,
  Thermometer,
  FirstAid,
  ScanLine,
  
  // Body Systems
  Eye,
  Bone,
  Lungs, // Represents respiratory system
  Kidneys, // Represents renal system
  
  // Pediatrics/Development
  Baby,
  
  // Laboratory/Research
  Microscope,
  TestTube,
  Dna,
  
  // General/Academic
  BookOpen,
  Book,
  Target,
  Atom,
  LayoutGrid,
  Waves,
  Shield
};

const QuizTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);

  const filterOptions = [
    { value: 'all', label: 'All', icon: LayoutGrid },
    { value: 'subject', label: 'Subjects', icon: Book },
    { value: 'system', label: 'Systems', icon: BrainCircuit },
    { value: 'topic', label: 'Topics', icon: Atom }
  ];

  const questionCountOptions = [5, 10, 15, 20, 25, 30];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all categories with question counts
        const data = await QuestionService.fetchCategories();

        if (!data || data.length === 0) {
          setError('No categories found. Please check your database setup.');
          return;
        }

        const formattedCategories = await Promise.all(data.map(async (category) => {
          // Safely get user progress
          let progress = 0;
          try {
            progress = user?.id ? await getUserProgress(category.id) : 0;
          } catch (progressError) {
            console.warn('Error getting progress for category:', category.id, progressError);
          }

          return {
            id: category.id,
            title: category.name || 'Unknown Category',
            description: category.description || `Study ${(category.name || '').toLowerCase()} concepts and practice questions`,
            icon: iconMap[category.icon_name] || Atom,
            color: category.color_code || category.color || '#6B7280',
            type: category.type || 'subject',
            questionCount: category.question_count || 0,
            difficulty: getDifficultyLevel(category.question_count || 0),
            isPopular: (category.question_count || 0) > 20,
            progress: progress
          };
        }));

        // Filter out categories with no questions unless in development
        const categoriesWithQuestions = formattedCategories.filter(cat => 
          cat.questionCount > 0 || process.env.NODE_ENV === 'development'
        );

        setCategories(categoriesWithQuestions);
        setFilteredCategories(categoriesWithQuestions);
      } catch (err) {
        console.error('Categories fetch error:', err);
        setError(`Error loading categories: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  useEffect(() => {
    // Filter and search categories
    let filtered = categories;

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(cat => cat.type === selectedFilter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(cat => 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  }, [categories, selectedFilter, searchQuery]);

  const getUserProgress = async (categoryId) => {
    try {
      return await QuestionService.getUserProgress(user?.id, categoryId);
    } catch (error) {
      console.warn('Error getting user progress:', error);
      return 0;
    }
  };

  const getDifficultyLevel = (questionCount) => {
    if (questionCount >= 50) return 'Advanced';
    if (questionCount >= 20) return 'Intermediate';
    return 'Beginner';
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate('/quiz', { 
      state: { 
        categoryId, 
        categoryName,
        questionCount: selectedQuestionCount 
      } 
    });
  };

  const handleQuickStart = () => {
    // Start quiz with mixed questions from all categories
    navigate('/quiz', { 
      state: { 
        categoryId: 'mixed', 
        categoryName: 'Mixed Practice',
        questionCount: selectedQuestionCount 
      } 
    });
  };

  // Quiz type handlers
  const handleBlitzQuiz = () => {
    // Random set of questions for user
    navigate('/quiz', { 
      state: { 
        categoryId: 'mixed',
        categoryName: 'Blitz Quiz',
        questionCount: 15,
        isBlitzMode: true
      } 
    });
  };

  const handleCustomQuiz = () => {
    // Navigate to custom quiz setup where user chooses subject and system (topic optional)
    navigate('/custom-quiz-setup');
  };

  const handleBlockTest = () => {
    // Navigate to block test setup - 40 questions, user specifies blocks and timed/self-paced
    navigate('/block-test-setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 overflow-x-hidden scrollbar-hide">
        <div className="px-3 pt-4 pb-3">
          <div className="relative">
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
        
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="px-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 overflow-x-hidden scrollbar-hide">
        <div className="px-3 pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              Unable to Load Categories
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 overflow-x-hidden scrollbar-hide">
      {/* Search Bar */}
      <div className="px-3 pt-4 pb-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </motion.div>
      </div>

      {/* Question Count Picker */}
      <div className="px-3 pb-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings size={14} className="text-gray-500" />
                Questions:
              </h3>
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {questionCountOptions.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedQuestionCount(count)}
                    className={`py-1.5 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedQuestionCount === count
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quiz Type Buttons */}
      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/quiz', { 
              state: { 
                categoryId: 'mixed', 
                categoryName: 'Quick Practice', 
                questionCount: selectedQuestionCount 
              } 
            })}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Quick Quiz</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-left">{selectedQuestionCount} random questions</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/quiz', { 
              state: { 
                categoryId: 'mixed', 
                categoryName: 'Timed Challenge', 
                questionCount: 20,
                isTimedMode: true
              } 
            })}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Timed Test</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-left">20 questions, 30 min</p>
          </motion.button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {selectedFilter === 'all' ? 'All Categories' : 
               filterOptions.find(f => f.value === selectedFilter)?.label || 'Categories'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {filteredCategories.length} found
              </span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedFilter === filter.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Categories Grid/List */}
        {filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {searchQuery 
                ? `No categories match "${searchQuery}". Try a different search term.`
                : `No categories available for the selected filter.`
              }
            </p>
            {(searchQuery || selectedFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Clear filters
              </button>
            )}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={async () => {
                    try {
                      const result = await QuestionService.testConnection();
                      alert(`Connection test: ${result.success ? 'Success' : 'Failed'}\n${JSON.stringify(result, null, 2)}`);
                    } catch (err) {
                      alert(`Connection test failed: ${err.message}`);
                    }
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Test DB Connection
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {viewMode === 'grid' ? (
              <div className="space-y-4">
                {filteredCategories.map((category, index) => (
                  <MobileCategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category.id, category.title)}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category, index) => (
                  <MobileCategoryListItem
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category.id, category.title)}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Tips Section - Native Card Style */}
      <div className="px-3 pb-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-2 rounded-lg border border-yellow-400/30">
              <Sparkles className="text-yellow-400" size={16} />
            </div>
            <h3 className="text-base font-bold text-gray-200 flex items-center gap-1.5">
              Medical Study Tips
              <Brain className="h-3 w-3 text-purple-400" />
            </h3>
          </div>
          <div className="space-y-2">
            {[
              { icon: Target, text: "Focus on high-yield topics first", color: "text-purple-400", bg: "bg-purple-500/10" },
              { icon: Microscope, text: "Review pathophysiology deeply", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Calendar, text: "Practice questions daily", color: "text-green-400", bg: "bg-green-500/10" },
              { icon: Trophy, text: "Track your weak subjects", color: "text-yellow-400", bg: "bg-yellow-500/10" }
            ].map((tip, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                <div className={`p-1.5 rounded-md ${tip.bg}`}>
                  <tip.icon className={`${tip.color} flex-shrink-0`} size={14} />
                </div>
                <span className="text-gray-300 text-xs font-medium">{tip.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Mobile-Optimized Category Card
const MobileCategoryCard = ({ category, onClick, delay }) => {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-xl p-4 active:bg-gray-50 dark:active:bg-gray-800/50 transition-all border border-gray-100 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div 
          className="p-3 rounded-lg flex-shrink-0 shadow-sm"
          style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}30` }}
        >
          <Icon size={24} style={{ color: category.color }} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base truncate">
              {category.title}
            </h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full flex-shrink-0 ml-2">
              {category.questionCount} Qs
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {category.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500" />
              <span className="text-gray-500 dark:text-gray-400 text-xs">{category.difficulty}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mobile-Optimized Category List Item
const MobileCategoryListItem = ({ category, onClick, delay }) => {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <div 
        className="p-2 rounded-lg flex-shrink-0"
        style={{ backgroundColor: `${category.color}15` }}
      >
        <Icon size={20} style={{ color: category.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
            {category.title}
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full flex-shrink-0 ml-2">
            {category.questionCount}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          {category.description}
        </p>
      </div>
      
      <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
    </motion.div>
  );
};

export default QuizTab;
