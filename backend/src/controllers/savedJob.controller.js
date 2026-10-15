/**
 * Saved Job Controller
 */

const savedJobService = require('../services/savedJob.service');

class SavedJobController {
  async saveJob(req, res, next) {
    try {
      const jobId = req.params.id;
      const result = await savedJobService.saveJob(req.user._id, jobId);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async removeSavedJob(req, res, next) {
    try {
      const jobId = req.params.id;
      const result = await savedJobService.removeSavedJob(req.user._id, jobId);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSavedJobs(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);

      const result = await savedJobService.getSavedJobs(req.user._id, { page, limit });

      return res.status(200).json({
        success: true,
        data: result.savedJobs,
        jobs: result.savedJobs,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSavedJobIds(req, res, next) {
    try {
      const ids = await savedJobService.getSavedJobIds(req.user._id);

      return res.status(200).json({
        success: true,
        data: ids,
        savedIds: ids,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SavedJobController();
