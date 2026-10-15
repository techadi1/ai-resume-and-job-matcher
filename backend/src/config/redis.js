/**
 * Central Redis Client Configuration & Lifecycle
 */

const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;

const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 3000);
      logger.warn({ attempt: times, nextRetryMs: delay }, 'Redis connection retry');
      return delay;
    },
    reconnectOnError(err) {
      logger.warn({ err: err.message }, 'Redis reconnect on error');
      return true;
    },
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client is ready to receive commands');
  });

  redisClient.on('error', (err) => {
    logger.error({ err: err.message }, 'Redis error');
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed gracefully');
    } catch (err) {
      logger.error({ err: err.message }, 'Error closing Redis client');
    }
  }
};

module.exports = {
  getRedisClient,
  disconnectRedis,
};
