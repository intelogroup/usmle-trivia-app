import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';
import { QuestionService } from '../services/questionService';

/**
 * Enhanced Questions Hook without preloading
 */
export const useEnhancedQuestions = (categoryId, questionCount = 10, difficulty = null, options = {}) => {
  const queryClient = useQueryClient();

  const {
    enabled = true,
    retry = 2,
    staleTime = 10 * 60 * 1000, // 10 minutes
    gcTime = 30 * 60 * 1000,    // 30 minutes
  } = options;

  // Generate query key
  const queryKey = ['enhanced-questions', categoryId, questionCount, difficulty];

  // Main query with preloading integration
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Fetch with preloading service
      const questions = await QuestionService.fetchQuestions(
        categoryId,
        questionCount,
        difficulty
      );
      return questions;
    },
    enabled: enabled && !!categoryId,
    retry,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    ...query,
  };
};

/**
 * Hook for preloading questions in background
 */
export const useQuestionPreloader = () => {
  const [preloadQueue, setPreloadQueue] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const addToPreloadQueue = useCallback((categoryId, questionCount, difficulty, priority = 'normal') => {
    setPreloadQueue(prev => {
      const exists = prev.some(item => 
        item.categoryId === categoryId && 
        item.difficulty === difficulty
      );
      
      if (exists) return prev;
      
      return [...prev, { 
        categoryId, 
        questionCount, 
        difficulty, 
        priority,
        timestamp: Date.now()
      }];
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isActive || preloadQueue.length === 0) return;

    setIsActive(true);
    
    try {
      const item = preloadQueue[0];
      await QuestionService.fetchQuestions(
        item.categoryId,
        item.questionCount,
        item.difficulty
      );
      
      setPreloadQueue(prev => prev.slice(1));
    } catch (error) {
      console.error('Error processing preload queue:', error);
    } finally {
      setIsActive(false);
    }
  }, [isActive, preloadQueue]);

  useEffect(() => {
    if (preloadQueue.length > 0 && !isActive) {
      const timer = setTimeout(processQueue, 100);
      return () => clearTimeout(timer);
    }
  }, [preloadQueue, isActive, processQueue]);

  return {
    addToPreloadQueue,
    queueLength: preloadQueue.length,
    isActive,
    clearQueue: () => setPreloadQueue([])
  };
};

/**
 * Hook for smart question prefetching based on user behavior
 */
export const useSmartPrefetch = (userHistory) => {
  const { addToPreloadQueue } = useQuestionPreloader();

  useEffect(() => {
    if (!userHistory?.length) return;

    // Analyze user patterns and prefetch likely next categories
    const preferences = analyzeUserPreferences(userHistory);
    
    preferences.forEach(pref => {
      addToPreloadQueue(pref.categoryId, 10, pref.difficulty, 'low');
    });
  }, [userHistory, addToPreloadQueue]);

  return {
    prefetchForUser: (userId) => {
      // Trigger smart prefetching for specific user patterns
      QuestionService.smartPreload(userHistory);
    }
  };
};

/**
 * Utility Functions
 */

// Get related categories for intelligent preloading
function getRelatedCategories(categoryId) {
  const categoryRelations = {
    'cardiology': ['pulmonology', 'internal-medicine'],
    'pulmonology': ['cardiology', 'critical-care'],
    'neurology': ['psychiatry', 'neurosurgery'],
    'psychiatry': ['neurology', 'pediatrics'],
    'pediatrics': ['psychiatry', 'family-medicine'],
    'surgery': ['anatomy', 'emergency-medicine'],
    'emergency-medicine': ['surgery', 'critical-care'],
    'mixed': ['cardiology', 'pulmonology', 'neurology'] // Most popular categories
  };

  return categoryRelations[categoryId] || ['mixed'];
}

// Get offline questions fallback
function getOfflineQuestions(categoryId, questionCount) {
  try {
    const offlineData = localStorage.getItem(`offline-questions-${categoryId}`);
    if (offlineData) {
      const parsed = JSON.parse(offlineData);
      return parsed.questions?.slice(0, questionCount) || [];
    }
  } catch (error) {
    console.error('Error getting offline questions:', error);
  }
  return [];
}

// Analyze user preferences for smart preloading
function analyzeUserPreferences(userHistory) {
  const categoryFrequency = {};
  
  userHistory.forEach(session => {
    const key = `${session.categoryId || 'mixed'}-${session.difficulty || 'mixed'}`;
    categoryFrequency[key] = (categoryFrequency[key] || 0) + 1;
  });

  // Return top 5 most used combinations
  return Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, frequency]) => {
      const [categoryId, difficulty] = key.split('-');
      return { 
        categoryId: categoryId === 'mixed' ? 'mixed' : categoryId, 
        difficulty: difficulty === 'mixed' ? null : difficulty, 
        frequency 
      };
    });
}

/**
 * Performance monitoring hook
 */
export const useQuestionPerformance = () => {
  const [metrics, setMetrics] = useState({
    averageLoadTime: 0,
    cacheHitRatio: 0,
    totalQuestions: 0,
    imageLoadSuccessRate: 0
  });

  const updateMetrics = useCallback(() => {
    const stats = QuestionService.getCacheStats();
    setMetrics(prev => ({
      ...prev,
      cacheHitRatio: stats.cacheHitRatio,
      totalQuestionsLoaded: stats.questionCacheSize
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return {
    metrics,
    updateMetrics,
    getDetailedStats: () => QuestionService.getCacheStats()
  };
}; 