/**
 * @cache-manager
 * A flexible caching package for API calls and functions with multiple storage strategies
 */

// Main classes
import CacheManager from './cache/cacheManager';
import StrategiesManager from './cache/strategiesManager';

// Cache drivers
import BaseCacheDriver from './cache/BaseCacheDriver';
import LocalStorageManager from './cache/localStorageManager';
import CacheStorageManager from './cache/cacheStorageManager';
import IndexedDBManager from './cache/indexedDBManager';

// Enums
import CacheDriverType from './enums/CacheDriverType';
import CacheStrategies from './enums/CacheStrategies';

// Export all components
export {
  // Main classes
  CacheManager,
  StrategiesManager,
  
  // Cache drivers
  BaseCacheDriver,
  LocalStorageManager,
  CacheStorageManager,
  IndexedDBManager,
  
  // Enums
  CacheDriverType,
  CacheStrategies
};

// Default export
export default {
  CacheManager,
  StrategiesManager,
  CacheDriverType,
  CacheStrategies
};