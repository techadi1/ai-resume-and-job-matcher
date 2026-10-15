/**
 * Resume Routes (/api/v1/resumes)
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// All resume routes require authentication
router.use(requireAuth);

// Support both 'resume' and 'file' multipart field names
const uploadFlexible = (req, res, next) => {
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      req.file = (req.files.resume && req.files.resume[0]) || (req.files.file && req.files.file[0]) || null;
    }
    next();
  });
};

router.post(
  '/upload',
  uploadLimiter,
  uploadFlexible,
  (req, res, next) => resumeController.upload(req, res, next)
);

router.get('/', (req, res, next) => resumeController.getResumes(req, res, next));
router.get('/:id', (req, res, next) => resumeController.getResumeById(req, res, next));
router.get('/:id/status', (req, res, next) => resumeController.getStatus(req, res, next));
router.get('/:id/analysis', (req, res, next) => resumeController.getAnalysis(req, res, next));
router.post('/:id/reanalyze', uploadLimiter, (req, res, next) => resumeController.reanalyze(req, res, next));
router.delete('/:id', (req, res, next) => resumeController.deleteResume(req, res, next));

module.exports = router;
