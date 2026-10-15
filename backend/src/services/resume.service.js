/**
 * Resume Service (Asynchronous Processing & Management)
 */

const resumeRepo = require('../repositories/resume.repository');
const jobMatchRepo = require('../repositories/jobMatch.repository');
const auditRepo = require('../repositories/auditLog.repository');
const storageService = require('./storage.service');
const cacheService = require('./cache.service');
const { addResumeAnalysisJob } = require('../queues/resume.queue');
const { RESUME_STATUS, AUDIT_ACTIONS, CACHE_KEYS } = require('../constants');
const { NotFoundError, AuthorizationError } = require('../errors/AppError');
const logger = require('../utils/logger');

class ResumeService {
  async uploadAndQueue({ userId, file }) {
    // 1. Upload file using storage abstraction (Local or Azure Blob)
    const { storageKey, storageProvider } = await storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // 2. Create Resume record with QUEUED status
    const resume = await resumeRepo.create({
      userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      storageProvider,
      storageKey,
      analysisStatus: RESUME_STATUS.QUEUED,
      analysisVersion: 1,
    });

    // 3. Queue asynchronous background processing job in BullMQ
    await addResumeAnalysisJob({
      resumeId: resume._id.toString(),
      userId: userId.toString(),
      analysisVersion: 1,
    });

    // 4. Audit Log
    await auditRepo.log({
      userId,
      action: AUDIT_ACTIONS.RESUME_UPLOADED,
      resourceType: 'Resume',
      resourceId: resume._id.toString(),
      metadata: { fileName: file.originalname, size: file.size },
    });

    logger.info({ resumeId: resume._id, userId }, 'Resume uploaded and analysis queued');

    // 5. Invalidate Dashboard Cache
    await cacheService.del(CACHE_KEYS.DASHBOARD_SUMMARY(userId));

    return {
      resumeId: resume._id,
      fileName: resume.fileName,
      status: RESUME_STATUS.QUEUED,
      createdAt: resume.createdAt,
    };
  }

  async getUserResumes(userId, { page = 1, limit = 20 } = {}) {
    return resumeRepo.findByUserId(userId, { page, limit });
  }

  async getResumeById(resumeId, userId) {
    const resume = await resumeRepo.findById(resumeId);
    if (!resume) {
      throw new NotFoundError('Resume not found');
    }
    if (resume.userId.toString() !== userId.toString()) {
      throw new AuthorizationError('You do not have permission to view this resume');
    }
    return resume;
  }

  async getResumeStatus(resumeId, userId) {
    const resume = await this.getResumeById(resumeId, userId);
    return {
      resumeId: resume._id,
      fileName: resume.fileName,
      status: resume.analysisStatus,
      score: resume.resumeScore,
      error: resume.analysisError,
      updatedAt: resume.updatedAt,
    };
  }

  async getResumeAnalysis(resumeId, userId) {
    const cacheKey = CACHE_KEYS.RESUME_ANALYSIS(resumeId);

    const { data: analysisData } = await cacheService.wrap(
      cacheKey,
      async () => {
        const resume = await this.getResumeById(resumeId, userId);
        const topMatches = await jobMatchRepo.findTopMatchesByResumeId(resumeId, 10);

        const analysis = {
          overallScore: resume.resumeScore || 0,
          scoreBreakdown: resume.analysisResult?.scoreBreakdown || {},
          strengths: resume.analysisResult?.strengths || [],
          weaknesses: resume.analysisResult?.weaknesses || [],
          recommendations: resume.analysisResult?.recommendations || [],
          keywords: resume.analysisResult?.keywords || [],
        };

        const resumeFormatted = {
          id: resume._id,
          _id: resume._id,
          fileName: resume.fileName,
          candidateName: resume.candidateName,
          email: resume.email,
          phone: resume.phone,
          linkedin: resume.linkedin,
          github: resume.github,
          skills: resume.skills || [],
          education: resume.education,
          experience: resume.experience,
          projects: resume.projects,
          certifications: resume.certifications || [],
          extractedText: resume.extractedText || '',
          resumeScore: resume.resumeScore || 0,
          status: resume.analysisStatus,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
          analysisResult: resume.analysisResult,
        };

        return {
          resume: resumeFormatted,
          analysis,
          topMatches: topMatches || [],
          resumeId: resume._id,
          fileName: resume.fileName,
          status: resume.analysisStatus,
          score: resume.resumeScore,
          skills: resume.skills,
          extractedText: resume.extractedText,
          analysisResult: resume.analysisResult,
          createdAt: resume.createdAt,
          completedAt: resume.analysisCompletedAt,
        };
      },
      1800 // 30 mins TTL
    );

    return analysisData;
  }

  async reanalyze(resumeId, userId) {
    const resume = await this.getResumeById(resumeId, userId);
    const nextVersion = (resume.analysisVersion || 1) + 1;

    // Reset status and increment version
    await resumeRepo.updateById(resumeId, {
      analysisStatus: RESUME_STATUS.QUEUED,
      analysisVersion: nextVersion,
      analysisError: null,
    });

    // Invalidate stale caches
    await Promise.all([
      cacheService.del(CACHE_KEYS.RESUME_ANALYSIS(resumeId)),
      cacheService.del(CACHE_KEYS.RESUME_RECOMMENDATIONS(resumeId)),
      cacheService.del(CACHE_KEYS.RESUME_SKILL_GAP(resumeId)),
      cacheService.del(CACHE_KEYS.DASHBOARD_SUMMARY(userId)),
    ]);

    // Enqueue new job
    await addResumeAnalysisJob({
      resumeId: resume._id.toString(),
      userId: userId.toString(),
      analysisVersion: nextVersion,
    });

    return {
      resumeId: resume._id,
      status: RESUME_STATUS.QUEUED,
      analysisVersion: nextVersion,
      message: 'Resume re-analysis queued successfully',
    };
  }

  async deleteResume(resumeId, userId) {
    const resume = await this.getResumeById(resumeId, userId);

    // Delete stored file
    await storageService.delete(resume.storageKey);

    // Remove job matches for this resume
    await jobMatchRepo.deleteByResumeId(resumeId);

    // Delete database document
    await resumeRepo.deleteByIdAndUser(resumeId, userId);

    // Invalidate caches
    await Promise.all([
      cacheService.del(CACHE_KEYS.RESUME_ANALYSIS(resumeId)),
      cacheService.del(CACHE_KEYS.RESUME_RECOMMENDATIONS(resumeId)),
      cacheService.del(CACHE_KEYS.RESUME_SKILL_GAP(resumeId)),
      cacheService.del(CACHE_KEYS.DASHBOARD_SUMMARY(userId)),
    ]);

    return { success: true, message: 'Resume deleted successfully' };
  }
}

module.exports = new ResumeService();
