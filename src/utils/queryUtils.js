/**
 * Query Utilities
 * Shared utility functions for React Query hooks
 */

/**
 * Get time ago string from date
 */
export function getTimeAgo(dateString) {
  if (!dateString) return 'Unknown';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Get category color based on category name
 */
export function getCategoryColor(categoryName) {
  const colors = {
    'cardiology': 'bg-red-500',
    'neurology': 'bg-purple-500',
    'dermatology': 'bg-orange-500',
    'endocrinology': 'bg-blue-500',
    'gastroenterology': 'bg-green-500',
    'hematology': 'bg-pink-500',
    'infectious disease': 'bg-yellow-500',
    'obstetrics and gynecology': 'bg-indigo-500',
    'oncology': 'bg-gray-500',
    'orthopedics': 'bg-teal-500',
    'default': 'bg-gray-400'
  };
  
  const normalizedName = categoryName?.toLowerCase() || '';
  return colors[normalizedName] || colors.default;
}