/**
 * SavedJob Data Access Repository
 */

const SavedJob = require('../models/SavedJob');

class SavedJobRepository {
  async save(userId, jobId) {
    return SavedJob.findOneAndUpdate(
      { userId, jobId },
      { userId, jobId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async remove(userId, jobId) {
    return SavedJob.findOneAndDelete({ userId, jobId });
  }

  async isSaved(userId, jobId) {
    const record = await SavedJob.findOne({ userId, jobId }).select('_id').lean();
    return !!record;
  }

  async findByUserId(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [saved, total] = await Promise.all([
      SavedJob.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('jobId')
        .lean(),
      SavedJob.countDocuments({ userId }),
    ]);

    return {
      savedJobs: saved.map((s) => s.jobId).filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findSavedJobIds(userId) {
    const records = await SavedJob.find({ userId }).select('jobId').lean();
    return records.map((r) => r.jobId.toString());
  }
}

module.exports = new SavedJobRepository();
