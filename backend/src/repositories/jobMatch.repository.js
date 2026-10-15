/**
 * JobMatch Data Access Repository
 */

const JobMatch = require('../models/JobMatch');

class JobMatchRepository {
  async upsertMatch(data) {
    return JobMatch.findOneAndUpdate(
      { resumeId: data.resumeId, jobId: data.jobId },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async upsertMany(matches) {
    const bulkOps = matches.map((m) => ({
      updateOne: {
        filter: { resumeId: m.resumeId, jobId: m.jobId },
        update: { $set: m },
        upsert: true,
      },
    }));
    return JobMatch.bulkWrite(bulkOps);
  }

  async findByResumeId(resumeId, { page = 1, limit = 20, minScore = 0 } = {}) {
    const query = { resumeId };
    if (minScore > 0) {
      query.matchPercentage = { $gte: minScore };
    }

    const skip = (page - 1) * limit;

    const [matches, total] = await Promise.all([
      JobMatch.find(query)
        .sort({ matchPercentage: -1 })
        .skip(skip)
        .limit(limit)
        .populate('jobId')
        .lean(),
      JobMatch.countDocuments(query),
    ]);

    return {
      matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findTopMatchesByResumeId(resumeId, limit = 5) {
    return JobMatch.find({ resumeId })
      .sort({ matchPercentage: -1 })
      .limit(limit)
      .populate('jobId')
      .lean();
  }

  async deleteByResumeId(resumeId) {
    return JobMatch.deleteMany({ resumeId });
  }
}

module.exports = new JobMatchRepository();
