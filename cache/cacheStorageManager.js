import BaseCacheDriver from './BaseCacheDriver';

/**
 * CacheStorageManager for managing browser Cache Storage operations.
 * Implements the BaseCacheDriver interface.
 */
class CacheStorageManager extends BaseCacheDriver {
  /** @type {string} */
  static cacheName = "default-cache";

  /**
   * Configures the cache name.
   * @param {string} cacheName - The name of the cache.
   * @example
   * CacheStorageManager.configure('custom-cache');
   */
  static configure(cacheName) {
    this.cacheName = cacheName;
  }

  /**
   * Retrieves the cache instance.
   * @returns {Promise<Cache>} A promise that resolves to the cache instance.
   * @private
   */
  static async getCache() {
    return await caches.open(this.cacheName);
  }

  /**
   * Sets data in the cache storage.
   * @param {string} key - The key to identify the data.
   * @param {*} data - The data to be stored (automatically stringified).
   * @returns {Promise<void>} A promise that resolves when the data is saved.
   * @example
   * await cacheStorageManager.set('exampleKey', { value: 42 });
   */
  async set(key, data) {
    try {
      const cache = await CacheStorageManager.getCache();
      const request = new Request(key);
      const response = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(request, response);
    } catch (error) {
      console.error('Error setting data to cache storage:', error);
      throw error;
    }
  }

  /**
   * Gets data from the cache storage.
   * @param {string} key - The key to identify the data.
   * @returns {Promise<*>} A promise that resolves to the retrieved data, or null if not found.
   * @example
   * const data = await cacheStorageManager.get('exampleKey');
   */
  async get(key) {
    try {
      const cache = await CacheStorageManager.getCache();
      const request = new Request(key);
      const response = await cache.match(request);
      if (!response) return null;
      return await response.json();
    } catch (error) {
      console.error('Error getting data from cache storage:', error);
      return null;
    }
  }

  /**
   * Deletes data from the cache storage.
   * @param {string} key - The key to identify the data to be deleted.
   * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
   * @example
   * await cacheStorageManager.delete('exampleKey');
   */
  async delete(key) {
    try {
      const cache = await CacheStorageManager.getCache();
      const request = new Request(key);
      const result = await cache.delete(request);
      return result;
    } catch (error) {
      console.error('Error deleting data from cache storage:', error);
      return false;
    }
  }

  /**
   * Clears all data from the cache storage.
   * @returns {Promise<void>} A promise that resolves when the cache is cleared.
   * @example
   * await cacheStorageManager.clear();
   */
  async clear() {
    try {
      await caches.delete(CacheStorageManager.cacheName);
    } catch (error) {
      console.error('Error clearing cache storage:', error);
      throw error;
    }
  }

  /**
   * Retrieves all keys from the cache storage.
   * @returns {Promise<string[]>} A promise that resolves to an array of keys.
   * @example
   * const keys = await CacheStorageManager.getAllKeys();
   * console.log(keys);
   */
  static async getAllKeys() {
    const cache = await this.getCache();
    const keys = [];
    const requests = await cache.keys();
    for (const request of requests) {
      keys.push(new URL(request.url).pathname); // Extracts the key from the URL
    }
    return keys;
  }

  /**
   * Check if the key exists in cache storage.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} True if exists, false otherwise.
   */
  async has(key) {
    try {
      const cache = await CacheStorageManager.getCache();
      const request = new Request(key);
      const response = await cache.match(request);
      return response !== undefined;
    } catch (error) {
      console.error('Error checking if key exists in cache storage:', error);
      return false;
    }
  }
}

export default CacheStorageManager;
