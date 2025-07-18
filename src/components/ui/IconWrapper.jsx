import React from 'react';
import { Activity } from 'lucide-react';
import logger from '../../utils/logger';

/**
 * IconWrapper - A safe wrapper for icons that handles fallbacks gracefully
 * Prevents crashes from missing or invalid icons
 */
const IconWrapper = ({ icon: IconComponent, fallback = Activity, ...props }) => {
  // If no icon is provided, use fallback
  if (!IconComponent) {
    const FallbackIcon = fallback;
    return <FallbackIcon {...props} />;
  }

  // If icon is a string, it's invalid, use fallback
  if (typeof IconComponent === 'string') {
    const FallbackIcon = fallback;
    return <FallbackIcon {...props} />;
  }

  // Try to render the icon with error boundary
  try {
    return <IconComponent {...props} />;
  } catch (error) {
    logger.warn('Icon rendering failed, using fallback', { iconComponent: IconComponent?.name }, error);
    const FallbackIcon = fallback;
    return <FallbackIcon {...props} />;
  }
};

export default IconWrapper; 