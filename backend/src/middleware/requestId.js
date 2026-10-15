/**
 * Request Correlation ID Middleware
 */

const { randomUUID } = require('crypto');
const logger = require('../utils/logger');

const requestIdMiddleware = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);

  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        userId: req.user ? req.user._id : undefined,
      },
      'HTTP Request Handled'
    );
  });

  next();
};

module.exports = requestIdMiddleware;
