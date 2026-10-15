/**
 * Central Environment Configuration & Validation
 */

require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || '*',

  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_resume_job_matcher',
  MONGO_MIN_POOL_SIZE: parseInt(process.env.MONGO_MIN_POOL_SIZE || '5', 10),
  MONGO_MAX_POOL_SIZE: parseInt(process.env.MONGO_MAX_POOL_SIZE || '50', 10),

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '1800', 10),

  // JWT Security
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_production_jwt_key_resume_matcher_2026',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  ML_TIMEOUT: parseInt(process.env.ML_TIMEOUT || '30000', 10),

  // Worker Scaling
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),

  // Azure Cloud Configuration
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER || 'resumes',
  AZURE_KEY_VAULT_URL: process.env.AZURE_KEY_VAULT_URL || '',
  APPLICATIONINSIGHTS_CONNECTION_STRING: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || '',
};

module.exports = env;
