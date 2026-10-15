/**
 * Resume Mongoose Model
 */

const mongoose = require('mongoose');
const { RESUME_STATUS, STORAGE_PROVIDERS } = require('../constants');

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    candidateName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    github: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storageProvider: {
      type: String,
      enum: Object.values(STORAGE_PROVIDERS),
      default: STORAGE_PROVIDERS.LOCAL,
    },
    storageKey: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    experience: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    projects: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    certifications: {
      type: [String],
      default: [],
    },
    resumeScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    analysisStatus: {
      type: String,
      enum: Object.values(RESUME_STATUS),
      default: RESUME_STATUS.UPLOADED,
      index: true,
    },
    analysisVersion: {
      type: Number,
      default: 1,
    },
    analysisStartedAt: {
      type: Date,
      default: null,
    },
    analysisCompletedAt: {
      type: Date,
      default: null,
    },
    analysisError: {
      type: String,
      default: null,
    },
    analysisResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ userId: 1, createdAt: -1 });
ResumeSchema.index({ analysisStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
