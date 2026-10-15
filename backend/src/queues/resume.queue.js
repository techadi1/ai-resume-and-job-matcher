/**
 * BullMQ Resume Analysis Queue
 */

const { Queue } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const { QUEUES } = require('../constants');
const logger = require('../utils/logger');
const { QueueError } = require('../errors/AppError');

let resumeQueue = null;

const getResumeQueue = () => {
  if (resumeQueue) return resumeQueue;

  const redisClient = getRedisClient();

  resumeQueue = new Queue(QUEUES.RESUME_ANALYSIS, {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  });

  resumeQueue.on('error', (err) => {
    logger.error({ err: err.message }, 'BullMQ Resume Queue Error');
  });

  return resumeQueue;
};

/**
 * Add a resume analysis task to the queue with deterministic, idempotent job ID.
 */
const addResumeAnalysisJob = async ({ resumeId, userId, analysisVersion = 1, priority = 1 }) => {
  try {
    const queue = getResumeQueue();
    const jobId = `resume-analysis:${resumeId}:${analysisVersion}`;

    const job = await queue.add(
      'analyze',
      { resumeId, userId, analysisVersion },
      {
        jobId,
        priority,
      }
    );

    logger.info({ jobId, resumeId, userId }, 'Enqueued resume analysis job');
    return job;
  } catch (err) {
    logger.error({ err: err.message, resumeId }, 'Failed to enqueue resume analysis job');
    throw new QueueError(`Failed to queue resume for analysis: ${err.message}`);
  }
};

module.exports = {
  getResumeQueue,
  addResumeAnalysisJob,
};
