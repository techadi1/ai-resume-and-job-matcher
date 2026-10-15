const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const JobMatch = require('../models/JobMatch');
const { redisClient, invalidateResumeCache, set } = require('../services/redisService');
const { analyzeResume, matchJobs } = require('../services/mlService');

const QUEUE_NAME = 'resume-analysis-queue';

/**
 * Worker processor function for handling resume analysis
 */
const processResumeJob = async (job) => {
  const { resumeId, userId, filePath } = job.data;
  console.log(`[Worker] Started processing Job ${job.id} for Resume ${resumeId}`);

  // 1. Fetch resume record
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new Error(`Resume with ID ${resumeId} not found in database.`);
  }

  // Update status to PROCESSING
  resume.analysisStatus = 'PROCESSING';
  resume.errorMessage = null;
  await resume.save();

  try {
    // 2. Call Python ML Service to analyze resume
    console.log(`[Worker] Sending resume to ML Service: ${filePath}`);
    const analysisResponse = await analyzeResume({ filePath });

    const { parsed, analysis } = analysisResponse;

    // 3. Update Resume in MongoDB with parsed data and analysis score
    resume.candidateName = parsed.candidateName || resume.candidateName;
    resume.email = parsed.email || resume.email;
    resume.phone = parsed.phone || resume.phone;
    resume.linkedin = parsed.linkedin || resume.linkedin;
    resume.github = parsed.github || resume.github;
    resume.extractedText = parsed.extractedText || '';
    resume.skills = parsed.skills || [];
    resume.education = parsed.education || '';
    resume.experience = parsed.experience || '';
    resume.projects = parsed.projects || '';
    resume.certifications = parsed.certifications || '';
    resume.resumeScore = analysis.overallScore || 0;
    resume.analysisResult = analysis;

    // 4. Fetch realistic jobs from MongoDB to calculate matching scores
    const jobs = await Job.find({}).lean();
    console.log(`[Worker] Found ${jobs.length} jobs in database for matching`);

    let matchedJobs = [];
    let skillGap = null;

    if (jobs.length > 0) {
      const matchResponse = await matchJobs(parsed, jobs);
      matchedJobs = matchResponse.matchedJobs || [];
      skillGap = matchResponse.skillGap || null;

      // 5. Store / update JobMatch documents in MongoDB
      const jobMatchOperations = matchedJobs.map((m) => ({
        updateOne: {
          filter: { resumeId: resume._id, jobId: m.jobId },
          update: {
            $set: {
              userId: resume.userId,
              resumeId: resume._id,
              jobId: m.jobId,
              matchPercentage: m.matchPercentage,
              similarityScore: m.textSimilarity,
              skillScore: m.skillScore,
              experienceScore: m.experienceScore,
              matchedSkills: m.matchedSkills,
              missingSkills: m.missingSkills,
              missingRequiredSkills: m.missingRequiredSkills
            }
          },
          upsert: true
        }
      }));

      if (jobMatchOperations.length > 0) {
        await JobMatch.bulkWrite(jobMatchOperations);
        console.log(`[Worker] Saved ${jobMatchOperations.length} JobMatch records.`);
      }
    }

    // Attach skillGap to analysisResult for fast dashboard rendering
    resume.analysisResult = {
      ...analysis,
      skillGap: skillGap
    };

    resume.analysisStatus = 'COMPLETED';
    resume.errorMessage = null;
    await resume.save();

    // 6. Redis: Invalidate old caches and populate fresh analysis cache
    await invalidateResumeCache(resumeId);
    await set(`resume:${resumeId}:analysis`, {
      resume,
      analysis: resume.analysisResult
    }, 3600);

    if (matchedJobs.length > 0) {
      await set(`resume:${resumeId}:recommended-jobs`, matchedJobs.slice(0, 15), 3600);
    }
    if (skillGap) {
      await set(`resume:${resumeId}:skill-gap`, skillGap, 3600);
    }

    console.log(`[Worker] Successfully completed processing for Resume ${resumeId} (Score: ${resume.resumeScore})`);
    return { success: true, resumeId, score: resume.resumeScore };

  } catch (err) {
    console.error(`[Worker Error] Processing failed for Resume ${resumeId}:`, err.message);

    // If final attempt has been reached, mark as FAILED
    if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
      resume.analysisStatus = 'FAILED';
      resume.errorMessage = err.message;
      await resume.save();
      console.error(`[Worker] Mark Resume ${resumeId} as FAILED after max attempts.`);
    }

    throw err; // BullMQ catches and triggers backoff retry if attempts remain
  }
};

/**
 * Initializes and starts the BullMQ Worker
 */
const initWorker = () => {
  const worker = new Worker(QUEUE_NAME, processResumeJob, {
    connection: redisClient,
    concurrency: 2
  });

  worker.on('active', (job) => {
    console.log(`[BullMQ Worker] Job ${job.id} is now ACTIVE.`);
  });

  worker.on('completed', (job, result) => {
    console.log(`[BullMQ Worker] Job ${job.id} COMPLETED. Score: ${result.score}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job ${job.id} FAILED with error: ${err.message}`);
  });

  return worker;
};

module.exports = {
  processResumeJob,
  initWorker
};
