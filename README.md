# Cache Manager

A flexible caching package for API calls and functions with multiple storage strategies.

## Features

- **Multiple Storage Types**: Support for LocalStorage, CacheStorage, and IndexedDB
- **Caching Strategies**:
  - `cacheFirst`: Always load from cache, only fetch if cache is empty
  - `cacheFirstThenUpdate`: Load from cache first, then update cache in background
- **API Call Caching**: Easily cache API calls with automatic key generation based on URL, query parameters, and body
- **Function Caching**: Cache any function with automatic key generation based on function name and arguments
- **Polymorphic Design**: OOP architecture with a common interface for all storage drivers
- **Easy to Extend**: Create your own cache drivers by extending the BaseCacheDriver

## Installation

```bash
npm install @fadaeixlii/browser-cache-manager
```

## Usage

### Basic Usage

```javascript
import {
  CacheManager,
  CacheDriverType,
  CacheStrategies,
} from "@fadaeixlii/browser-cache-manager";

// Create a cache manager with the desired storage type
const cacheManager = new CacheManager(CacheDriverType.LOCAL_STORAGE);

// Set data to cache
await cacheManager.set("my-key", { foo: "bar" });

// Get data from cache
const data = await cacheManager.get("my-key");
console.log(data); // { foo: 'bar' }
```

### Caching API Calls

```javascript
import {
  StrategiesManager,
  CacheStrategies,
  CacheDriverType,
} from "@fadaeixlii/browser-cache-manager";

// Cache an API call with the justCache strategy
const result = await StrategiesManager.cacheApiCall(
  "https://api.example.com/data",
  {
    params: { id: 123 },
    strategy: CacheStrategies.JUST_CACHE,
    cacheType: CacheDriverType.LOCAL_STORAGE,
  }
);

console.log(result.data); // The API response data
console.log(result.fromCache); // true if loaded from cache, false if freshly fetched
```

### Caching Functions

```javascript
import {
  StrategiesManager,
  CacheStrategies,
} from "@fadaeixlii/browser-cache-manager";

// Define an expensive function
function expensiveCalculation(a, b) {
  console.log("Calculating...");
  return a + b;
}

// Create a cached version of the function
const cachedCalculation = StrategiesManager.cacheFunction(
  expensiveCalculation,
  {
    strategy: CacheStrategies.CACHE_FIRST_THEN_UPDATE,
    cacheType: CacheDriverType.INDEXED_DB,
  }
);

// First call will execute the function
const result1 = await cachedCalculation(5, 10);
console.log(result1.data); // 15
console.log(result1.fromCache); // false

// Second call with the same arguments will use cached result
const result2 = await cachedCalculation(5, 10);
console.log(result2.data); // 15
console.log(result2.fromCache); // true
```

## API Reference

### CacheManager

The main class for managing cache operations.

```javascript
// Create a new cache manager
const cacheManager = new CacheManager(CacheDriverType.LOCAL_STORAGE);

// Basic operations
await cacheManager.set(key, data);
const data = await cacheManager.get(key);
const exists = await cacheManager.has(key);
await cacheManager.delete(key);
await cacheManager.clear();

// API caching
const result = await cacheManager.cacheApiCall(url, fetchFunc, options);

// Function caching
const cachedFunc = cacheManager.cacheFunction(originalFunc, options);
```

### StrategiesManager

A utility class for working with caching strategies.

```javascript
// Cache an API call
const result = await StrategiesManager.cacheApiCall(url, options);

// Cache a function
const cachedFunc = StrategiesManager.cacheFunction(originalFunc, options);

// Create a new cache manager
const cacheManager = StrategiesManager.createCacheManager(
  CacheDriverType.INDEXED_DB
);
```

### Cache Drivers

- `LocalStorageManager`: Uses browser's localStorage
- `CacheStorageManager`: Uses Cache API
- `IndexedDBManager`: Uses IndexedDB

### Enums

- `CacheDriverType`: Available storage types (`LOCAL_STORAGE`, `CACHE_STORAGE`, `INDEXED_DB`)
- `CacheStrategies`: Available caching strategies (`JUST_CACHE`, `CACHE_FIRST_THEN_UPDATE`)

## License

MIT
