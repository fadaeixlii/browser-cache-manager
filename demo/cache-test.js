// Import the cache manager module
import { 
  CacheManager, 
  StrategiesManager, 
  CacheDriverType, 
  CacheStrategies 
} from '/cache-manager/index.js';

// Heavy calculation function - Fibonacci with recursion (intentionally inefficient)
function fibonacci(n) {
  console.log(`Calculating fibonacci(${n})...`);
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Function to test API caching
async function testApiCaching(url, params, driverType, strategy) {
  console.log(`\n--- Testing API Caching ---`);
  console.log(`Driver: ${driverType}, Strategy: ${strategy}`);
  
  const cacheManager = new CacheManager(driverType);
  
  // Generate and log the key
  const key = cacheManager.generateApiCacheKey(url, params, null);
  console.log(`Generated API key: ${key}`);
  
  // Create fetch function
  const fetchFunc = async () => {
    console.log(`Fetching from API: ${url}`);
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const startTime = performance.now();
    const response = await fetch(fullUrl);
    const endTime = performance.now();
    console.log(`API fetch took ${(endTime - startTime).toFixed(2)}ms`);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    return response.json();
  };
  
  // First call
  console.log(`First call:`);
  const startTime1 = performance.now();
  const result1 = await cacheManager.cacheApiCall(url, fetchFunc, { 
    params, 
    strategy: strategy 
  });
  const endTime1 = performance.now();
  
  console.log(`Result: ${JSON.stringify(result1.data).substring(0, 100)}...`);
  console.log(`From cache: ${result1.fromCache}`);
  console.log(`Total time: ${(endTime1 - startTime1).toFixed(2)}ms`);
  
  // Second call (should be from cache)
  console.log(`\nSecond call (should be from cache):`);
  const startTime2 = performance.now();
  const result2 = await cacheManager.cacheApiCall(url, fetchFunc, { 
    params, 
    strategy: strategy 
  });
  const endTime2 = performance.now();
  
  console.log(`Result: ${JSON.stringify(result2.data).substring(0, 100)}...`);
  console.log(`From cache: ${result2.fromCache}`);
  console.log(`Total time: ${(endTime2 - startTime2).toFixed(2)}ms`);
}

// Function to test function caching
async function testFunctionCaching(n, driverType, strategy) {
  console.log(`\n--- Testing Function Caching ---`);
  console.log(`Driver: ${driverType}, Strategy: ${strategy}`);
  
  const cacheManager = new CacheManager(driverType);
  
  // Create cached version of fibonacci
  const cachedFib = cacheManager.cacheFunction(fibonacci, { 
    strategy: strategy 
  });
  
  // Generate and log the key
  const key = cacheManager.generateFunctionCacheKey('fibonacci', [n]);
  console.log(`Generated function key: ${key}`);
  
  // First call
  console.log(`First call:`);
  const startTime1 = performance.now();
  const result1 = await cachedFib(n);
  const endTime1 = performance.now();
  
  console.log(`Result: ${result1.data}`);
  console.log(`From cache: ${result1.fromCache}`);
  console.log(`Total time: ${(endTime1 - startTime1).toFixed(2)}ms`);
  
  // Second call (should be from cache)
  console.log(`\nSecond call (should be from cache):`);
  const startTime2 = performance.now();
  const result2 = await cachedFib(n);
  const endTime2 = performance.now();
  
  console.log(`Result: ${result2.data}`);
  console.log(`From cache: ${result2.fromCache}`);
  console.log(`Total time: ${(endTime2 - startTime2).toFixed(2)}ms`);
}

// Run tests
async function runTests() {
  // API to test
  const apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  const apiParams = { userId: 1 };
  
  // Test with different drivers and strategies
  const drivers = [
    CacheDriverType.LOCAL_STORAGE,
    CacheDriverType.CACHE_STORAGE,
    CacheDriverType.INDEXED_DB
  ];
  
  const strategies = [
    CacheStrategies.JUST_CACHE,
    CacheStrategies.CACHE_FIRST_THEN_UPDATE
  ];
  
  // Run API tests
  for (const driver of drivers) {
    for (const strategy of strategies) {
      await testApiCaching(apiUrl, apiParams, driver, strategy);
    }
  }
  
  // Run function tests (with smaller n to avoid browser hanging)
  for (const driver of drivers) {
    for (const strategy of strategies) {
      await testFunctionCaching(15, driver, strategy);
    }
  }
}

// Export functions for use in HTML
export { 
  runTests, 
  testApiCaching, 
  testFunctionCaching, 
  fibonacci 
};
