const { Queue } = require('bullmq');
const { redisClient } = require('../services/redisService');

const QUEUE_NAME = 'resume-analysis-queue';

let resumeQueue = null;

try {
  resumeQueue = new Queue(QUEUE_NAME, {
    connection: redisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        age: 3600, // keep completed jobs for 1 hour
        count: 1000
      },
      removeOnFail: {
        age: 86400, // keep failed jobs for 24 hours
        count: 1000
      }
    }
  });

  console.log(`[BullMQ] Resume analysis queue '${QUEUE_NAME}' initialized.`);
} catch (err) {
  console.error('[BullMQ] Failed to initialize queue:', err.message);
}

/**
 * Adds a resume analysis task to the BullMQ queue
 */
const addResumeJob = async (jobData) => {
  if (!resumeQueue) {
    throw new Error('Resume queue is not available.');
  }

  const job = await resumeQueue.add('analyze-resume', jobData, {
    jobId: `resume-${jobData.resumeId}`
  });

  console.log(`[BullMQ] Job ${job.id} enqueued for resume ${jobData.resumeId}`);
  return job;
};

module.exports = {
  resumeQueue,
  QUEUE_NAME,
  addResumeJob
};
