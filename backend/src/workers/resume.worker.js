/**
 * BullMQ Scalable Resume Worker
 */

const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const { getRedisClient } = require('../config/redis');
const env = require('../config/env');
const { QUEUES, RESUME_STATUS, AUDIT_ACTIONS, CACHE_KEYS } = require('../constants');
const distributedLock = require('../locks/distributedLock');
const resumeRepo = require('../repositories/resume.repository');
const jobRepo = require('../repositories/job.repository');
const jobMatchRepo = require('../repositories/jobMatch.repository');
const auditRepo = require('../repositories/auditLog.repository');
const storageService = require('../services/storage.service');
const mlClient = require('../integrations/mlClient');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');

const processResumeJob = async (job) => {
  const { resumeId, userId, analysisVersion } = job.data;
  const startTime = Date.now();

  logger.info({ jobId: job.id, resumeId, userId }, 'Worker received resume analysis job');

  // 1. Acquire Distributed Lock (idempotency across horizontal workers)
  const lockKey = `analysis:${resumeId}:${analysisVersion}`;
  const lockToken = await distributedLock.acquire(lockKey, 180);
  if (!lockToken) {
    logger.warn({ lockKey }, 'Another worker is already processing this resume version. Skipping duplicate execution.');
    return;
  }

  let tempFilePath = null;

  try {
    // 2. Fetch Resume Record
    const resume = await resumeRepo.findById(resumeId);
    if (!resume) {
      logger.error({ resumeId }, 'Resume record not found in database');
      return;
    }

    // 3. Update Status to PROCESSING
    await resumeRepo.updateById(resumeId, {
      analysisStatus: RESUME_STATUS.PROCESSING,
      analysisStartedAt: new Date(),
      analysisError: null,
    });

    // 4. Resolve file path for ML processing
    tempFilePath = storageService.getLocalFilePath(resume.storageKey);
    if (!tempFilePath || !fs.existsSync(tempFilePath)) {
      // Download buffer from storage and write to temporary file
      const fileBuffer = await storageService.download(resume.storageKey);
      const tempDir = path.resolve(process.cwd(), 'uploads');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      tempFilePath = path.join(tempDir, `temp_${Date.now()}_${resume.fileName}`);
      await fs.promises.writeFile(tempFilePath, fileBuffer);
    }

    // 5. Call Python ML Service for resume parsing and NLP analysis
    logger.info({ resumeId, tempFilePath }, 'Calling ML service for resume analysis');
    const mlResponse = await mlClient.analyzeResume({ filePath: tempFilePath });

    if (!mlResponse || !mlResponse.success) {
      throw new Error(mlResponse?.error || 'ML Service returned unsuccessful analysis result');
    }

    const parsed = mlResponse.parsed || mlResponse.data?.parsed;
    const analysis = mlResponse.analysis || mlResponse.data?.analysis;

    if (!parsed || !analysis) {
      throw new Error('ML Service did not return parsed resume data or analysis results');
    }

    // 6. Update Resume record with analysis results
    const updatedResume = await resumeRepo.updateById(resumeId, {
      candidateName: parsed.candidateName || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      linkedin: parsed.linkedin || null,
      github: parsed.github || null,
      extractedText: parsed.extractedText || '',
      skills: parsed.skills || [],
      education: parsed.education || null,
      experience: parsed.experience || null,
      projects: parsed.projects || null,
      certifications: parsed.certifications || [],
      resumeScore: analysis.overallScore || 0,
      analysisStatus: RESUME_STATUS.COMPLETED,
      analysisCompletedAt: new Date(),
      analysisResult: {
        overallScore: analysis.overallScore || 0,
        scoreBreakdown: analysis.scoreBreakdown || {},
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        keywords: parsed.keywords || [],
      },
    });

    // 7. Scalable Job Matching Pipeline
    // Candidate pre-filtering: fetch up to 300 active candidate jobs based on extracted skills
    logger.info({ resumeId, skillCount: parsed.skills.length }, 'Pre-filtering candidate jobs for ML matching');
    const candidateJobs = await jobRepo.findCandidateJobs({
      skills: parsed.skills,
      limit: 300,
    });

    if (candidateJobs.length > 0) {
      const resumeDataForMatching = {
        extractedText: parsed.extractedText,
        skills: parsed.skills,
        experience: parsed.experience,
      };

      const matchResponse = await mlClient.matchJobs({
        resumeData: resumeDataForMatching,
        jobs: candidateJobs,
      });

      const matchedList = matchResponse?.matchedJobs || matchResponse?.data?.matchedJobs || (Array.isArray(matchResponse?.data) ? matchResponse.data : []);

      if (matchedList && matchedList.length > 0) {
        const matchesToUpsert = matchedList.map((m) => ({
          userId,
          resumeId,
          jobId: m.jobId,
          matchPercentage: Math.round(m.matchPercentage),
          similarityScore: m.similarityScore !== undefined ? (m.similarityScore > 1 ? m.similarityScore / 100 : m.similarityScore) : (m.textSimilarity ? m.textSimilarity / 100 : 0),
          skillScore: m.skillScore !== undefined ? (m.skillScore > 1 ? m.skillScore / 100 : m.skillScore) : 0,
          experienceScore: m.experienceScore !== undefined ? (m.experienceScore > 1 ? m.experienceScore / 100 : m.experienceScore) : 0,
          matchedSkills: m.matchedSkills || [],
          missingSkills: m.missingSkills || [],
          matchingKeywords: m.matchingKeywords || [],
          recommendations: m.recommendations || [],
          algorithmVersion: 'v1.0',
        }));

        await jobMatchRepo.upsertMany(matchesToUpsert);
        logger.info({ resumeId, matchesComputed: matchesToUpsert.length }, 'Saved job matches');
      }
    }

    // 8. Invalidate Caches
    await Promise.all([
      cacheService.del(CACHE_KEYS.RESUME_ANALYSIS(resumeId)),
      cacheService.del(CACHE_KEYS.RESUME_RECOMMENDATIONS(resumeId)),
      cacheService.del(CACHE_KEYS.RESUME_SKILL_GAP(resumeId)),
      cacheService.del(CACHE_KEYS.DASHBOARD_SUMMARY(userId)),
    ]);

    // 9. Record Audit Log
    await auditRepo.log({
      userId,
      action: AUDIT_ACTIONS.RESUME_ANALYSIS_COMPLETED,
      resourceType: 'Resume',
      resourceId: resumeId.toString(),
      metadata: {
        score: analysis.overallScore,
        skillsCount: parsed.skills.length,
        durationMs: Date.now() - startTime,
      },
    });

    logger.info({ resumeId, durationMs: Date.now() - startTime }, 'Resume analysis completed successfully');
  } catch (err) {
    logger.error({ resumeId, err: err.message }, 'Resume analysis pipeline failed');

    // Update Status to FAILED
    await resumeRepo.updateById(resumeId, {
      analysisStatus: RESUME_STATUS.FAILED,
      analysisError: err.message,
    });

    await auditRepo.log({
      userId,
      action: AUDIT_ACTIONS.RESUME_ANALYSIS_FAILED,
      resourceType: 'Resume',
      resourceId: resumeId.toString(),
      metadata: { error: err.message },
    });

    throw err; // Allow BullMQ to handle retry if within attempt limit
  } finally {
    // Clean up temporary file if generated from remote storage
    if (tempFilePath && tempFilePath.includes('temp_')) {
      try {
        if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
      } catch {}
    }
    // Release Distributed Lock
    await distributedLock.release(lockKey, lockToken);
  }
};

const initWorker = () => {
  const redisClient = getRedisClient();

  const worker = new Worker(QUEUES.RESUME_ANALYSIS, processResumeJob, {
    connection: redisClient,
    concurrency: env.WORKER_CONCURRENCY,
    lockDuration: 60000,
  });

  worker.on('ready', () => {
    logger.info({ concurrency: env.WORKER_CONCURRENCY }, 'BullMQ Resume Worker ready');
  });

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'BullMQ job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'BullMQ job failed');
  });

  worker.on('error', (err) => {
    logger.error({ err: err.message }, 'BullMQ worker internal error');
  });

  return worker;
};

module.exports = {
  initWorker,
  processResumeJob,
};
