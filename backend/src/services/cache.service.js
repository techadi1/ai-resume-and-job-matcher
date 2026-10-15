/**
 * Redis Cache Service (Cache-Aside Pattern)
 */

const { getRedisClient } = require('../config/redis');
const { CACHE_TTL } = require('../constants');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = getRedisClient();
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      logger.warn({ key, err: err.message }, 'Cache GET error - falling back to database');
      return null;
    }
  }

  async set(key, value, ttlSeconds = CACHE_TTL.MEDIUM) {
    try {
      const stringified = JSON.stringify(value);
      await this.client.set(key, stringified, 'EX', ttlSeconds);
    } catch (err) {
      logger.warn({ key, err: err.message }, 'Cache SET error');
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.warn({ key, err: err.message }, 'Cache DEL error');
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      logger.warn({ pattern, err: err.message }, 'Cache DEL pattern error');
    }
  }

  async wrap(key, fetchFn, ttlSeconds = CACHE_TTL.MEDIUM) {
    const cached = await this.get(key);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    const freshData = await fetchFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }
    return { data: freshData, fromCache: false };
  }
}

module.exports = new CacheService();
