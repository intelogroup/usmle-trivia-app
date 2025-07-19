import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { LOADING_MESSAGES } from "../../constants/ui";

const LoadingIndicator = ({
  message = LOADING_MESSAGES.LOADING,
  subtitle = "Preparing your USMLE experience",
  size = "default",
  fullScreen = true,
}) => {
  const sizes = {
    sm: "w-6 h-6",
    default: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Glassmorphism container for spinner */}
        <div className="glass-card dark:glass-card-dark rounded-2xl p-6 flex flex-col items-center space-y-4">
          {/* Medical-themed animated spinner */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className={`${sizes[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full`}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 ${sizes[size]} border-4 border-transparent border-t-purple-400 dark:border-t-purple-300 rounded-full opacity-60`}
            />

            {/* Center medical icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Stethoscope
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              </motion.div>
            </div>
          </div>

          {/* Loading text with animation */}
          <div className="text-center space-y-2">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-lg font-semibold text-gray-700 dark:text-gray-300"
            >
              {message}
            </motion.p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="flex space-x-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>

      {/* Screen reader text */}
      <span className="sr-only">
        {message} {subtitle}
      </span>
    </div>
  );
};

export default LoadingIndicator;
