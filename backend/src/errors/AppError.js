/**
 * Standardized Application Error Hierarchy
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied: insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict or duplicate record') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class StorageError extends AppError {
  constructor(message = 'File storage operation failed', details = []) {
    super(message, 500, 'STORAGE_ERROR', details);
  }
}

class MLServiceError extends AppError {
  constructor(message = 'ML Processing service error', details = []) {
    super(message, 502, 'ML_SERVICE_ERROR', details);
  }
}

class QueueError extends AppError {
  constructor(message = 'Background job queue operation failed') {
    super(message, 503, 'QUEUE_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  StorageError,
  MLServiceError,
  QueueError,
};
