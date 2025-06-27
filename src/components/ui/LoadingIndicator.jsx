const LoadingIndicator = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-expo-950">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin opacity-60" style={{ animationDelay: '-0.15s' }}></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            Loading...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Preparing your USMLE experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator; 