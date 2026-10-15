/**
 * Scalable BullMQ Worker Process Entrypoint
 */

require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('./src/config/database');
const { getRedisClient, disconnectRedis } = require('./src/config/redis');
const { initWorker } = require('./src/workers/resume.worker');
const logger = require('./src/utils/logger');

let worker = null;

const startWorker = async () => {
  try {
    logger.info('Initializing BullMQ Resume Worker Process...');
    await connectDatabase();
    getRedisClient();

    worker = initWorker();
    logger.info('Resume Worker successfully initialized and listening for jobs.');
  } catch (err) {
    logger.fatal({ err: err.message }, 'Failed to start BullMQ Worker Process');
    process.exit(1);
  }
};

const handleWorkerShutdown = async (signal) => {
  logger.info({ signal }, 'Worker shutdown initiated...');
  if (worker) {
    await worker.close();
    logger.info('BullMQ worker closed.');
  }
  await disconnectDatabase();
  await disconnectRedis();
  logger.info('Worker shutdown completed.');
  process.exit(0);
};

process.on('SIGTERM', () => handleWorkerShutdown('SIGTERM'));
process.on('SIGINT', () => handleWorkerShutdown('SIGINT'));

startWorker();
