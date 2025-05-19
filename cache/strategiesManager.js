import CacheStrategies from "../enums/CacheStrategies";
import CacheDriverType from "../enums/CacheDriverType";
import CacheManager from "./cacheManager";

/**
 * StrategiesManager - Utility class for working with caching strategies
 * This class provides helper methods for using the caching strategies
 */
class StrategiesManager {
  /**
   * Cache an API call using the specified strategy
   * @param {string} url - The API URL to fetch data from
   * @param {Object} options - Options for the API call
   * @param {Object} [options.params=null] - The query parameters
   * @param {Object} [options.body=null] - The request body
   * @param {string} [options.method='GET'] - The HTTP method
   * @param {string} [options.strategy='justCache'] - The caching strategy to use
   * @param {"LocalStorage"|"CacheStorage"|"IndexedDB"} [options.cacheType='LocalStorage'] - The cache type
   * @param {Object} [options.fetchOptions={}] - Additional fetch options
   * @returns {Promise<{data: any, fromCache: boolean}>} The cached or fetched data
   */
  static async cacheApiCall(url, options = {}) {
    const { 
      params = null, 
      body = null, 
      method = 'GET', 
      strategy = CacheStrategies.JUST_CACHE,
      cacheType = CacheDriverType.LOCAL_STORAGE,
      fetchOptions = {}
    } = options;
    
    const cacheManager = new CacheManager(cacheType);
    
    const fetchFunc = async () => {
      const fetchUrl = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
      const response = await fetch(fetchUrl, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        ...fetchOptions
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      
      return response.json();
    };
    
    return cacheManager.cacheApiCall(url, fetchFunc, { params, body, strategy });
  }

  /**
   * Cache a function using the specified strategy
   * @param {Function} func - The function to cache
   * @param {Object} options - Options for the function caching
   * @param {string} [options.strategy='justCache'] - The caching strategy to use
   * @param {"LocalStorage"|"CacheStorage"|"IndexedDB"} [options.cacheType='LocalStorage'] - The cache type
   * @param {string} [options.keyPrefix=''] - Optional prefix for the cache key
   * @returns {Function} The cached function
   */
  static cacheFunction(func, options = {}) {
    const { 
      strategy = CacheStrategies.JUST_CACHE,
      cacheType = CacheDriverType.LOCAL_STORAGE,
      keyPrefix = ''
    } = options;
    
    const cacheManager = new CacheManager(cacheType);
    return cacheManager.cacheFunction(func, { strategy, keyPrefix });
  }

  /**
   * Create a new cache manager instance
   * @param {"LocalStorage"|"CacheStorage"|"IndexedDB"} [cacheType='LocalStorage'] - The cache type
   * @returns {CacheManager} A new cache manager instance
   */
  static createCacheManager(cacheType = CacheDriverType.LOCAL_STORAGE) {
    return new CacheManager(cacheType);
  }
}

export default StrategiesManager;
