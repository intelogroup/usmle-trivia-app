/**
 * User Progress Manager - Backward Compatibility Layer
 * This file maintains backward compatibility while delegating to modular services
 * 
 * Note: This file has been refactored into smaller modules under /progress/
 * New code should import directly from the modular services for better organization
 */

// Re-export everything from the new modular structure
export {
  UserProgressManager,
  createUserProgressManager,
  useUserProgress
} from './progress/UserProgressManager';

// Import for backward compatibility
import { UserProgressManager } from './progress/UserProgressManager';

// Export as default for legacy imports
export default UserProgressManager;