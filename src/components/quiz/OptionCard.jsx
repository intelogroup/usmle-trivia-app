import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const OptionCard = ({
  option,
  isSelected,
  isAnswered,
  isCorrectOption,
  handleSelect,
  disabled,
  showFeedback,
}) => {
  let base =
    'w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400';
  let color =
    'bg-white/10 dark:bg-slate-900/40 border-white/20 dark:border-slate-700 text-white hover:bg-cyan-900/20 hover:border-cyan-400';
  if (isAnswered) {
    if (isCorrectOption) color = 'border-green-500 bg-green-500/10 text-green-200';
    else if (isSelected) color = 'border-red-500 bg-red-500/10 text-red-200';
    else color = 'border-white/10 dark:border-slate-700 opacity-60';
  } else if (isSelected) {
    color = 'border-cyan-400 bg-cyan-400/10 text-cyan-200';
  }
  return (
    <motion.button
      layout
      className={`${base} ${color} shadow-sm`}
      onClick={() => !disabled && handleSelect(option.id)}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <span>{option.text}</span>
      {showFeedback && isAnswered && (
        isCorrectOption ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : isSelected ? (
          <XCircle className="w-5 h-5 text-red-400" />
        ) : null
      )}
    </motion.button>
  );
};

export default OptionCard;
