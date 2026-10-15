/**
 * Structured Logger using Pino
 */

const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  base: {
    service: 'ai-resume-matcher-backend',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
