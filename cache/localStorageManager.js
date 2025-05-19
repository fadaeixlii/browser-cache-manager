import BaseCacheDriver from './BaseCacheDriver';

/**
 * LocalStorageManager for managing browser localStorage operations.
 * Implements the BaseCacheDriver interface.
 */
class LocalStorageManager extends BaseCacheDriver {
  /** @type {string} */
  static prefix = "default-";

  /**
   * Configures a prefix for all keys to avoid conflicts.
   * @param {string} prefix - The prefix to use for all keys.
   * @example
   * LocalStorageManager.configure('custom-');
   */
  static configure(prefix) {
    this.prefix = prefix;
  }

  /**
   * Constructs the full key with the prefix.
   * @param {string} key - The key to construct.
   * @returns {string} The full key with the prefix.
   * @private
   */
  static constructKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Sets data in localStorage.
   * @param {string} key - The key to identify the data.
   * @param {*} data - The data to be stored (automatically stringified).
   * @returns {Promise<void>}
   * @example
   * await LocalStorageManager.set('exampleKey', { value: 42 });
   */
  async set(key, data) {
    try {
      const fullKey = LocalStorageManager.constructKey(key);
      localStorage.setItem(fullKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting data to localStorage:', error);
      throw error;
    }
  }

  /**
   * Gets data from localStorage.
   * @param {string} key - The key to identify the data.
   * @returns {Promise<any>} The retrieved data, or null if not found.
   * @example
   * const data = await LocalStorageManager.get('exampleKey');
   */
  async get(key) {
    try {
      const fullKey = LocalStorageManager.constructKey(key);
      const storedData = localStorage.getItem(fullKey);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error getting data from localStorage:', error);
      return null;
    }
  }

  /**
   * Deletes data from localStorage.
   * @param {string} key - The key to identify the data to be deleted.
   * @returns {Promise<boolean>} True if deleted, false if not found.
   * @example
   * await LocalStorageManager.delete('exampleKey');
   */
  async delete(key) {
    try {
      const fullKey = LocalStorageManager.constructKey(key);
      if (localStorage.getItem(fullKey) === null) {
        return false;
      }
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Error deleting data from localStorage:', error);
      return false;
    }
  }

  /**
   * Clears all keys with the configured prefix from localStorage.
   * @returns {Promise<void>}
   * @example
   * await LocalStorageManager.clear();
   */
  async clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((storedKey) => {
        if (storedKey.startsWith(LocalStorageManager.prefix)) {
          localStorage.removeItem(storedKey);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw error;
    }
  }

  /**
   * Retrieves all keys with the configured prefix from localStorage.
   * @returns {string[]} An array of keys without the prefix.
   * @example
   * const keys = LocalStorageManager.getAllKeys();
   * console.log(keys);
   */
  static getAllKeys() {
    const keys = Object.keys(localStorage);
    return keys
      .filter((storedKey) => storedKey.startsWith(this.prefix))
      .map((storedKey) => storedKey.replace(this.prefix, ""));
  }

  /**
   * Check if the key exists in localStorage.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} True if exists, false otherwise.
   */
  async has(key) {
    try {
      const fullKey = LocalStorageManager.constructKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.error('Error checking if key exists in localStorage:', error);
      return false;
    }
  }
}

export default LocalStorageManager;
