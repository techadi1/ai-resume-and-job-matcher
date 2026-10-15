const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getUserResumes,
  getResumeById,
  getResumeStatus,
  getResumeAnalysis,
  getResumeSkillGap,
  deleteResume
} = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Support both 'file' and 'resume' field name
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size limit exceeded. Maximum file size is 10MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      // Try 'resume' field name if 'file' was not provided
      upload.single('resume')(req, res, (err2) => {
        if (err2) {
          return res.status(400).json({
            success: false,
            message: err2.message
          });
        }
        next();
      });
    } else {
      next();
    }
  });
};

router.post('/upload', authenticate, uploadLimiter, uploadMiddleware, uploadResume);
router.get('/', authenticate, getUserResumes);
router.get('/:id', authenticate, getResumeById);
router.get('/:id/status', authenticate, getResumeStatus);
router.get('/:id/analysis', authenticate, getResumeAnalysis);
router.get('/:id/skill-gap', authenticate, getResumeSkillGap);
router.delete('/:id', authenticate, deleteResume);

module.exports = router;
