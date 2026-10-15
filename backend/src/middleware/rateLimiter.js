/**
 * Redis-Backed Distributed Rate Limiter
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { getRedisClient } = require('../config/redis');

const createRedisLimiter = ({ windowMs, max, message, keyPrefix = 'rl:' }) => {
  const redisClient = getRedisClient();

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: keyPrefix,
    }),
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: message || 'Too many requests. Please try again later.',
        },
      });
    },
  });
};

// Rate limiter for authentication attempts (10 requests per 15 minutes per IP)
const authLimiter = createRedisLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  keyPrefix: 'rl:auth:',
});

// Rate limiter for resume uploads (15 uploads per hour per user)
const uploadLimiter = createRedisLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Upload limit reached (15 resumes per hour). Please try again later.',
  keyPrefix: 'rl:upload:',
});

// General API rate limiter (120 requests per minute)
const generalLimiter = createRedisLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'API rate limit exceeded. Please throttle your requests.',
  keyPrefix: 'rl:general:',
});

module.exports = {
  authLimiter,
  uploadLimiter,
  generalLimiter,
};
