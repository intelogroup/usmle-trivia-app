import { motion } from "framer-motion";
import { forwardRef } from "react";

const GlassCard = forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      hover = true,
      animated = true,
      onClick,
      padding = "default",
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: "glass-card dark:glass-card-dark",
      subtle: "glass-subtle dark:glass-subtle-dark",
      strong: "glass-strong dark:glass-strong-dark",
      gradient: "glass-gradient-primary",
    };

    const paddingClasses = {
      none: "",
      sm: "p-3",
      default: "p-4",
      lg: "p-6",
      xl: "p-8",
    };

    const baseClasses = `
    ${variants[variant]}
    ${paddingClasses[padding]}
    rounded-2xl
    transition-all duration-300
    ${hover ? "hover:scale-[1.02] hover:shadow-lg" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    const Component = animated ? motion.div : "div";
    const animationProps = animated
      ? {
          whileHover: hover ? { scale: 1.02 } : {},
          whileTap: onClick ? { scale: 0.98 } : {},
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }
      : {};

    return (
      <Component
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        {...animationProps}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
