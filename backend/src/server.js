/**
 * Primary HTTP Server Entry Point & Graceful Shutdown Orchestration
 */

const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { getRedisClient, disconnectRedis } = require('./config/redis');
const jobRepo = require('./repositories/job.repository');
const Job = require('./models/Job');
const logger = require('./utils/logger');
const path = require('path');
const fs = require('fs');

let server = null;

const startServer = async () => {
  try {
    logger.info('Initializing AI Resume Job Matcher API Server...');

    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Initialize Redis Client
    getRedisClient();

    // 3. Auto-seed jobs if empty
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      logger.info('Database has 0 jobs. Running auto-seed from data/jobs.json...');
      const seedPaths = [
        path.resolve(process.cwd(), 'data/jobs.json'),
        path.resolve(process.cwd(), '../data/jobs.json'),
      ];
      let seeded = false;
      for (const p of seedPaths) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          const data = JSON.parse(raw);
          await Job.insertMany(data);
          logger.info({ count: data.length }, 'Auto-seeded jobs into database');
          seeded = true;
          break;
        }
      }
      if (!seeded) {
        logger.warn('Seed file data/jobs.json not found. Proceeding without auto-seed.');
      }
    } else {
      logger.info({ jobCount }, 'Verified database job listings');
    }

    // 4. Start HTTP Server
    server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          apiDocs: `http://localhost:${env.PORT}/api/docs`,
          healthCheck: `http://localhost:${env.PORT}/health`,
        },
        'HTTP Server started and listening'
      );
    });
  } catch (err) {
    logger.fatal({ err: err.message, stack: err.stack }, 'Fatal error during server startup');
    process.exit(1);
  }
};

// Graceful Shutdown Handler
const handleGracefulShutdown = async (signal) => {
  logger.info({ signal }, 'Graceful shutdown signal received. Terminating connections...');

  if (server) {
    server.close(() => {
      logger.info('HTTP server stopped accepting new incoming requests');
    });
  }

  try {
    await disconnectDatabase();
    await disconnectRedis();
    logger.info('Graceful shutdown completed successfully. Exiting process.');
    process.exit(0);
  } catch (err) {
    logger.error({ err: err.message }, 'Error during graceful shutdown sequence');
    process.exit(1);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception detected');
  process.exit(1);
});

startServer();

module.exports = app;
