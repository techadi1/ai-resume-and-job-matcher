/**
 * JobMatch Mongoose Model
 */

const mongoose = require('mongoose');

const JobMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    similarityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    skillScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    experienceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    matchingKeywords: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    algorithmVersion: {
      type: String,
      default: 'v1.0',
    },
  },
  {
    timestamps: true,
  }
);

JobMatchSchema.index({ resumeId: 1, jobId: 1 }, { unique: true });
JobMatchSchema.index({ userId: 1, matchPercentage: -1 });
JobMatchSchema.index({ resumeId: 1, matchPercentage: -1 });

module.exports = mongoose.model('JobMatch', JobMatchSchema);
