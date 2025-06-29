import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to handle quiz navigation and routing
 * Centralizes all navigation logic for quiz flows
 */
export const useQuizNavigation = () => {
  const navigate = useNavigate();

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goToQuizSelection = useCallback(() => {
    navigate('/quiz');
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToLeaderboard = useCallback(() => {
    navigate('/leaderboard');
  }, [navigate]);

  const goToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const startQuickQuiz = useCallback((config = {}) => {
    navigate('/quick-quiz', { 
      state: { 
        ...config,
        quizMode: 'quick' 
      } 
    });
  }, [navigate]);

  const startTimedTest = useCallback((config = {}) => {
    navigate('/timed-test-setup', { 
      state: { 
        ...config,
        quizMode: 'timed' 
      } 
    });
  }, [navigate]);

  const startCustomQuiz = useCallback((config = {}) => {
    navigate('/custom-quiz', { 
      state: { 
        ...config,
        quizMode: 'custom' 
      } 
    });
  }, [navigate]);

  const startBlockTest = useCallback((config = {}) => {
    navigate('/block-test', { 
      state: { 
        ...config,
        quizMode: 'block' 
      } 
    });
  }, [navigate]);

  const retryQuiz = useCallback((config = {}) => {
    // Reload current quiz with same config
    window.location.reload();
  }, []);

  const exitQuiz = useCallback((destination = '/quiz') => {
    if (window.confirm('Are you sure you want to exit this quiz? Your progress will be lost.')) {
      navigate(destination);
    }
  }, [navigate]);

  const goToResults = useCallback((resultsData = {}) => {
    navigate('/results', { 
      state: resultsData 
    });
  }, [navigate]);

  const shareResults = useCallback((resultsData) => {
    const shareData = {
      title: 'USMLE Quiz Results',
      text: `I scored ${resultsData.score}/${resultsData.total} (${resultsData.accuracy}%) on a ${resultsData.mode} quiz!`,
      url: window.location.origin
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      const shareText = `${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Results copied to clipboard!');
      }).catch(() => {
        console.log('Could not share results');
      });
    }
  }, []);

  return {
    // Basic navigation
    goHome,
    goToQuizSelection,
    goToDashboard,
    goToLeaderboard,
    goToProfile,
    
    // Quiz starters
    startQuickQuiz,
    startTimedTest,
    startCustomQuiz,
    startBlockTest,
    
    // Quiz actions
    retryQuiz,
    exitQuiz,
    goToResults,
    shareResults
  };
}; 