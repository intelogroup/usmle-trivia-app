/**
 * Background Sync Service
 * Handles offline data synchronization, cache management, and performance optimization
 */

import { QuestionService } from './questionService';
import { logger } from '../utils/logger';

class BackgroundSyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.isProcessing = false;
    this.syncInterval = null;
    this.performanceMetrics = {
      syncSuccess: 0,
      syncFailures: 0,
      lastSyncTime: null,
      averageSyncTime: 0,
      totalDataSynced: 0
    };

    this.initializeEventListeners();
    this.startPeriodicSync();
  }

  /**
   * Initialize event listeners for online/offline status
   */
  initializeEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('BackgroundSync: Device is online, starting sync');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('BackgroundSync: Device is offline');
    });

    // Handle visibility change for performance optimization
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  /**
   * Start periodic background sync
   */
  startPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !document.hidden) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop periodic background sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Add item to sync queue
   */
  addToSyncQueue(operation, data, priority = 'normal') {
    const syncItem = {
      id: this.generateSyncId(),
      operation,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    this.syncQueue.push(syncItem);
    
    // Sort by priority and timestamp
    this.syncQueue.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return a.timestamp - b.timestamp;
    });

    logger.info('BackgroundSync: Added to queue', { operation, priority });

    // Process immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Process the sync queue
   */
  async processSyncQueue() {
    if (this.isProcessing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const syncStartTime = Date.now();

    try {
      // Process up to 5 items at a time to avoid overwhelming the system
      const itemsToProcess = this.syncQueue.splice(0, 5);
      
      const syncPromises = itemsToProcess.map(item => this.processSync(item));
      const results = await Promise.allSettled(syncPromises);

      // Handle results
      results.forEach((result, index) => {
        const item = itemsToProcess[index];
        
        if (result.status === 'fulfilled') {
          this.performanceMetrics.syncSuccess++;
          logger.info('BackgroundSync: Sync completed', { 
            operation: item.operation, 
            id: item.id 
          });
        } else {
          this.performanceMetrics.syncFailures++;
          
          // Retry logic
          if (item.retryCount < item.maxRetries) {
            item.retryCount++;
            item.timestamp = Date.now() + (item.retryCount * 30000); // Exponential backoff
            this.syncQueue.push(item);
            
            logger.warn('BackgroundSync: Sync failed, retrying', { 
              operation: item.operation, 
              retryCount: item.retryCount,
              error: result.reason
            });
          } else {
            logger.error('BackgroundSync: Sync failed permanently', { 
              operation: item.operation, 
              error: result.reason 
            });
          }
        }
      });

      // Update performance metrics
      const syncTime = Date.now() - syncStartTime;
      this.updatePerformanceMetrics(syncTime, itemsToProcess.length);

    } catch (error) {
      logger.error('BackgroundSync: Error processing sync queue', error);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more items
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processSyncQueue(), 1000);
      }
    }
  }

  /**
   * Process individual sync item
   */
  async processSync(item) {
    const { operation, data } = item;

    switch (operation) {
      case 'cache_questions':
        return this.cacheQuestions(data);
      
      case 'preload_images':
        return this.preloadImages(data);
      
      case 'sync_user_progress':
        return this.syncUserProgress(data);
      
      case 'optimize_cache':
        return this.optimizeCache(data);
      
      case 'prefetch_related':
        return this.prefetchRelatedContent(data);
      
      default:
        throw new Error(`Unknown sync operation: ${operation}`);
    }
  }

  /**
   * Cache questions for offline use
   */
  async cacheQuestions({ categoryId, difficulty, questionCount }) {
    try {
      const questions = await QuestionService.fetchQuestions(
        categoryId, 
        questionCount, 
        difficulty
      );

      // Store in localStorage for offline access
      const cacheKey = `offline-questions-${categoryId}-${difficulty || 'all'}`;
      const cacheData = {
        questions,
        timestamp: Date.now(),
        categoryId,
        difficulty,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      this.performanceMetrics.totalDataSynced += questions.length;
      
      return { success: true, cached: questions.length };
    } catch (error) {
      throw new Error(`Failed to cache questions: ${error.message}`);
    }
  }

  /**
   * Preload images for better performance
   */
  async preloadImages({ imageUrls }) {
    const results = await Promise.allSettled(
      imageUrls.map(url => this.preloadSingleImage(url))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    if (failed > 0) {
      logger.warn('BackgroundSync: Some images failed to preload', { 
        successful, 
        failed 
      });
    }

    return { successful, failed };
  }

  /**
   * Preload a single image
   */
  preloadSingleImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Store in cache if possible
        if ('caches' in window) {
          caches.open('question-images-v1').then(cache => {
            cache.add(url).catch(() => {
              // Ignore cache errors
            });
          });
        }
        resolve(url);
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => reject(new Error(`Image load timeout: ${url}`)), 10000);
    });
  }

  /**
   * Sync user progress data
   */
  async syncUserProgress({ userId, progressData }) {
    try {
      // This would typically sync with your backend
      // For now, we'll store locally
      const storageKey = `user-progress-${userId}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      const mergedData = {
        ...existingData,
        ...progressData,
        lastSyncTime: Date.now()
      };

      localStorage.setItem(storageKey, JSON.stringify(mergedData));
      
      return { success: true, synced: Object.keys(progressData).length };
    } catch (error) {
      throw new Error(`Failed to sync user progress: ${error.message}`);
    }
  }

  /**
   * Optimize cache by removing old or unused data
   */
  async optimizeCache() {
    try {
      let cleanedItems = 0;
      const now = Date.now();

      // Clean expired cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key?.startsWith('offline-questions-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            
            if (data.expiresAt && data.expiresAt < now) {
              localStorage.removeItem(key);
              cleanedItems++;
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
            cleanedItems++;
          }
        }
      }

      // Clean old cache if storage is getting full
      if (this.getStorageUsage() > 0.8) { // 80% full
        await this.cleanOldestCacheEntries();
        cleanedItems += 5; // Approximate
      }

      logger.info('BackgroundSync: Cache optimized', { cleanedItems });
      
      return { success: true, cleanedItems };
    } catch (error) {
      throw new Error(`Failed to optimize cache: ${error.message}`);
    }
  }

  /**
   * Prefetch related content based on user patterns
   */
  async prefetchRelatedContent({ categoryId, userHistory }) {
    try {
      // Analyze user patterns to determine what to prefetch
      const relatedCategories = this.analyzeRelatedCategories(categoryId, userHistory);
      let prefetchCount = 0;

      for (const relatedCategory of relatedCategories.slice(0, 3)) { // Limit to 3
        this.addToSyncQueue('cache_questions', {
          categoryId: relatedCategory,
          difficulty: null,
          questionCount: 10
        }, 'low');
        prefetchCount++;
      }

      return { success: true, prefetchCount };
    } catch (error) {
      throw new Error(`Failed to prefetch related content: ${error.message}`);
    }
  }

  /**
   * Analyze related categories based on user history
   */
  analyzeRelatedCategories(categoryId, userHistory) {
    const categoryFrequency = {};
    
    // Count category usage
    userHistory.forEach(session => {
      if (session.categoryId && session.categoryId !== categoryId) {
        categoryFrequency[session.categoryId] = 
          (categoryFrequency[session.categoryId] || 0) + 1;
      }
    });

    // Return most frequently used categories
    return Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
  }

  /**
   * Get current storage usage (0-1)
   */
  getStorageUsage() {
    try {
      const totalSize = JSON.stringify(localStorage).length;
      const maxSize = 10 * 1024 * 1024; // Assume 10MB limit
      return totalSize / maxSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clean oldest cache entries
   */
  async cleanOldestCacheEntries() {
    const cacheEntries = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('offline-questions-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          cacheEntries.push({ key, timestamp: data.timestamp || 0 });
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp and remove oldest
    cacheEntries
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 5)
      .forEach(entry => localStorage.removeItem(entry.key));
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(syncTime, itemCount) {
    this.performanceMetrics.lastSyncTime = Date.now();
    
    if (this.performanceMetrics.averageSyncTime === 0) {
      this.performanceMetrics.averageSyncTime = syncTime;
    } else {
      this.performanceMetrics.averageSyncTime = 
        (this.performanceMetrics.averageSyncTime + syncTime) / 2;
    }
  }

  /**
   * Generate unique sync ID
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get sync status and metrics
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      metrics: { ...this.performanceMetrics }
    };
  }

  /**
   * Force sync now (if online)
   */
  async forceSyncNow() {
    if (this.isOnline) {
      await this.processSyncQueue();
      return true;
    }
    return false;
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue() {
    this.syncQueue.length = 0;
    logger.info('BackgroundSync: Sync queue cleared');
  }

  /**
   * Destroy service and cleanup
   */
  destroy() {
    this.stopPeriodicSync();
    this.clearSyncQueue();
    
    window.removeEventListener('online', this.processSyncQueue);
    window.removeEventListener('offline', this.processSyncQueue);
    document.removeEventListener('visibilitychange', this.processSyncQueue);
    
    logger.info('BackgroundSync: Service destroyed');
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();

// Export class for testing
export { BackgroundSyncService }; 