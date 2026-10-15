const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      default: 'Full-time'
    },
    salary: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    responsibilities: {
      type: [String],
      default: []
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true
    },
    preferredSkills: {
      type: [String],
      default: []
    },
    experience: {
      type: String,
      default: ''
    },
    education: {
      type: String,
      default: ''
    },
    applicationUrl: {
      type: String,
      default: ''
    },
    postedDate: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Full-text search index for searching jobs by title, company, description, and skills
JobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text'
});

module.exports = mongoose.model('Job', JobSchema);
