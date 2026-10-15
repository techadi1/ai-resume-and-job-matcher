const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let isConnected = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    }
  });

  redisClient.on('connect', () => {
    isConnected = true;
    console.log(`[Redis] Connected successfully to ${REDIS_URL}`);
  });

  redisClient.on('error', (err) => {
    isConnected = false;
    console.error(`[Redis] Connection error:`, err.message);
  });
} catch (err) {
  console.error('[Redis] Failed to initialize ioredis client:', err.message);
}

// Caching helper methods
const get = async (key) => {
  if (!redisClient || !isConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`[Redis] Error getting key ${key}:`, err.message);
    return null;
  }
};

const set = async (key, value, ttlSeconds = 3600) => {
  if (!redisClient || !isConnected) return;
  try {
    const stringified = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.set(key, stringified, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, stringified);
    }
  } catch (err) {
    console.error(`[Redis] Error setting key ${key}:`, err.message);
  }
};

const del = async (key) => {
  if (!redisClient || !isConnected) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error(`[Redis] Error deleting key ${key}:`, err.message);
  }
};

const delPattern = async (pattern) => {
  if (!redisClient || !isConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err) {
    console.error(`[Redis] Error deleting pattern ${pattern}:`, err.message);
  }
};

const invalidateResumeCache = async (resumeId) => {
  if (!resumeId) return;
  try {
    await Promise.all([
      del(`resume:${resumeId}:analysis`),
      del(`resume:${resumeId}:recommended-jobs`),
      del(`resume:${resumeId}:skill-gap`),
      delPattern(`job:*:match:${resumeId}`)
    ]);
    console.log(`[Redis Cache] Invalidated cache for resume: ${resumeId}`);
  } catch (err) {
    console.error(`[Redis Cache] Error invalidating resume ${resumeId}:`, err.message);
  }
};

module.exports = {
  redisClient,
  isConnected: () => isConnected,
  get,
  set,
  del,
  delPattern,
  invalidateResumeCache
};
