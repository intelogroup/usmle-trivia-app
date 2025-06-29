import { useState, useEffect } from 'react';

const useQuizLoading = (preloadStatus) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('questions');
  const [showPerformanceHints, setShowPerformanceHints] = useState(false);

  // Simulate realistic loading progress
  useEffect(() => {
    let progressTimer;
    
    if (preloadStatus === 'loading') {
      const stages = {
        'questions': { duration: 2000, progress: 40 },
        'images': { duration: 1500, progress: 30 },
        'cache': { duration: 800, progress: 20 },
        'complete': { duration: 200, progress: 10 }
      };
      
      let currentProgress = 0;
      const updateProgress = () => {
        if (currentProgress < 100) {
          const increment = Math.random() * 3 + 1;
          currentProgress = Math.min(currentProgress + increment, 100);
          setLoadingProgress(currentProgress);
          
          // Update stage based on progress
          if (currentProgress < 40) setCurrentStage('questions');
          else if (currentProgress < 70) setCurrentStage('images');
          else if (currentProgress < 90) setCurrentStage('cache');
          else setCurrentStage('complete');
          
          progressTimer = setTimeout(updateProgress, 100 + Math.random() * 100);
        }
      };
      
      updateProgress();
    } else {
      setLoadingProgress(100);
    }

    return () => {
      if (progressTimer) clearTimeout(progressTimer);
    };
  }, [preloadStatus]);

  // Show performance hints after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPerformanceHints(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    loadingProgress,
    currentStage,
    showPerformanceHints
  };
};

export default useQuizLoading;
