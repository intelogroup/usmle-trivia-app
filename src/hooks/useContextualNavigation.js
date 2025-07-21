import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Contextual Navigation Hook
 * Provides intelligent navigation that considers current page context
 * instead of unpredictable browser history navigation
 */
export const useContextualNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getContextualBackRoute = useCallback(() => {
    const currentPath = location.pathname;
    
    // Quiz flow back navigation
    if (currentPath.includes('/custom-quiz') && !currentPath.includes('setup')) {
      return '/custom-quiz-setup';
    }
    if (currentPath.includes('/quick-quiz')) {
      return '/quiz';
    }
    if (currentPath.includes('/timed-test') && !currentPath.includes('setup')) {
      return '/timed-test-setup';
    }
    
    // Results and review pages
    if (currentPath.includes('/results')) {
      return '/quiz';
    }
    
    // Quiz setup pages
    if (currentPath.includes('/custom-quiz-setup')) {
      return '/quiz';
    }
    if (currentPath.includes('/timed-test-setup')) {
      return '/quiz';
    }
    
    // Quiz tab and related pages
    if (currentPath.includes('/quiz')) {
      return '/';
    }
    
    // Profile and settings
    if (currentPath.includes('/profile')) {
      return '/';
    }
    
    // Learn section
    if (currentPath.includes('/learn')) {
      return '/';
    }
    
    // Leaderboard
    if (currentPath.includes('/leaderboard')) {
      return '/';
    }
    
    // Auth pages
    if (currentPath.includes('/auth/')) {
      return '/auth/welcome';
    }
    
    // Default fallback
    return '/';
  }, [location.pathname]);

  const contextualBack = useCallback(() => {
    const backRoute = getContextualBackRoute();
    navigate(backRoute);
  }, [navigate, getContextualBackRoute]);

  const navigateToQuiz = useCallback(() => {
    navigate('/quiz');
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateWithState = useCallback((path, state = null) => {
    navigate(path, { state });
  }, [navigate]);

  return {
    contextualBack,
    navigateToQuiz,
    navigateToHome,
    navigateWithState,
    getContextualBackRoute,
    currentPath: location.pathname
  };
};