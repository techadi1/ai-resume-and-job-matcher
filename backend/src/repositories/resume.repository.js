/**
 * Resume Data Access Repository
 */

const Resume = require('../models/Resume');

class ResumeRepository {
  async findById(id) {
    return Resume.findById(id);
  }

  async findByIdAndUser(id, userId) {
    return Resume.findOne({ _id: id, userId });
  }

  async findByUserId(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [resumes, total] = await Promise.all([
      Resume.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-extractedText')
        .lean(),
      Resume.countDocuments({ userId }),
    ]);

    return {
      resumes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findLatestByUserId(userId) {
    return Resume.findOne({ userId }).sort({ createdAt: -1 });
  }

  async create(data) {
    return Resume.create(data);
  }

  async updateById(id, updateData) {
    return Resume.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteByIdAndUser(id, userId) {
    return Resume.findOneAndDelete({ _id: id, userId });
  }

  async countByUserId(userId) {
    return Resume.countDocuments({ userId });
  }
}

module.exports = new ResumeRepository();
