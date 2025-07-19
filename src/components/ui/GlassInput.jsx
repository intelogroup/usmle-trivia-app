import { motion } from "framer-motion";
import { forwardRef } from "react";

const GlassInput = forwardRef(
  ({ className = "", label, error, icon, ...props }, ref) => {
    const baseClasses = `
    glass-input dark:glass-input-dark
    w-full
    px-4 py-3
    rounded-xl
    border-0
    text-gray-900 dark:text-white
    placeholder-gray-500 dark:placeholder-gray-400
    transition-all duration-300
    focus:outline-none
    ${error ? "border-red-300 dark:border-red-600" : ""}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}

          <motion.input
            ref={ref}
            className={`${baseClasses} ${icon ? "pl-10" : ""}`}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...props}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

GlassInput.displayName = "GlassInput";

export default GlassInput;
