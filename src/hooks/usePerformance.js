import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/**
 * Hook for debouncing values to reduce unnecessary re-renders and API calls
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls to improve performance
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay],
  );
};

/**
 * Hook for lazy loading images with intersection observer
 */
export const useLazyImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    if (!imgRef.current || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
  }, []);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isError,
    handleLoad,
    handleError,
  };
};

/**
 * Hook for measuring component performance
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === "development") {
      console.debug(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        timeSinceLastRender,
        timestamp: now,
      });
    }
  });

  return {
    renderCount: renderCount.current,
  };
};

/**
 * Hook for optimizing expensive calculations with memoization
 */
export const useExpensiveCalculation = (calculation, deps) => {
  return useMemo(() => {
    const start = performance.now();
    const result = calculation();
    const end = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[Performance] Expensive calculation took ${end - start}ms`,
      );
    }

    return result;
  }, deps);
};

/**
 * Hook for virtual scrolling in large lists
 */
export const useVirtualScroll = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef();

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(itemCount - 1, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  const handleScroll = useThrottle((event) => {
    setScrollTop(event.target.scrollTop);
  }, 16); // ~60fps

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    scrollElementRef,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

/**
 * Hook for preventing unnecessary re-renders with shallow comparison
 */
export const useShallowCompare = (obj) => {
  const cache = useRef();

  return useMemo(() => {
    if (!cache.current || !shallowEqual(cache.current, obj)) {
      cache.current = obj;
    }
    return cache.current;
  }, [obj]);
};

/**
 * Hook for optimizing event handlers to prevent recreation
 */
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Return a stable reference that calls the latest callback
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

/**
 * Hook for batch state updates to reduce re-renders
 */
export const useBatchedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef({});
  const timeoutRef = useRef();

  const batchedSetState = useCallback((updates) => {
    // Merge updates
    Object.assign(pendingUpdates.current, updates);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Batch updates in next tick
    timeoutRef.current = setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        ...pendingUpdates.current,
      }));
      pendingUpdates.current = {};
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState];
};

/**
 * Hook for optimizing component updates based on visibility
 */
export const useVisibilityOptimization = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef();

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold },
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isVisible };
};

// Utility function for shallow comparison
const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

export default {
  useDebounce,
  useThrottle,
  useLazyImage,
  usePerformanceMonitor,
  useExpensiveCalculation,
  useVirtualScroll,
  useShallowCompare,
  useStableCallback,
  useBatchedState,
  useVisibilityOptimization,
};
