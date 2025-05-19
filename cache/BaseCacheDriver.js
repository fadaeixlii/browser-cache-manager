/**
 * BaseCacheDriver - Abstract base class for all cache drivers
 * This class defines the interface that all cache drivers must implement
 */
class BaseCacheDriver {
  /**
   * Get data from the cache.
   * @param {string} key - The cache key.
   * @returns {Promise<any>} Cached data or null if not found.
   */
  async get(key) {
    throw new Error('Method not implemented');
  }

  /**
   * Set data to the cache.
   * @param {string} key - The cache key.
   * @param {any} data - The data to cache.
   * @returns {Promise<void>}
   */
  async set(key, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete data from the cache.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} True if deleted, false if not found.
   */
  async delete(key) {
    throw new Error('Method not implemented');
  }

  /**
   * Clear all data from the cache.
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('Method not implemented');
  }

  /**
   * Check if the key exists in the cache.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} True if exists, false otherwise.
   */
  async has(key) {
    throw new Error('Method not implemented');
  }
}

export default BaseCacheDriver;
