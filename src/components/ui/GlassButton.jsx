import { motion } from "framer-motion";
import { forwardRef } from "react";

const GlassButton = forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      size = "default",
      disabled = false,
      loading = false,
      icon,
      onClick,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default:
        "glass-button dark:glass-button-dark text-gray-700 dark:text-gray-200",
      primary: "glass-gradient-primary text-white",
      success: "glass-gradient-success text-white",
      warning: "glass-gradient-warning text-white",
      danger: "glass-gradient-danger text-white",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      default: "px-4 py-2.5",
      lg: "px-6 py-3 text-lg",
      xl: "px-8 py-4 text-xl",
    };

    const baseClasses = `
    ${variants[variant]}
    ${sizes[size]}
    rounded-xl
    font-medium
    transition-all duration-300
    inline-flex items-center justify-center gap-2
    ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    const handleClick = (e) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {icon && !loading && icon}
        {children}
      </motion.button>
    );
  },
);

GlassButton.displayName = "GlassButton";

export default GlassButton;
