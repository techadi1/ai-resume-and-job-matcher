/**
 * Job Routes (/api/v1/jobs)
 */

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const savedJobController = require('../controllers/savedJob.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { ROLES } = require('../constants');

// Public catalog search
router.get('/', (req, res, next) => jobController.getJobs(req, res, next));

// Authenticated recommendations & saved jobs
router.get('/recommended', requireAuth, (req, res, next) => jobController.getRecommendedJobs(req, res, next));
router.get('/saved', requireAuth, (req, res, next) => savedJobController.getSavedJobs(req, res, next));
router.get('/saved/ids', requireAuth, (req, res, next) => savedJobController.getSavedJobIds(req, res, next));

// Single job details
router.get('/:id', (req, res, next) => jobController.getJobById(req, res, next));

// Save / Bookmark operations
router.post('/:id/save', requireAuth, (req, res, next) => savedJobController.saveJob(req, res, next));
router.delete('/:id/save', requireAuth, (req, res, next) => savedJobController.removeSavedJob(req, res, next));

// Admin CRUD Endpoints
router.post('/', requireAuth, requireRole(ROLES.ADMIN), (req, res, next) => jobController.createJob(req, res, next));
router.patch('/:id', requireAuth, requireRole(ROLES.ADMIN), (req, res, next) => jobController.updateJob(req, res, next));
router.delete('/:id', requireAuth, requireRole(ROLES.ADMIN), (req, res, next) => jobController.deactivateJob(req, res, next));

module.exports = router;
