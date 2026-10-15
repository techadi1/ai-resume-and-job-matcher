/**
 * SavedJob Mongoose Model
 */

const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index prevents a user from saving the same job multiple times
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);
