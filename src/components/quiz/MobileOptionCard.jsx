import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

/**
 * Mobile-optimized option card component
 * Provides better touch targets and visual feedback
 */
const MobileOptionCard = ({
  option,
  index,
  isSelected,
  isCorrect,
  isAnswered,
  onSelect,
  disabled = false,
  className = ''
}) => {
  const getOptionLabel = (index) => {
    return ['A', 'B', 'C', 'D', 'E'][index] || String(index + 1);
  };

  const getOptionStyles = () => {
    const baseStyles = \"relative min-h-[60px] w-full p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none\";
    
    if (disabled) {
      return `${baseStyles} bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50`;
    }

    if (isAnswered) {
      if (isCorrect) {
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300`;
      } else if (isSelected) {
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300`;
      } else {
        return `${baseStyles} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400`;
      }
    }

    if (isSelected) {
      return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 shadow-lg`;
    }

    return `${baseStyles} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md active:scale-[0.98]`;
  };

  const getIconColor = () => {
    if (isAnswered && isCorrect) return 'text-green-500';
    if (isAnswered && isSelected && !isCorrect) return 'text-red-500';
    if (isSelected) return 'text-blue-500';
    return 'text-gray-400';
  };

  const handleClick = () => {
    if (!disabled && !isAnswered && onSelect) {
      onSelect(option.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={!disabled && !isAnswered ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isAnswered ? { scale: 0.98 } : {}}
      className={`${getOptionStyles()} ${className}`}
      onClick={handleClick}
    >
      {/* Option Label */}
      <div className=\"flex items-center gap-4\">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
          isSelected ? 'border-current bg-current text-white' : 'border-current'
        }`}>
          {getOptionLabel(index)}
        </div>
        
        {/* Option Text */}
        <div className=\"flex-1 text-left\">
          <p className=\"text-base leading-relaxed break-words\">{option.text}</p>
        </div>
        
        {/* Status Icon */}
        {isAnswered && (
          <div className=\"flex-shrink-0 w-6 h-6 flex items-center justify-center\">
            {isCorrect ? (
              <Check size={20} className=\"text-green-500\" />
            ) : isSelected ? (
              <X size={20} className=\"text-red-500\" />
            ) : null}
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && !isAnswered && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className=\"absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg\"
        >
          <Check size={14} className=\"text-white\" />
        </motion.div>
      )}

      {/* Ripple Effect */}
      {isSelected && !isAnswered && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className=\"absolute inset-0 rounded-2xl border-2 border-blue-500 pointer-events-none\"
        />
      )}
    </motion.div>
  );
};

export default MobileOptionCard;