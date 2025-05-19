import CacheDriverType from "../enums/CacheDriverType";
import CacheStrategies from "../enums/CacheStrategies";
import LocalStorageManager from "./localStorageManager";
import CacheStorageManager from "./cacheStorageManager";
import IndexedDBManager from "./indexedDBManager";

/**
 * CacheManager - Main class for managing cache operations
 * Implements factory pattern to create appropriate cache drivers
 */
class CacheManager {
  /**
   * @type {LocalStorageManager|CacheStorageManager|IndexedDBManager}
   * @private
   */
  #driver;

  /**
   * Creates a new CacheManager instance with the specified driver type
   * @param {"LocalStorage"|"CacheStorage"|"IndexedDB"} driverType - The cache driver type to use
   */
  constructor(driverType = CacheDriverType.LOCAL_STORAGE) {
    this.#driver = CacheManager.createDriver(driverType);
  }

  /**
   * Factory method to create a cache driver instance
   * @param {"LocalStorage"|"CacheStorage"|"IndexedDB"} driverType - The cache driver type
   * @returns {LocalStorageManager|CacheStorageManager|IndexedDBManager} The cache driver instance
   */
  static createDriver(driverType) {
    switch (driverType) {
      case CacheDriverType.LOCAL_STORAGE:
        return new LocalStorageManager();
      case CacheDriverType.CACHE_STORAGE:
        return new CacheStorageManager();
      case CacheDriverType.INDEXED_DB:
        return new IndexedDBManager();
      default:
        throw new Error(`Unsupported cache driver type: ${driverType}`);
    }
  }

  /**
   * Get data from the cache
   * @param {string} key - The cache key
   * @returns {Promise<any>} Cached data or null if not found
   */
  async get(key) {
    return this.#driver.get(key);
  }

  /**
   * Set data to the cache
   * @param {string} key - The cache key
   * @param {any} data - The data to cache
   * @returns {Promise<void>}
   */
  async set(key, data) {
    return this.#driver.set(key, data);
  }

  /**
   * Delete data from the cache
   * @param {string} key - The cache key
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(key) {
    return this.#driver.delete(key);
  }

  /**
   * Clear all data from the cache
   * @returns {Promise<void>}
   */
  async clear() {
    return this.#driver.clear();
  }

  /**
   * Check if the key exists in the cache
   * @param {string} key - The cache key
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async has(key) {
    return this.#driver.has(key);
  }

  /**
   * Generate a cache key for an API call
   * @param {string} url - The API URL
   * @param {Object} [params=null] - The query parameters
   * @param {Object} [body=null] - The request body
   * @returns {string} The generated cache key
   */
  generateApiCacheKey(url, params = null, body = null) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const bodyString = body ? JSON.stringify(body) : '';
    return `api:${url}:${queryString}:${bodyString}`;
  }

  /**
   * Generate a cache key for a function call
   * @param {string} funcName - The function name
   * @param {Array} args - The function arguments
   * @returns {string} The generated cache key
   */
  generateFunctionCacheKey(funcName, args) {
    return `func:${funcName}:${JSON.stringify(args)}`;
  }

  /**
   * Cache an API call using the specified strategy
   * @param {string} url - The API URL
   * @param {Function} fetchFunc - The function to fetch data
   * @param {Object} options - Options for the API call
   * @param {Object} [options.params=null] - The query parameters
   * @param {Object} [options.body=null] - The request body
   * @param {string} [options.strategy='cacheFirst'] - The caching strategy to use
   * @returns {Promise<{data: any, fromCache: boolean}>} The cached or fetched data
   */
  async cacheApiCall(url, fetchFunc, options = {}) {
    const { params = null, body = null, strategy = CacheStrategies.JUST_CACHE } = options;
    const key = this.generateApiCacheKey(url, params, body);
    
    if (strategy === CacheStrategies.JUST_CACHE) {
      return this.#justCacheStrategy(key, fetchFunc);
    } else if (strategy === CacheStrategies.CACHE_FIRST_THEN_UPDATE) {
      return this.#cacheFirstThenUpdateStrategy(key, fetchFunc);
    } else {
      throw new Error(`Unsupported caching strategy: ${strategy}`);
    }
  }

  /**
   * Cache a function call using the specified strategy
   * @param {Function} func - The function to cache
   * @param {Object} options - Options for the function caching
   * @param {string} [options.strategy='cacheFirst'] - The caching strategy to use
   * @param {string} [options.keyPrefix=''] - Optional prefix for the cache key
   * @returns {Function} The cached function
   */
  cacheFunction(func, options = {}) {
    const { strategy = CacheStrategies.JUST_CACHE, keyPrefix = '' } = options;
    const self = this;
    
    return async function(...args) {
      const funcName = func.name || 'anonymous';
      const key = keyPrefix 
        ? `${keyPrefix}:${self.generateFunctionCacheKey(funcName, args)}` 
        : self.generateFunctionCacheKey(funcName, args);
      
      const fetchFunc = () => func.apply(this, args);
      
      if (strategy === CacheStrategies.JUST_CACHE) {
        return self.#justCacheStrategy(key, fetchFunc);
      } else if (strategy === CacheStrategies.CACHE_FIRST_THEN_UPDATE) {
        return self.#cacheFirstThenUpdateStrategy(key, fetchFunc);
      } else {
        throw new Error(`Unsupported caching strategy: ${strategy}`);
      }
    };
  }

  /**
   * Implements the 'justCache' strategy
   * @param {string} key - The cache key
   * @param {Function} fetchFunc - The function to fetch data
   * @returns {Promise<{data: any, fromCache: boolean}>} The cached or fetched data
   * @private
   */
  async #justCacheStrategy(key, fetchFunc) {
    const cachedData = await this.get(key);
    
    if (cachedData) {
      return { data: cachedData, fromCache: true };
    }
    
    try {
      const freshData = await fetchFunc();
      await this.set(key, freshData);
      return { data: freshData, fromCache: false };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  /**
   * Implements the 'cacheFirstThenUpdate' strategy
   * @param {string} key - The cache key
   * @param {Function} fetchFunc - The function to fetch data
   * @returns {Promise<{data: any, fromCache: boolean}>} The cached or fetched data
   * @private
   */
  async #cacheFirstThenUpdateStrategy(key, fetchFunc) {
    const cachedData = await this.get(key);
    
    if (cachedData) {
      // Return cached data immediately and update in background
      setTimeout(async () => {
        try {
          const freshData = await fetchFunc();
          await this.set(key, freshData);
        } catch (error) {
          console.error('Background update failed:', error);
        }
      }, 0);
      
      return { data: cachedData, fromCache: true };
    }
    
    // No cached data, fetch synchronously
    try {
      const freshData = await fetchFunc();
      await this.set(key, freshData);
      return { data: freshData, fromCache: false };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
}

export default CacheManager;
