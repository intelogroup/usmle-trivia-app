import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for managing focus in complex UI interactions
 * Provides utilities for focus management, keyboard navigation, and accessibility
 */
export const useFocusManagement = () => {
  const previousFocusRef = useRef(null);
  const trapRef = useRef(null);

  // Store the currently focused element
  const storeFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  // Restore focus to previously focused element
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  }, []);

  // Focus the first focusable element in a container
  const focusFirst = useCallback((container) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  // Focus the last focusable element in a container
  const focusLast = useCallback((container) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  // Move focus to next/previous element
  const focusNext = useCallback((container) => {
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  }, []);

  const focusPrevious = useCallback((container) => {
    const focusableElements = getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const previousIndex =
      currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[previousIndex]?.focus();
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    trapRef,
  };
};

/**
 * Hook for creating a focus trap within a container
 * Useful for modals, dropdowns, and other overlay components
 */
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);
  const { storeFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store current focus
    storeFocus();

    // Focus first element in container
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus when trap is deactivated
      restoreFocus();
    };
  }, [isActive, storeFocus, restoreFocus]);

  return containerRef;
};

/**
 * Hook for handling keyboard navigation in lists/grids
 * Supports arrow key navigation with customizable behavior
 */
export const useKeyboardNavigation = ({
  itemCount,
  currentIndex,
  onIndexChange,
  orientation = "vertical",
  wrap = true,
  gridColumns = 1,
}) => {
  const handleKeyDown = useCallback(
    (event) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case "ArrowUp":
          if (orientation === "vertical" || gridColumns > 1) {
            event.preventDefault();
            newIndex = currentIndex - (gridColumns || 1);
            if (newIndex < 0) {
              newIndex = wrap ? itemCount - 1 : 0;
            }
          }
          break;

        case "ArrowDown":
          if (orientation === "vertical" || gridColumns > 1) {
            event.preventDefault();
            newIndex = currentIndex + (gridColumns || 1);
            if (newIndex >= itemCount) {
              newIndex = wrap ? 0 : itemCount - 1;
            }
          }
          break;

        case "ArrowLeft":
          if (orientation === "horizontal" || gridColumns > 1) {
            event.preventDefault();
            newIndex = currentIndex - 1;
            if (newIndex < 0) {
              newIndex = wrap ? itemCount - 1 : 0;
            }
          }
          break;

        case "ArrowRight":
          if (orientation === "horizontal" || gridColumns > 1) {
            event.preventDefault();
            newIndex = currentIndex + 1;
            if (newIndex >= itemCount) {
              newIndex = wrap ? 0 : itemCount - 1;
            }
          }
          break;

        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;

        case "End":
          event.preventDefault();
          newIndex = itemCount - 1;
          break;

        default:
          return;
      }

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < itemCount) {
        onIndexChange(newIndex);
      }
    },
    [currentIndex, itemCount, onIndexChange, orientation, wrap, gridColumns],
  );

  return { handleKeyDown };
};

/**
 * Hook for managing focus announcements to screen readers
 */
export const useFocusAnnouncement = () => {
  const announcementRef = useRef(null);

  const announce = useCallback((message, priority = "polite") => {
    if (!announcementRef.current) {
      // Create announcement element if it doesn't exist
      const element = document.createElement("div");
      element.setAttribute("aria-live", priority);
      element.setAttribute("aria-atomic", "true");
      element.style.position = "absolute";
      element.style.left = "-10000px";
      element.style.width = "1px";
      element.style.height = "1px";
      element.style.overflow = "hidden";
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    // Clear and set new message
    announcementRef.current.textContent = "";
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup announcement element
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  return { announce };
};

// Utility function to get all focusable elements in a container
const getFocusableElements = (container) => {
  if (!container) return [];

  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ");

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => {
      // Check if element is visible and not hidden
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    },
  );
};

export default useFocusManagement;
