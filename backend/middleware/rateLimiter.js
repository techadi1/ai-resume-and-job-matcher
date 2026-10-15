const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient, isConnected } = require('../services/redisService');

const createLimiter = (options) => {
  const config = {
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || 'Too many requests. Please try again later.'
    }
  };

  // If Redis is online, use RedisStore
  if (redisClient && isConnected()) {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: options.prefix || 'rl:'
    });
  }

  return rateLimit(config);
};

// 1. Auth Rate Limiter (20 requests per 15 mins)
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  prefix: 'rl:auth:',
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
});

// 2. Upload Rate Limiter (15 uploads per 15 mins)
const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  prefix: 'rl:upload:',
  message: 'Upload limit reached. Please wait a few minutes before submitting another resume.'
});

// 3. General API Limiter (200 requests per 15 mins)
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  prefix: 'rl:api:',
  message: 'Rate limit exceeded. Please throttle your requests.'
});

module.exports = {
  authLimiter,
  uploadLimiter,
  apiLimiter
};
