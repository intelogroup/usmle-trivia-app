// Category filtering and sorting utilities

export const filterCategories = (categories, filters) => {
  // Input validation
  if (!Array.isArray(categories)) {
    console.warn('filterCategories: categories must be an array');
    return [];
  }
  
  if (!filters || typeof filters !== 'object') {
    console.warn('filterCategories: filters must be an object');
    return categories;
  }

  const { search, selectedFilter } = filters;
  
  // Filter out invalid categories first
  let filtered = categories.filter(category => 
    category && 
    typeof category === 'object' && 
    (category.id || category.title || category.name)
  );
  
  // Apply search filter
  if (search && search.trim()) {
    const searchLower = search.toLowerCase().trim();
    filtered = filtered.filter(category => {
      const name = (category.title || category.name || '').toLowerCase();
      const description = (category.description || '').toLowerCase();
      return name.includes(searchLower) || description.includes(searchLower);
    });
  }
  
  // Apply category filter
  if (selectedFilter && selectedFilter !== 'all') {
    switch (selectedFilter) {
      case 'system':
        filtered = filtered.filter(category => category.type === 'system');
        break;
      case 'subject':
        filtered = filtered.filter(category => category.type === 'subject');
        break;
      case 'topic':
        filtered = filtered.filter(category => category.type === 'topic');
        break;
      case 'high-yield':
        filtered = filtered.filter(category => 
          (category.questionCount || 0) >= 50 ||
          category.isHighYield === true
        );
        break;
      default:
        // For any other filter, try to match against the type field
        filtered = filtered.filter(category => category.type === selectedFilter);
        break;
    }
  }
  
  return filtered;
}

export const sortCategories = (categories, sortBy = 'name') => {
  // Input validation
  if (!Array.isArray(categories)) {
    console.warn('sortCategories: categories must be an array');
    return [];
  }

  // Filter out invalid categories
  const validCategories = categories.filter(cat => 
    cat && typeof cat === 'object'
  );

  const sorted = [...validCategories];
  
  try {
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = (a.title || a.name || 'Untitled').toString();
          const nameB = (b.title || b.name || 'Untitled').toString();
          return nameA.localeCompare(nameB);
        });
      case 'questionCount':
        return sorted.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
      case 'difficulty':
        const difficultyOrder = { 
          'easy': 1, 'beginner': 1,
          'medium': 2, 'intermediate': 2,
          'hard': 3, 'advanced': 3
        };
        return sorted.sort((a, b) => {
          const diffA = (a.difficulty || 'medium').toLowerCase();
          const diffB = (b.difficulty || 'medium').toLowerCase();
          return (difficultyOrder[diffA] || 2) - (difficultyOrder[diffB] || 2);
        });
      case 'lastUsed':
        return sorted.sort((a, b) => {
          const dateA = a.lastUsed || a.last_used;
          const dateB = b.lastUsed || b.last_used;
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          try {
            return new Date(dateB) - new Date(dateA);
          } catch (error) {
            console.warn('Error comparing dates:', error);
            return 0;
          }
        });
      case 'accuracy':
        return sorted.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
      case 'progress':
        return sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      case 'popular':
        return sorted.sort((a, b) => {
          // Sort by popularity (isPopular first, then by question count)
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return (b.questionCount || 0) - (a.questionCount || 0);
        });
      default:
        return sorted;
    }
  } catch (error) {
    console.error('Error sorting categories:', error);
    return sorted;
  }
}

// Enhanced utility functions with comprehensive error handling
export const getCategoryStats = (category) => {
  // Add comprehensive null/undefined checks
  if (!category || typeof category !== 'object') {
    return {
      totalQuestions: 0,
      averageAccuracy: 0,
      completionRate: 0,
      lastAttempted: null,
      difficulty: 'medium',
      isHighYield: false,
      estimatedTime: 15
    }
  }

  const stats = {
    totalQuestions: category.questionCount || category.question_count || 0,
    averageAccuracy: category.accuracy || 0,
    completionRate: category.completionRate || 0,
    lastAttempted: category.lastUsed || category.last_used || null,
    difficulty: category.difficulty || 'medium',
    isHighYield: category.isHighYield || category.is_high_yield || false,
    estimatedTime: Math.ceil((category.questionCount || category.question_count || 10) * 1.5) // 1.5 min per question
  }
  
  return stats
}

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
    case 'beginner':
      return 'text-green-600 bg-green-100'
    case 'medium':
    case 'intermediate':
      return 'text-yellow-600 bg-yellow-100'
    case 'hard':
    case 'advanced':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const getAccuracyColor = (accuracy) => {
  if (!accuracy || accuracy === 0) return 'text-gray-600'
  if (accuracy >= 80) return 'text-green-600'
  if (accuracy >= 60) return 'text-yellow-600'
  if (accuracy >= 40) return 'text-orange-600'
  return 'text-red-600'
}

export const formatLastUsed = (lastUsed) => {
  if (!lastUsed) return 'Never'
  
  try {
    const date = new Date(lastUsed)
    if (isNaN(date.getTime())) return 'Never'
    
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  } catch (error) {
    console.warn('Error formatting last used date:', error)
    return 'Never'
  }
}

export const getProgressBarColor = (accuracy) => {
  if (accuracy >= 80) return 'bg-green-500'
  if (accuracy >= 60) return 'bg-yellow-500'
  if (accuracy >= 40) return 'bg-orange-500'
  return 'bg-red-500'
} 