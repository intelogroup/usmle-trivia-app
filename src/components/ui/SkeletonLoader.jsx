import { memo } from "react";

const SkeletonLoader = memo(
  ({
    variant = "default",
    width = "w-full",
    height = "h-4",
    className = "",
    count = 1,
    animated = true,
  }) => {
    const variants = {
      default: "rounded",
      circular: "rounded-full",
      rectangular: "rounded-lg",
      card: "rounded-2xl",
      button: "rounded-xl",
    };

    const baseClasses = `
    bg-gray-200 dark:bg-gray-700
    ${variants[variant]}
    ${width}
    ${height}
    ${animated ? "loading-shimmer" : ""}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    if (count === 1) {
      return <div className={baseClasses} aria-hidden="true" />;
    }

    return (
      <div className="space-y-2" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={baseClasses} />
        ))}
      </div>
    );
  },
);

// Predefined skeleton patterns for common use cases
export const CardSkeleton = memo(() => (
  <div
    className="glass-card dark:glass-card-dark rounded-2xl p-4 space-y-3"
    aria-hidden="true"
  >
    <div className="flex items-start gap-3">
      <SkeletonLoader variant="circular" width="w-12" height="h-12" />
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="w-3/4" height="h-4" />
        <SkeletonLoader width="w-1/2" height="h-3" />
      </div>
    </div>
    <SkeletonLoader count={2} height="h-3" />
    <SkeletonLoader width="w-full" height="h-2" variant="rectangular" />
  </div>
));

export const CategoryCardSkeleton = memo(() => (
  <div
    className="glass-card dark:glass-card-dark rounded-2xl p-4 space-y-3"
    aria-hidden="true"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="rectangular" width="w-10" height="h-10" />
        <div className="space-y-1">
          <SkeletonLoader width="w-20" height="h-4" />
          <SkeletonLoader width="w-16" height="h-3" />
        </div>
      </div>
      <SkeletonLoader variant="circular" width="w-4" height="h-4" />
    </div>
    <SkeletonLoader count={2} height="h-3" />
    <div className="flex items-center gap-2">
      <SkeletonLoader width="w-full" height="h-2" variant="rectangular" />
      <SkeletonLoader width="w-8" height="h-3" />
    </div>
  </div>
));

export const QuestionCardSkeleton = memo(() => (
  <div
    className="glass-card dark:glass-card-dark rounded-2xl p-6 space-y-4"
    aria-hidden="true"
  >
    <div className="flex justify-between items-center">
      <SkeletonLoader width="w-24" height="h-4" />
      <SkeletonLoader width="w-16" height="h-4" />
    </div>
    <SkeletonLoader count={3} height="h-4" />
    <SkeletonLoader width="w-full" height="h-32" variant="rectangular" />
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonLoader
          key={index}
          width="w-full"
          height="h-12"
          variant="button"
        />
      ))}
    </div>
  </div>
));

export const ProfileSkeleton = memo(() => (
  <div className="space-y-6" aria-hidden="true">
    <div className="text-center space-y-3">
      <SkeletonLoader
        variant="circular"
        width="w-20"
        height="h-20"
        className="mx-auto"
      />
      <SkeletonLoader width="w-32" height="h-6" className="mx-auto" />
      <SkeletonLoader width="w-24" height="h-4" className="mx-auto" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="glass-card dark:glass-card-dark rounded-xl p-4 text-center space-y-2"
        >
          <SkeletonLoader
            width="w-8"
            height="h-8"
            variant="circular"
            className="mx-auto"
          />
          <SkeletonLoader width="w-12" height="h-4" className="mx-auto" />
          <SkeletonLoader width="w-16" height="h-3" className="mx-auto" />
        </div>
      ))}
    </div>
  </div>
));

export const LeaderboardSkeleton = memo(() => (
  <div className="space-y-3" aria-hidden="true">
    {Array.from({ length: 10 }, (_, index) => (
      <div
        key={index}
        className="glass-card dark:glass-card-dark rounded-xl p-3 flex items-center gap-3"
      >
        <SkeletonLoader width="w-6" height="h-4" />
        <SkeletonLoader variant="circular" width="w-10" height="h-10" />
        <div className="flex-1 space-y-1">
          <SkeletonLoader width="w-24" height="h-4" />
          <SkeletonLoader width="w-16" height="h-3" />
        </div>
        <SkeletonLoader width="w-12" height="h-4" />
      </div>
    ))}
  </div>
));

SkeletonLoader.displayName = "SkeletonLoader";
CardSkeleton.displayName = "CardSkeleton";
CategoryCardSkeleton.displayName = "CategoryCardSkeleton";
QuestionCardSkeleton.displayName = "QuestionCardSkeleton";
ProfileSkeleton.displayName = "ProfileSkeleton";
LeaderboardSkeleton.displayName = "LeaderboardSkeleton";

export default SkeletonLoader;
