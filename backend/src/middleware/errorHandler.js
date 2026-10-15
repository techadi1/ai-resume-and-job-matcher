/**
 * Centralized Global Error Handling Middleware
 */

const { ZodError } = require('zod');
const { AppError } = require('../errors/AppError');
const env = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected internal error occurred.';
  let details = err.details || [];

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    const issues = err.issues || err.errors || [];
    details = issues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
      message: e.message,
    }));
  }
  // Handle Mongoose Validation Errors
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation error';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle Mongoose Duplicate Key Error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'CONFLICT_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    message = `A record with this ${field} already exists.`;
  }
  // Handle Multer Size Limit Error
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    code = 'FILE_TOO_LARGE';
    message = 'File size exceeds maximum allowed limit of 10MB.';
  }
  // Handle JWT Malformed / Signature Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTHENTICATION_ERROR';
    message = 'Malformed or invalid authentication token.';
  }

  // Log error with request ID
  logger.error(
    {
      requestId: req.id,
      statusCode,
      code,
      message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    'Error response dispatched'
  );

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};

module.exports = errorHandler;
