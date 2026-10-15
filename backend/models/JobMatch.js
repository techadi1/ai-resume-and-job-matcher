const mongoose = require('mongoose');

const JobMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    matchPercentage: {
      type: Number,
      required: true,
      index: true
    },
    similarityScore: {
      type: Number,
      default: 0
    },
    skillScore: {
      type: Number,
      default: 0
    },
    experienceScore: {
      type: Number,
      default: 0
    },
    matchedSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    missingRequiredSkills: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee uniqueness per resume-job pair
JobMatchSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('JobMatch', JobMatchSchema);
