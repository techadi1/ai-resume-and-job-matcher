/**
 * Job Mongoose Model
 */

const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobType: {
      type: String,
      default: 'Full-time',
    },
    workMode: {
      type: String,
      default: 'Hybrid',
    },
    salary: {
      type: String,
      default: '',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      required: true,
      index: true,
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: '1-3 years',
    },
    experienceMin: {
      type: Number,
      default: 0,
    },
    experienceMax: {
      type: Number,
      default: 10,
    },
    education: {
      type: String,
      default: "Bachelor's Degree in Computer Science or related field",
    },
    applicationUrl: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'Direct Company Listing',
    },
    sourceJobId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for fast candidate searching
JobSchema.index({ isActive: 1, postedAt: -1 });
JobSchema.index({ requiredSkills: 1, isActive: 1 });
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', JobSchema);
