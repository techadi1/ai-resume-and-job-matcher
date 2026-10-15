/**
 * Job Data Access Repository
 */

const Job = require('../models/Job');

class JobRepository {
  async findById(id) {
    return Job.findById(id).lean();
  }

  async findActive(filter = {}, { page = 1, limit = 20, sort = { postedAt: -1 } } = {}) {
    const query = { isActive: { $ne: false }, ...filter };
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Job.countDocuments(query),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Scalable Candidate Pre-filtering:
   * Selects up to candidateLimit (default 300) most relevant active jobs
   * based on matching technical skills, title keywords, or location.
   */
  async findCandidateJobs({ skills = [], location = '', jobType = '', limit = 300 } = {}) {
    const query = { isActive: { $ne: false } };

    const orConditions = [];

    if (skills && skills.length > 0) {
      // Find jobs that require at least one of the resume's skills
      orConditions.push({ requiredSkills: { $in: skills } });
    }

    if (location) {
      orConditions.push({ location: { $regex: location, $options: 'i' } });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    // Fetch candidate jobs with lean projection
    const candidates = await Job.find(query)
      .sort({ postedAt: -1 })
      .limit(limit)
      .lean();

    // If query returned too few due to narrow skills, supplement with recent active jobs
    if (candidates.length < 50) {
      const recent = await Job.find({ isActive: { $ne: false } })
        .sort({ postedAt: -1 })
        .limit(50)
        .lean();
      
      const candidateIds = new Set(candidates.map((j) => j._id.toString()));
      for (const j of recent) {
        if (!candidateIds.has(j._id.toString())) {
          candidates.push(j);
        }
      }
    }

    return candidates;
  }

  async create(data) {
    return Job.create(data);
  }

  async updateById(id, updateData) {
    return Job.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deactivateById(id) {
    return Job.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async count(query = {}) {
    return Job.countDocuments(query);
  }
}

module.exports = new JobRepository();
