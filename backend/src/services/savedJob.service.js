/**
 * Saved Job Service
 */

const savedJobRepo = require('../repositories/savedJob.repository');
const jobRepo = require('../repositories/job.repository');
const auditRepo = require('../repositories/auditLog.repository');
const { AUDIT_ACTIONS } = require('../constants');
const { NotFoundError } = require('../errors/AppError');

class SavedJobService {
  async saveJob(userId, jobId) {
    const job = await jobRepo.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const saved = await savedJobRepo.save(userId, jobId);

    await auditRepo.log({
      userId,
      action: AUDIT_ACTIONS.JOB_SAVED,
      resourceType: 'Job',
      resourceId: jobId,
    });

    return { success: true, message: 'Job saved successfully', saved };
  }

  async removeSavedJob(userId, jobId) {
    await savedJobRepo.remove(userId, jobId);
    return { success: true, message: 'Job removed from saved list' };
  }

  async getSavedJobs(userId, pagination) {
    return savedJobRepo.findByUserId(userId, pagination);
  }

  async getSavedJobIds(userId) {
    return savedJobRepo.findSavedJobIds(userId);
  }
}

module.exports = new SavedJobService();
