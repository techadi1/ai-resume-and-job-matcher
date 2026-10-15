/**
 * Job Service (Job Catalog, Matching, and Admin Controls)
 */

const jobRepo = require('../repositories/job.repository');
const jobMatchRepo = require('../repositories/jobMatch.repository');
const resumeRepo = require('../repositories/resume.repository');
const auditRepo = require('../repositories/auditLog.repository');
const cacheService = require('./cache.service');
const { CACHE_KEYS, AUDIT_ACTIONS } = require('../constants');
const { NotFoundError } = require('../errors/AppError');

class JobService {
  async getJobs({ page = 1, limit = 20, search, location, jobType, skill }) {
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (jobType) {
      filter.jobType = jobType;
    }
    if (skill) {
      filter.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    return jobRepo.findActive(filter, { page, limit });
  }

  async getJobById(jobId) {
    const cacheKey = CACHE_KEYS.JOB_DETAIL(jobId);

    const { data: job } = await cacheService.wrap(
      cacheKey,
      async () => {
        const doc = await jobRepo.findById(jobId);
        if (!doc) {
          throw new NotFoundError('Job listing not found');
        }
        return doc;
      },
      3600 // 1 hour TTL
    );

    return job;
  }

  async getRecommendedJobs(userId, resumeId, { page = 1, limit = 20, minScore = 0 } = {}) {
    let targetResumeId = resumeId;

    if (!targetResumeId) {
      const latest = await resumeRepo.findLatestByUserId(userId);
      if (latest) {
        targetResumeId = latest._id.toString();
      }
    }

    if (!targetResumeId) {
      // If user has not uploaded any resume yet, return latest active jobs with 0 match
      const { jobs, pagination } = await jobRepo.findActive({}, { page, limit });
      return {
        targetResumeId: null,
        jobs: jobs.map((j) => ({
          ...j,
          matchPercentage: 0,
          similarityScore: 0,
          skillScore: 0,
          matchedSkills: [],
          missingSkills: j.requiredSkills,
        })),
        pagination,
      };
    }

    // Fetch precomputed matches from JobMatch collection
    const { matches, pagination } = await jobMatchRepo.findByResumeId(targetResumeId, {
      page,
      limit,
      minScore,
    });

    const formattedJobs = matches
      .filter((m) => m.jobId && m.jobId.isActive !== false)
      .map((m) => ({
        ...m.jobId,
        id: m.jobId._id ? m.jobId._id.toString() : m.jobId.id,
        matchPercentage: m.matchPercentage,
        similarityScore: m.similarityScore,
        skillScore: m.skillScore,
        experienceScore: m.experienceScore,
        matchedSkills: m.matchedSkills,
        missingSkills: m.missingSkills,
        matchingKeywords: m.matchingKeywords,
        recommendations: m.recommendations,
      }));

    return {
      targetResumeId,
      jobs: formattedJobs,
      pagination,
    };
  }

  async createJob(jobData, adminUserId) {
    const job = await jobRepo.create(jobData);

    await auditRepo.log({
      userId: adminUserId,
      action: AUDIT_ACTIONS.JOB_CREATED,
      resourceType: 'Job',
      resourceId: job._id.toString(),
      metadata: { title: job.title, company: job.company },
    });

    // Invalidate list caches
    await cacheService.delPattern('jobs:list:*');

    return job;
  }

  async updateJob(jobId, updateData, adminUserId) {
    const job = await jobRepo.updateById(jobId, updateData);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    await auditRepo.log({
      userId: adminUserId,
      action: AUDIT_ACTIONS.JOB_UPDATED,
      resourceType: 'Job',
      resourceId: jobId,
    });

    await cacheService.del(CACHE_KEYS.JOB_DETAIL(jobId));
    await cacheService.delPattern('jobs:list:*');

    return job;
  }

  async deactivateJob(jobId, adminUserId) {
    const job = await jobRepo.deactivateById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    await auditRepo.log({
      userId: adminUserId,
      action: AUDIT_ACTIONS.JOB_DEACTIVATED,
      resourceType: 'Job',
      resourceId: jobId,
    });

    await cacheService.del(CACHE_KEYS.JOB_DETAIL(jobId));
    await cacheService.delPattern('jobs:list:*');

    return { success: true, message: 'Job deactivated successfully' };
  }
}

module.exports = new JobService();
