/**
 * Distributed Lock using Redis SET NX PX
 */

const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class DistributedLock {
  constructor() {
    this.client = getRedisClient();
  }

  /**
   * Acquire a distributed lock.
   * Returns a lockToken string if acquired, or null if lock is currently held.
   */
  async acquire(lockKey, ttlSeconds = 60) {
    const lockToken = Math.random().toString(36).substring(2) + Date.now();
    try {
      const result = await this.client.set(
        `lock:${lockKey}`,
        lockToken,
        'NX',
        'EX',
        ttlSeconds
      );
      if (result === 'OK') {
        return lockToken;
      }
      return null;
    } catch (err) {
      logger.error({ lockKey, err: err.message }, 'Failed to acquire distributed lock');
      return null;
    }
  }

  /**
   * Release the distributed lock safely using a Lua script to ensure
   * the lock is only released by the owner who holds the token.
   */
  async release(lockKey, lockToken) {
    if (!lockToken) return false;

    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await this.client.eval(luaScript, 1, `lock:${lockKey}`, lockToken);
      return result === 1;
    } catch (err) {
      logger.error({ lockKey, err: err.message }, 'Failed to release distributed lock');
      return false;
    }
  }
}

module.exports = new DistributedLock();
