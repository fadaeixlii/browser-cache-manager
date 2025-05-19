import { openDB } from "idb";
import BaseCacheDriver from './BaseCacheDriver';

/**
 * IndexedDBManager for managing IndexedDB operations.
 * Implements the BaseCacheDriver interface.
 */
class IndexedDBManager extends BaseCacheDriver {
  /** @type {string} */
  static dbName = "my-app-db";

  /** @type {string} */
  static storeName = "api-cache";

  /** @type {Promise<IDBDatabase> | null} */
  static dbPromise = null;

  /**
   * Configures the database and object store names.
   * @param {string} dbName - The name of the database.
   * @param {string} storeName - The name of the object store.
   * @example
   * IndexedDBManager.configure('custom-db', 'custom-store');
   */
  static configure(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  /**
   * Initializes the IndexedDB database.
   * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance.
   * @private
   */
  static async initDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(IndexedDBManager.storeName)) {
            db.createObjectStore(IndexedDBManager.storeName); // No keyPath; use put(value, key)
          }
        },
      });
    }
    return this.dbPromise;
  }

  /**
   * Sets data to IndexedDB.
   * @param {string} key - The key to identify the data.
   * @param {*} data - The data to be saved.
   * @returns {Promise<void>} A promise that resolves when the data is saved.
   * @example
   * await indexedDBManager.set('exampleKey', { value: 42 });
   */
  async set(key, data) {
    try {
      const db = await IndexedDBManager.initDB();
      const tx = db.transaction(IndexedDBManager.storeName, "readwrite");
      const store = tx.objectStore(IndexedDBManager.storeName);
      await store.put(data, key); // Store raw value
      await tx.done;
    } catch (error) {
      console.error('Error setting data to IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Gets data from IndexedDB.
   * @param {string} key - The key to identify the data.
   * @returns {Promise<*>} A promise that resolves to the loaded data, or null if not found.
   * @example
   * const data = await indexedDBManager.get('exampleKey');
   * console.log(data);
   */
  async get(key) {
    try {
      const db = await IndexedDBManager.initDB();
      const tx = db.transaction(IndexedDBManager.storeName, "readonly");
      const store = tx.objectStore(IndexedDBManager.storeName);
      const result = await store.get(key);
      await tx.done;
      return result === undefined ? null : result; // Return raw value
    } catch (error) {
      console.error('Error getting data from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Deletes data from IndexedDB.
   * @param {string} key - The key to identify the data to be deleted.
   * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if error.
   * @example
   * await indexedDBManager.delete('exampleKey');
   */
  async delete(key) {
    try {
      const db = await IndexedDBManager.initDB();
      const tx = db.transaction(IndexedDBManager.storeName, "readwrite");
      const store = tx.objectStore(IndexedDBManager.storeName);
      await store.delete(key);
      await tx.done;
      return true;
    } catch (error) {
      console.error('Error deleting data from IndexedDB:', error);
      return false;
    }
  }

  /**
   * Clears all data from the object store.
   * @returns {Promise<void>} A promise that resolves when the store is cleared.
   * @example
   * await indexedDBManager.clear();
   */
  async clear() {
    try {
      const db = await IndexedDBManager.initDB();
      const tx = db.transaction(IndexedDBManager.storeName, "readwrite");
      const store = tx.objectStore(IndexedDBManager.storeName);
      await store.clear();
      await tx.done;
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Retrieves all keys from the object store.
   * @returns {Promise<string[]>} A promise that resolves to an array of keys.
   * @example
   * const keys = await IndexedDBManager.getAllKeys();
   * console.log(keys);
   */
  static async getAllKeys() {
    const db = await this.initDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const keys = await store.getAllKeys();
    await tx.done;
    return keys;
  }

  /**
   * Check if the key exists in IndexedDB.
   * @param {string} key - The cache key.
   * @returns {Promise<boolean>} True if exists, false otherwise.
   */
  async has(key) {
    try {
      const db = await IndexedDBManager.initDB();
      const tx = db.transaction(IndexedDBManager.storeName, "readonly");
      const store = tx.objectStore(IndexedDBManager.storeName);
      const result = await store.get(key);
      await tx.done;
      return result !== undefined;
    } catch (error) {
      console.error('Error checking if key exists in IndexedDB:', error);
      return false;
    }
  }
}

export default IndexedDBManager;
