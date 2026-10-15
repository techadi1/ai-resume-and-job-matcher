const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      default: 0
    },
    candidateName: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    linkedin: {
      type: String,
      default: null
    },
    github: {
      type: String,
      default: null
    },
    extractedText: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: String,
      default: ''
    },
    experience: {
      type: String,
      default: ''
    },
    projects: {
      type: String,
      default: ''
    },
    certifications: {
      type: String,
      default: ''
    },
    resumeScore: {
      type: Number,
      default: 0
    },
    analysisStatus: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'UPLOADED',
      index: true
    },
    analysisResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);
