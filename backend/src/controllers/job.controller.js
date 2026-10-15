/**
 * Job Controller
 */

const jobService = require('../services/job.service');
const { createJobSchema, updateJobSchema, queryJobsSchema } = require('../validators/job.validator');

class JobController {
  async getJobs(req, res, next) {
    try {
      const query = queryJobsSchema.parse(req.query);
      const result = await jobService.getJobs(query);

      return res.status(200).json({
        success: true,
        data: result.jobs,
        jobs: result.jobs,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobById(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id);

      return res.status(200).json({
        success: true,
        data: job,
        job,
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendedJobs(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const resumeId = req.query.resumeId || null;
      const minScore = parseFloat(req.query.minScore || '0');

      const result = await jobService.getRecommendedJobs(req.user._id, resumeId, {
        page,
        limit,
        minScore,
      });

      return res.status(200).json({
        success: true,
        targetResumeId: result.targetResumeId,
        data: result.jobs,
        jobs: result.jobs,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async createJob(req, res, next) {
    try {
      const validated = createJobSchema.parse(req.body);
      const job = await jobService.createJob(validated, req.user._id);

      return res.status(201).json({
        success: true,
        message: 'Job listing created successfully',
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateJob(req, res, next) {
    try {
      const validated = updateJobSchema.parse(req.body);
      const job = await jobService.updateJob(req.params.id, validated, req.user._id);

      return res.status(200).json({
        success: true,
        message: 'Job listing updated successfully',
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }

  async deactivateJob(req, res, next) {
    try {
      const result = await jobService.deactivateJob(req.params.id, req.user._id);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new JobController();
