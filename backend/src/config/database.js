/**
 * MongoDB Database Connection Manager with Connection Pooling
 */

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  try {
    const options = {
      minPoolSize: env.MONGO_MIN_POOL_SIZE,
      maxPoolSize: env.MONGO_MAX_POOL_SIZE,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err: err.message }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    await mongoose.connect(env.MONGO_URI, options);
    isConnected = true;
  } catch (err) {
    logger.fatal({ err: err.message }, 'Failed to connect to MongoDB');
    throw err;
  }
};

const disconnectDatabase = async () => {
  if (!isConnected) return;
  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection closed gracefully');
  } catch (err) {
    logger.error({ err: err.message }, 'Error closing MongoDB connection');
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  mongoose,
};
