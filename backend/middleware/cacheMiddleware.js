import NodeCache from 'node-cache';

// Cache configuration: data expires after 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * High-performance Caching Middleware.
 * Intercepts GET requests and serves data from RAM if it was requested recently,
 * drastically reducing database load and improving response times to ~1ms.
 */
export const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Create a unique cache key based on the URL and User ID (to prevent leaking data across users)
  const key = `__express__${req.originalUrl || req.url}__user__${req.user?.id || 'guest'}`;
  
  const cachedBody = cache.get(key);
  
  if (cachedBody) {
    console.log(`[Cache Hit] Serving high-speed response for: ${key}`);
    return res.json(cachedBody);
  } else {
    // Override res.json to capture the response before it's sent to the client
    const originalJson = res.json;
    res.json = (body) => {
      console.log(`[Cache Miss] Storing response in RAM for: ${key}`);
      cache.set(key, body);
      // Send the response using the original json function
      originalJson.call(res, body);
    };
    next();
  }
};

/**
 * Utility to clear cache when data is modified (POST/PUT/DELETE)
 */
export const clearCache = (req, res, next) => {
  if (req.method !== 'GET') {
    // A blunt approach: clear all cache for this user/route prefix
    // In production, you'd target specific keys
    cache.flushAll(); 
  }
  next();
};
